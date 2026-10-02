import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { MOCK_MENU, RESTAURANT_INFO } from '@/data/mockData';
import axios from 'axios';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, messages, language = 'fr' } = body;

    const userMessage = message || (messages && messages[messages.length - 1]?.content) || '';

    // 1. Fetch menu items safely (from database or MOCK_MENU fallback)
    let menuItemsList: any[] = [];
    try {
      const dbItems = await db.menuItem.findMany();
      if (dbItems && dbItems.length > 0) {
        menuItemsList = dbItems.map(i => ({
          id: i.id,
          name: i.nameFr,
          price: i.price,
          description: i.descFr,
          calories: i.calories,
          protein: i.protein,
          spiceLevel: i.spiceLevel,
          isHealthy: i.isHealthy,
          image: (i as any).image || ''
        }));
      }
    } catch {
      // Database offline -> use rich MOCK_MENU
    }

    if (menuItemsList.length === 0) {
      menuItemsList = MOCK_MENU.map(i => ({
        id: i.id,
        name: i.name.fr,
        price: i.price,
        description: i.description.fr,
        calories: i.nutrition?.calories || (i as any).calories,
        protein: i.nutrition?.protein || (i as any).protein,
        spiceLevel: i.spiceLevel,
        isHealthy: i.isHealthy,
        image: i.image
      }));
    }

    const menuContextString = menuItemsList
      .slice(0, 30)
      .map(
        i =>
          `- ${i.name} (${i.price.toFixed(2)}€): ${i.description || ''} ${i.calories ? `| ${i.calories} kcal, ${i.protein || 0}g protéines` : ''} ${i.isHealthy ? '[Healthy]' : ''}`
      )
      .join('\n');

    const openRouterApiKey = process.env.OPENROUTER_API_KEY;

    const systemPrompt = `Tu es le Chef IA Concierge gastronomique du restaurant "Le Crispy" à Dormans.
Informations restaurant :
- Téléphone : ${RESTAURANT_INFO.phone} (09 56 07 00 91)
- Adresse : ${RESTAURANT_INFO.address} (1 rue Jean de Dormans, 51700 Dormans)
- Horaires : ${RESTAURANT_INFO.hours} (Ouvert 7j/7 de 11h00 à 23h00 Non Stop)
- Promo en cours : ${RESTAURANT_INFO.promo} (2 PIZZAS ACHETÉES = 1 PIZZA OFFERTE !)

Menu actuel et spécialités :
${menuContextString}

Directives :
1. Réponds avec courtoisie, élégance et gourmandise dans la langue demandée (${language === 'ar' ? 'Arabe' : language === 'en' ? 'Anglais' : 'Français'}).
2. Conseille des plats précis en donnant leur nom et leur prix exact.
3. Si le client a des questions sur les calories / protéines / diététique, mets en avant les plats Healthy.
4. Reste concis (2 à 4 phrases maximum) et chaleureux.`;

    // 2. Format history for OpenRouter
    const formattedMessages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
      { role: 'system', content: systemPrompt }
    ];

    if (Array.isArray(messages) && messages.length > 0) {
      messages.forEach((m: any) => {
        if (m.sender === 'user' || m.role === 'user') {
          formattedMessages.push({ role: 'user', content: m.text || m.content });
        } else if (m.sender === 'bot' || m.role === 'assistant') {
          formattedMessages.push({ role: 'assistant', content: m.text || m.content });
        }
      });
    } else if (userMessage) {
      formattedMessages.push({ role: 'user', content: userMessage });
    }

    // 3. Try primary models on OpenRouter
    const candidateModels = [
      'openai/gpt-4o-mini',
      'deepseek/deepseek-chat',
      'meta-llama/llama-3.3-70b-instruct'
    ];

    let botReply = '';

    for (const modelName of candidateModels) {
      try {
        const response = await axios.post(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            model: modelName,
            messages: formattedMessages,
            temperature: 0.7,
            max_tokens: 350
          },
          {
            headers: {
              'Authorization': `Bearer ${openRouterApiKey}`,
              'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:4242',
              'X-Title': 'Le Crispy Restaurant AI Concierge',
              'Content-Type': 'application/json'
            },
            timeout: 9000
          }
        );

        const content = response.data?.choices?.[0]?.message?.content;
        if (content) {
          botReply = content.trim();
          break;
        }
      } catch (err: any) {
        console.warn(`OpenRouter model ${modelName} failed:`, err?.response?.data || err.message);
      }
    }

    // 4. Intelligent contextual fallback if AI service is unreachable
    if (!botReply) {
      const lower = userMessage.toLowerCase();
      if (lower.includes('pizza')) {
        botReply = "Pour vos envies de pizzas, profitez de notre offre exclusive : 2 Pizzas achetées = 1 Pizza offerte ! Vous pouvez commander directement ou nous appeler au 09 56 07 00 91.";
      } else if (lower.includes('healthy') || lower.includes('calorie') || lower.includes('sport') || lower.includes('gym')) {
        botReply = "Pour vos objectifs diététiques, je vous suggère notre Salade Norvégienne (380 kcal, 28g protéines) ou notre Tagliatelle Saumon. Consultez aussi notre onglet Healthy & Gym !";
      } else if (lower.includes('krousty') || lower.includes('tenders') || lower.includes('kebab')) {
        botReply = "Notre Krousty Tenders maison à 10,90€ et notre Assiette Kebab à 12,00€ sont nos grands favoris croustillants du jour !";
      } else if (lower.includes('heure') || lower.includes('horaire') || lower.includes('ouvert') || lower.includes('ferme')) {
        botReply = "Le Crispy Dormans est ouvert 7 jours sur 7, de 11h00 à 23h00 Non Stop ! Sur place, à emporter ou en livraison.";
      } else {
        botReply = "Bienvenue chez Le Crispy Dormans ! Je vous recommande nos fameux Krousty Tenders (10,90€) ou nos Burgers Gourmets Wagyu. Que désirez-vous déguster aujourd'hui ?";
      }
    }

    // 5. Extract matching recommended product cards from MOCK_MENU
    const lowerReply = (botReply + ' ' + userMessage).toLowerCase();
    const recommended = MOCK_MENU.filter(item => {
      const name = item.name.fr.toLowerCase();
      return lowerReply.includes(name) || (name.includes('tenders') && lowerReply.includes('tenders')) || (name.includes('kebab') && lowerReply.includes('kebab'));
    }).slice(0, 2);

    const finalProducts = recommended.length > 0 ? recommended : MOCK_MENU.slice(0, 2);

    return NextResponse.json({
      reply: botReply,
      products: finalProducts
    });

  } catch (error: any) {
    console.error('Chatbot route global error:', error.message);
    return NextResponse.json({
      reply: "Bonjour ! Je suis le Chef IA Concierge du restaurant Le Crispy. Je vous recommande nos Krousty Tenders à 10,90€ et notre offre 2 Pizzas achetées = 1 Offerte. Que puis-je vous servir ?",
      products: MOCK_MENU.slice(0, 2)
    });
  }
}
