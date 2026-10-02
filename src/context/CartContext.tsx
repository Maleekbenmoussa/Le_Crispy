'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, MenuItem, ServiceMode, Address } from '@/types';

export interface AppliedPromo {
  code: string;
  label: string;
  discountType: 'percentage' | 'free_item' | 'free_delivery';
  discountValue?: number;
  freeItemName?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: MenuItem, quantity?: number, notes?: string) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  serviceMode: ServiceMode;
  setServiceMode: (mode: ServiceMode) => void;
  tableNumber: string;
  setTableNumber: (table: string) => void;
  pickupTime: string;
  setPickupTime: (time: string) => void;
  deliveryAddress: Address | null;
  setDeliveryAddress: (address: Address | null) => void;
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  total: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  appliedPromo: AppliedPromo | null;
  applyPromo: (codeStr: string) => Promise<{ success: boolean; message: string }>;
  removePromo: () => void;
  activateTable: (tableNum: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [serviceMode, setServiceMode] = useState<ServiceMode>('sur_place');
  const [tableNumber, setTableNumber] = useState<string>('07');
  const [pickupTime, setPickupTime] = useState<string>('19:45');
  const [deliveryAddress, setDeliveryAddress] = useState<Address | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);

  // Load saved cart from localStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('or_noir_cart');
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
      const savedPromo = localStorage.getItem('le_crispy_applied_promo');
      if (savedPromo) {
        setAppliedPromo(JSON.parse(savedPromo));
      }
      const savedTable = localStorage.getItem('le_crispy_table_number');
      if (savedTable) {
        setTableNumber(savedTable);
      }
      const savedMode = localStorage.getItem('le_crispy_service_mode');
      if (savedMode && (savedMode === 'sur_place' || savedMode === 'a_emporter' || savedMode === 'livraison')) {
        setServiceMode(savedMode as ServiceMode);
      }
    } catch {
      // Ignore fallback
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('or_noir_cart', JSON.stringify(items));
  }, [items]);

  // Save promo to localStorage
  useEffect(() => {
    if (appliedPromo) {
      localStorage.setItem('le_crispy_applied_promo', JSON.stringify(appliedPromo));
    } else {
      localStorage.removeItem('le_crispy_applied_promo');
    }
  }, [appliedPromo]);

  const addItem = (product: MenuItem, quantity = 1, notes?: string) => {
    setItems(prev => {
      const existingIndex = prev.findIndex(item => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        if (notes) updated[existingIndex].notes = notes;
        return updated;
      }
      return [...prev, { product, quantity, notes }];
    });
    setIsCartOpen(true);
  };

  const removeItem = (productId: string) => {
    setItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedPromo(null);
  };

  const applyPromo = async (codeStr: string): Promise<{ success: boolean; message: string }> => {
    const clean = codeStr.trim().toUpperCase();
    if (!clean) {
      return { success: false, message: 'Veuillez saisir un code.' };
    }

    try {
      const res = await fetch('/api/chance/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: clean }),
      });
      const data = await res.json();

      if (!res.ok || !data.isValid) {
        return { success: false, message: data.error || 'Code invalide ou expiré.' };
      }

      const p = data.promo;
      const newPromo: AppliedPromo = {
        code: p.code,
        label: p.rewardLabel,
        discountType: p.discountType,
        discountValue: p.discountValue,
        freeItemName: p.freeItemName,
      };

      setAppliedPromo(newPromo);
      return { success: true, message: `Code ${p.code} appliqué : ${p.rewardLabel}` };
    } catch {
      return { success: false, message: 'Erreur lors de la validation du code.' };
    }
  };

  const removePromo = () => {
    setAppliedPromo(null);
  };

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const rawDeliveryFee = serviceMode === 'livraison' && subtotal > 0 ? 3.50 : 0;
  
  // Calculate discount
  let discountAmount = 0;
  let deliveryFee = rawDeliveryFee;

  if (appliedPromo) {
    if (appliedPromo.discountType === 'percentage' && appliedPromo.discountValue) {
      discountAmount = (subtotal * appliedPromo.discountValue) / 100;
    } else if (appliedPromo.discountType === 'free_delivery') {
      deliveryFee = 0;
      discountAmount = rawDeliveryFee;
    }
  }

  const total = Math.max(0, subtotal - (appliedPromo?.discountType === 'percentage' ? discountAmount : 0) + deliveryFee);

  const activateTable = (tableNum: string) => {
    const trimmed = tableNum.trim();
    const formatted = trimmed.toLowerCase().startsWith('table') 
      ? trimmed 
      : `Table ${trimmed}`;
    setTableNumber(formatted);
    setServiceMode('sur_place');
    try {
      localStorage.setItem('le_crispy_table_number', formatted);
      localStorage.setItem('le_crispy_service_mode', 'sur_place');
    } catch {}
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        serviceMode,
        setServiceMode,
        tableNumber,
        setTableNumber,
        pickupTime,
        setPickupTime,
        deliveryAddress,
        setDeliveryAddress,
        subtotal,
        deliveryFee,
        discountAmount,
        total,
        isCartOpen,
        setIsCartOpen,
        appliedPromo,
        applyPromo,
        removePromo,
        activateTable,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
