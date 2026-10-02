'use client';

import React, { useState } from 'react';
import { MenuItem } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { 
  X, 
  Plus, 
  Minus, 
  Clock, 
  Flame, 
  HeartPulse, 
  ShoppingBag, 
  Check, 
  Sparkles, 
  Utensils, 
  Wine, 
  Layers,
  ChefHat,
  MessageSquarePlus,
  Salad
} from 'lucide-react';

interface ProductDetailModalProps {
  product: MenuItem | null;
  onClose: () => void;
}

export default function ProductDetailModal({ product, onClose }: ProductDetailModalProps) {
  const { language, t } = useLanguage();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [customNotes, setCustomNotes] = useState('');

  // --- 1. SAUCES SELECTION (Radio/Choice) ---
  const SAUCE_OPTIONS = [
    { id: 'sauce-maison', label: 'Sauce Burger Le Crispy (Maison)', price: 0 },
    { id: 'sauce-algerienne', label: 'Sauce Algérienne Épicée', price: 0 },
    { id: 'sauce-samourai', label: 'Sauce Samouraï Piquante', price: 0 },
    { id: 'sauce-blanche', label: 'Sauce Blanche Ail & Fines Herbes', price: 0 },
    { id: 'sauce-chili-thai', label: 'Sauce Chili Thaï Douce', price: 0 },
    { id: 'sauce-bbq', label: 'Sauce Barbecue Fumée', price: 0 },
    { id: 'sauce-mayo', label: 'Sauce Mayonnaise', price: 0 },
    { id: 'sauce-ketchup', label: 'Sauce Ketchup', price: 0 },
    { id: 'sauce-fromagere', label: 'Sauce Fromagère Maison Fondante', price: 0.80 },
    { id: 'sauce-truffe', label: 'Sauce Truffe Noire Gastronomique', price: 1.50 },
    { id: 'sauce-none', label: 'Sans Sauce', price: 0 }
  ];
  const [selectedSauce, setSelectedSauce] = useState(SAUCE_OPTIONS[0]);

  // --- 2. GARNITURES & CRUDITÉS (Checkboxes to include/exclude) ---
  const SALAD_OPTIONS = [
    { id: 'laitue', label: 'Laitue Croquante Bio' },
    { id: 'tomates', label: 'Tomates Fraîches' },
    { id: 'oignons', label: 'Oignons Rouges Émincés' },
    { id: 'cornichons', label: 'Cornichons D-Pickles' },
    { id: 'oignons-frits', label: 'Oignons Frits Croustillants' }
  ];
  const [selectedSalads, setSelectedSalads] = useState<string[]>(['laitue', 'tomates', 'oignons', 'cornichons']);

  // --- 3. SUPPLÉMENTS GOURMANDS (Checkboxes with Price Modifiers) ---
  const EXTRA_OPTIONS = [
    { id: 'cheddar', label: 'Extra Double Cheddar Fondu', price: 1.00 },
    { id: 'bacon', label: 'Bacon de Dinde Grillé Croustillant', price: 1.50 },
    { id: 'oeuf', label: 'Œuf au Plat Coulant', price: 1.00 },
    { id: 'tenders', label: 'Tenders de Poulet Pané Extra (+1 pièce)', price: 2.00 },
    { id: 'steak', label: 'Steak Haché Façon Bouchère 180g Extra', price: 2.50 },
    { id: 'chevre', label: 'Fromage de Chèvre Chaud', price: 1.20 },
    { id: 'galette', label: 'Galette de Pomme de Terre Rösti', price: 1.50 },
    { id: 'jalapenos', label: 'Piments Jalapeños Rouges Épicés', price: 0.80 },
    { id: 'mozza', label: 'Mozzarella Râpée Gratinée Dorée', price: 1.50 }
  ];
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);

  // --- 4. CHOIX D'ACCOMPAGNEMENT ---
  const SIDE_OPTIONS = [
    { id: 'side-frites', label: 'Frites Fraîches Maison Dorées', price: 0 },
    { id: 'side-potatoes', label: 'Potatoes Épicées aux Herbes', price: 0.50 },
    { id: 'side-riz', label: 'Riz Parfumé aux Épices', price: 0.50 },
    { id: 'side-salade', label: 'Petite Salade Fraîche Assaisonnée', price: 0.50 },
    { id: 'side-none', label: 'Sans Accompagnement', price: 0 }
  ];
  const [selectedSide, setSelectedSide] = useState(SIDE_OPTIONS[0]);

  // --- 5. CHOIX DE LA BOISSON ---
  const DRINK_OPTIONS = [
    { id: 'drink-none', label: 'Sans Boisson', price: 0 },
    { id: 'drink-coca', label: 'Coca-Cola Original 33cl', price: 1.50 },
    { id: 'drink-coca-zero', label: 'Coca-Cola Zéro 33cl', price: 1.50 },
    { id: 'drink-oasis', label: 'Oasis Tropical 33cl', price: 1.50 },
    { id: 'drink-fanta', label: 'Fanta Orange 33cl', price: 1.50 },
    { id: 'drink-sprite', label: 'Sprite Citron 33cl', price: 1.50 },
    { id: 'drink-tropico', label: 'Tropico Exotique 33cl', price: 1.50 },
    { id: 'drink-eau', label: 'Eau Minérale Cristaline 50cl', price: 1.00 },
    { id: 'drink-coca-15l', label: 'Grande Bouteille Coca-Cola 1.5L', price: 3.50 },
    { id: 'drink-oasis-2l', label: 'Grande Bouteille Oasis 2 Litres', price: 4.00 }
  ];
  const [selectedDrink, setSelectedDrink] = useState(DRINK_OPTIONS[0]);

  if (!product) return null;

  const name = product.name[language] || product.name['fr'];
  const description = product.description[language] || product.description['fr'];

  // Calculate Extra Costs
  const extrasCost = selectedExtras.reduce((sum, extraId) => {
    const found = EXTRA_OPTIONS.find(e => e.id === extraId);
    return sum + (found ? found.price : 0);
  }, 0);

  const unitPrice = product.price + selectedSauce.price + extrasCost + selectedSide.price + selectedDrink.price;
  const totalPrice = unitPrice * quantity;

  // Toggle Checkbox Helpers
  const toggleSalad = (id: string) => {
    setSelectedSalads(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const toggleExtra = (id: string) => {
    setSelectedExtras(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]);
  };

  const handleAddToCart = () => {
    const saladLabels = selectedSalads.map(s => SALAD_OPTIONS.find(o => o.id === s)?.label).join(', ');
    const extraLabels = selectedExtras.map(e => EXTRA_OPTIONS.find(o => o.id === e)?.label).join(', ');

    const formattedNotes = [
      `Sauce: ${selectedSauce.label}`,
      saladLabels ? `Garnitures: ${saladLabels}` : 'Sans crudités',
      extraLabels ? `Suppléments: ${extraLabels}` : '',
      selectedSide.id !== 'side-none' ? `Accompagnement: ${selectedSide.label}` : '',
      selectedDrink.id !== 'drink-none' ? `Boisson: ${selectedDrink.label}` : '',
      customNotes ? `Note client: ${customNotes}` : ''
    ].filter(Boolean).join(' | ');

    // Add product to cart with modified price
    const customizedProduct = {
      ...product,
      price: unitPrice
    };

    addItem(customizedProduct, quantity, formattedNotes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-[var(--bg-secondary)] border border-[var(--border-gold)] rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(201,162,74,0.35)] max-h-[92vh] flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-black/60 text-white hover:text-[var(--accent-gold)] border border-[var(--border-gold)]/40 transition-colors backdrop-blur-md"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Hero Header Image */}
        <div className="relative h-48 sm:h-56 w-full overflow-hidden shrink-0">
          <img
            src={product.image}
            alt={name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-secondary)] via-black/40 to-black/60" />
          
          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
            <div className="space-y-1">
              <span className="px-2.5 py-0.5 rounded-full bg-[var(--accent-gold)] text-[#0d1f14] text-[10px] font-extrabold uppercase tracking-wider">
                {product.category}
              </span>
              <h2 className="font-gold text-2xl sm:text-3xl font-extrabold text-white drop-shadow-md">
                {name}
              </h2>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-amber-200/90 block font-mono">Unité: {unitPrice.toFixed(2)} €</span>
              <span className="font-gold font-extrabold text-2xl text-[var(--accent-gold)] drop-shadow-md">
                {totalPrice.toFixed(2)} €
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Customization Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-left text-xs">
          
          {/* Description */}
          <p className="text-[var(--text-secondary)] leading-relaxed text-xs">
            {description}
          </p>

          {/* Quick Badges Info */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-gold)] text-xs">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[var(--accent-gold)]" />
              <span className="text-[var(--text-primary)] font-medium">{product.preparationTimeMinutes} min de prép.</span>
            </div>
            {product.spiceLevel > 0 && (
              <div className="flex items-center gap-2 text-[var(--accent-warm)] font-bold">
                <Flame className="w-4 h-4 fill-[var(--accent-warm)]" />
                <span>Piquant: {product.spiceLevel}/3</span>
              </div>
            )}
            {product.isHealthy && (
              <div className="flex items-center gap-2 text-emerald-500 font-bold">
                <HeartPulse className="w-4 h-4" />
                <span>Gamme Healthy</span>
              </div>
            )}
          </div>

          {/* 1. CHOIX DE LA SAUCE (OBLIGATOIRE) */}
          <div className="space-y-3 pt-2 border-t border-[var(--border-gold)]/40">
            <div className="flex justify-between items-center">
              <h4 className="font-gold font-bold text-sm text-[var(--accent-gold)] flex items-center gap-1.5">
                <Utensils className="w-4 h-4" />
                <span>1. Choix de la Sauce (1 au choix)</span>
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-[var(--accent-gold)]/20 border border-[var(--accent-gold)]/50 text-[var(--accent-gold)] text-[10px] font-mono font-bold">
                Sauce Principale
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SAUCE_OPTIONS.map(sauce => {
                const isSelected = selectedSauce.id === sauce.id;
                return (
                  <button
                    key={sauce.id}
                    type="button"
                    onClick={() => setSelectedSauce(sauce)}
                    className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-[var(--accent-gold)]/20 border-[var(--accent-gold)] text-[var(--text-primary)] font-bold shadow-md'
                        : 'bg-[var(--bg-primary)] border-[var(--border-gold)]/40 text-[var(--text-primary)] hover:border-[var(--accent-gold)]/70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-[var(--accent-gold)] bg-[var(--accent-gold)] text-[#0d1f14]' : 'border-[var(--border-gold)]'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="text-left">{sauce.label}</span>
                    </div>
                    <span className="text-[10px] font-mono text-[var(--accent-gold)] font-bold shrink-0 ml-2">
                      {sauce.price > 0 ? `+${sauce.price.toFixed(2)} €` : 'Inclus'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. GARNITURES & CRUDITÉS (SALADE, TOMATES, OIGNONS) */}
          <div className="space-y-3 pt-2 border-t border-[var(--border-gold)]/40">
            <div className="flex justify-between items-center">
              <h4 className="font-gold font-bold text-sm text-[var(--accent-gold)] flex items-center gap-1.5">
                <Salad className="w-4 h-4" />
                <span>2. Garnitures & Crudités (Cocher / Décocher)</span>
              </h4>
              <span className="text-[10px] text-[var(--text-secondary)]">Personnalisez selon vos goûts</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SALAD_OPTIONS.map(salad => {
                const isSelected = selectedSalads.includes(salad.id);
                return (
                  <button
                    key={salad.id}
                    type="button"
                    onClick={() => toggleSalad(salad.id)}
                    className={`p-2.5 rounded-2xl border flex items-center justify-between text-xs transition-all ${
                      isSelected
                        ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400 font-bold'
                        : 'bg-[var(--bg-primary)] border-[var(--border-gold)]/40 text-[var(--text-secondary)] line-through opacity-70'
                    }`}
                  >
                    <span className="truncate">{salad.label}</span>
                    <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ml-1.5 ${
                      isSelected ? 'border-emerald-500 bg-emerald-500 text-black' : 'border-stone-500'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. SUPPLÉMENTS GOURMANDS (+ EXTRA) */}
          <div className="space-y-3 pt-2 border-t border-[var(--border-gold)]/40">
            <div className="flex justify-between items-center">
              <h4 className="font-gold font-bold text-sm text-[var(--accent-gold)] flex items-center gap-1.5">
                <Layers className="w-4 h-4" />
                <span>3. Suppléments Gourmands (+ Extra)</span>
              </h4>
              <span className="text-[10px] text-[var(--accent-gold)] font-mono">Optionnel</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {EXTRA_OPTIONS.map(extra => {
                const isSelected = selectedExtras.includes(extra.id);
                return (
                  <button
                    key={extra.id}
                    type="button"
                    onClick={() => toggleExtra(extra.id)}
                    className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-[var(--accent-gold)]/20 border-[var(--accent-gold)] text-[var(--text-primary)] font-bold shadow-md'
                        : 'bg-[var(--bg-primary)] border-[var(--border-gold)]/40 text-[var(--text-primary)] hover:border-[var(--accent-gold)]/70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                        isSelected ? 'border-[var(--accent-gold)] bg-[var(--accent-gold)] text-[#0d1f14]' : 'border-[var(--border-gold)]'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="text-left">{extra.label}</span>
                    </div>
                    <span className="text-[10px] font-mono text-[var(--accent-gold)] font-bold shrink-0 ml-2">
                      +{extra.price.toFixed(2)} €
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. CHOIX D'ACCOMPAGNEMENT */}
          <div className="space-y-3 pt-2 border-t border-[var(--border-gold)]/40">
            <div className="flex justify-between items-center">
              <h4 className="font-gold font-bold text-sm text-[var(--accent-gold)] flex items-center gap-1.5">
                <ChefHat className="w-4 h-4" />
                <span>4. Choix d'Accompagnement</span>
              </h4>
              <span className="text-[10px] text-[var(--text-secondary)]">Frites fraîches ou autre</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SIDE_OPTIONS.map(side => {
                const isSelected = selectedSide.id === side.id;
                return (
                  <button
                    key={side.id}
                    type="button"
                    onClick={() => setSelectedSide(side)}
                    className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-[var(--accent-gold)]/20 border-[var(--accent-gold)] text-[var(--text-primary)] font-bold shadow-md'
                        : 'bg-[var(--bg-primary)] border-[var(--border-gold)]/40 text-[var(--text-primary)] hover:border-[var(--accent-gold)]/70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-[var(--accent-gold)] bg-[var(--accent-gold)] text-[#0d1f14]' : 'border-[var(--border-gold)]'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="text-left">{side.label}</span>
                    </div>
                    <span className="text-[10px] font-mono text-[var(--accent-gold)] font-bold shrink-0 ml-2">
                      {side.price > 0 ? `+${side.price.toFixed(2)} €` : 'Inclus'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. CHOIX DE LA BOISSON (COMBO MEAL) */}
          <div className="space-y-3 pt-2 border-t border-[var(--border-gold)]/40">
            <div className="flex justify-between items-center">
              <h4 className="font-gold font-bold text-sm text-[var(--accent-gold)] flex items-center gap-1.5">
                <Wine className="w-4 h-4" />
                <span>5. Choix de la Boisson (Optionnel)</span>
              </h4>
              <span className="text-[10px] text-[var(--accent-gold)] font-mono">Canette ou Grande Bouteille</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DRINK_OPTIONS.map(drink => {
                const isSelected = selectedDrink.id === drink.id;
                return (
                  <button
                    key={drink.id}
                    type="button"
                    onClick={() => setSelectedDrink(drink)}
                    className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-[var(--accent-gold)]/20 border-[var(--accent-gold)] text-[var(--text-primary)] font-bold shadow-md'
                        : 'bg-[var(--bg-primary)] border-[var(--border-gold)]/40 text-[var(--text-primary)] hover:border-[var(--accent-gold)]/70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-[var(--accent-gold)] bg-[var(--accent-gold)] text-[#0d1f14]' : 'border-[var(--border-gold)]'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="text-left">{drink.label}</span>
                    </div>
                    <span className="text-[10px] font-mono text-[var(--accent-gold)] font-bold shrink-0 ml-2">
                      {drink.price > 0 ? `+${drink.price.toFixed(2)} €` : 'Inclus'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6. REMARQUES / DEMANDES SPÉCIALES */}
          <div className="space-y-2 pt-2 border-t border-[var(--border-gold)]/40">
            <label className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquarePlus className="w-4 h-4 text-[var(--accent-gold)]" />
              <span>6. Remarques / Instructions Spéciales pour la Cuisine</span>
            </label>
            <input
              type="text"
              value={customNotes}
              onChange={e => setCustomNotes(e.target.value)}
              placeholder="Ex: Sauce à part, sans oignons, bien cuit, pas trop salé..."
              className="w-full bg-[var(--bg-primary)] border border-[var(--border-gold)] rounded-2xl px-4 py-3 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/60 focus:outline-none focus:border-[var(--accent-gold)]"
            />
          </div>

        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-[var(--border-gold)] bg-[var(--bg-primary)] flex items-center justify-between gap-4">
          
          {/* Quantity Counter */}
          <div className="flex items-center gap-3 bg-[var(--bg-secondary)] border border-[var(--border-gold)] rounded-full px-3 py-1.5">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-1 text-[var(--accent-gold)] hover:text-[var(--accent-gold-light)]"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-bold text-sm text-[var(--text-primary)] px-2 font-mono">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-1 text-[var(--accent-gold)] hover:text-[var(--accent-gold-light)]"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Cart CTA Button */}
          <button
            onClick={handleAddToCart}
            className="flex-1 btn-gold py-3.5 text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(201,162,74,0.4)]"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Ajouter au Panier • {totalPrice.toFixed(2)} €</span>
          </button>

        </div>

      </div>
    </div>
  );
}
