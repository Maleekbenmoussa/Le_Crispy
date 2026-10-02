import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { MOCK_MENU } from '@/data/mockData';

export async function GET() {
  try {
    const items = await db.menuItem.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Format for frontend structure
    const formatted = items.map(item => ({
      id: item.id,
      name: { fr: item.nameFr, ar: item.nameAr, en: item.nameEn },
      description: { fr: item.descFr, ar: item.descAr, en: item.descEn },
      price: Number(item.price),
      category: item.category,
      image: item.image,
      spiceLevel: (item.spiceLevel ?? 0) as 0 | 1 | 2 | 3,
      isHealthy: Boolean(item.isHealthy),
      isPopular: Boolean(item.isPopular),
      isNew: Boolean(item.isNew),
      preparationTimeMinutes: item.preparationTimeMinutes ?? 10,
      nutrition: {
        calories: item.calories || 0,
        protein: Number(item.protein) || 0,
        carbs: Number(item.carbs) || 0,
        fat: Number(item.fat) || 0,
      },
      dietTags: (item.dietTags || []) as any[],
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('API Error /api/menu GET (Using Mock Fallback):', error);
    return NextResponse.json(MOCK_MENU);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const newItem = await db.menuItem.create({
      data: {
        id: body.id || crypto.randomUUID(),
        nameFr: body.nameFr || body.name?.fr || 'Nouveau Plat',
        nameAr: body.nameAr || body.name?.ar || 'طبق جديد',
        nameEn: body.nameEn || body.name?.en || 'New Dish',
        descFr: body.descFr || body.description?.fr || 'Description du plat',
        descAr: body.descAr || body.description?.ar || 'وصف الطبق',
        descEn: body.descEn || body.description?.en || 'Dish description',
        price: parseFloat(body.price),
        category: body.category || 'burgers',
        image: body.image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
        spiceLevel: body.spiceLevel || 0,
        isHealthy: body.isHealthy || false,
        isPopular: body.isPopular || false,
        isNew: body.isNew || true,
        preparationTimeMinutes: body.preparationTimeMinutes || 12,
        calories: body.calories || body.nutrition?.calories || 450,
        protein: body.protein || body.nutrition?.protein || 30,
        carbs: body.carbs || body.nutrition?.carbs || 40,
        fat: body.fat || body.nutrition?.fat || 20,
        dietTags: body.dietTags || [],
      },
    });

    return NextResponse.json({
      ...newItem,
      price: Number(newItem.price),
      protein: Number(newItem.protein) || 0,
      carbs: Number(newItem.carbs) || 0,
      fat: Number(newItem.fat) || 0,
    }, { status: 201 });
  } catch (error) {
    console.error('API Error /api/menu POST:', error);
    return NextResponse.json({ error: 'Failed to create menu item in PostgreSQL' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: 'Item ID required' }, { status: 400 });
    }

    const updatedItem = await db.menuItem.update({
      where: { id: body.id },
      data: {
        nameFr: body.nameFr || body.name?.fr,
        nameAr: body.nameAr || body.name?.ar,
        nameEn: body.nameEn || body.name?.en,
        descFr: body.descFr || body.description?.fr,
        descAr: body.descAr || body.description?.ar,
        descEn: body.descEn || body.description?.en,
        price: parseFloat(body.price),
        category: body.category,
        image: body.image,
        spiceLevel: body.spiceLevel,
        isHealthy: body.isHealthy,
        isPopular: body.isPopular,
        isNew: body.isNew,
        preparationTimeMinutes: body.preparationTimeMinutes,
        calories: body.calories || body.nutrition?.calories,
        protein: body.protein || body.nutrition?.protein,
        carbs: body.carbs || body.nutrition?.carbs,
        fat: body.fat || body.nutrition?.fat,
        dietTags: body.dietTags,
      },
    });

    return NextResponse.json({
      ...updatedItem,
      price: Number(updatedItem.price),
      protein: Number(updatedItem.protein) || 0,
      carbs: Number(updatedItem.carbs) || 0,
      fat: Number(updatedItem.fat) || 0,
    });
  } catch (error) {
    console.error('API Error /api/menu PUT:', error);
    return NextResponse.json({ error: 'Failed to update menu item in PostgreSQL' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Item ID required' }, { status: 400 });
    }

    await db.menuItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error /api/menu DELETE:', error);
    return NextResponse.json({ error: 'Failed to delete menu item' }, { status: 500 });
  }
}
