export interface RewardDefinition {
  id: string;
  label: string;
  shortLabel: string;
  discountType: 'percentage' | 'free_item' | 'free_delivery';
  discountValue?: number;
  freeItemName?: string;
  color: string;
  textColor: string;
  icon: string;
  prefix: string;
}

export const CHANCE_REWARDS: RewardDefinition[] = [
  {
    id: '10_percent',
    label: '-10% sur votre commande',
    shortLabel: '-10%',
    discountType: 'percentage',
    discountValue: 10,
    color: '#C9A24A', // Gourmet Gold
    textColor: '#0D1F14',
    icon: '🎟️',
    prefix: 'WIN10',
  },
  {
    id: 'free_drink',
    label: 'Boisson offerte',
    shortLabel: 'Boisson Offerte',
    discountType: 'free_item',
    freeItemName: 'Boisson 33cl au choix',
    color: '#059669', // Emerald
    textColor: '#FFFFFF',
    icon: '🥤',
    prefix: 'BOISSON',
  },
  {
    id: '15_percent',
    label: '-15% sur votre commande',
    shortLabel: '-15%',
    discountType: 'percentage',
    discountValue: 15,
    color: '#D97706', // Warm Amber
    textColor: '#FFFFFF',
    icon: '🎟️',
    prefix: 'WIN15',
  },
  {
    id: 'free_fries',
    label: 'Frites offertes',
    shortLabel: 'Frites Offertes',
    discountType: 'free_item',
    freeItemName: 'Portion de Frites Maison Croustillantes',
    color: '#DC2626', // Warm Red
    textColor: '#FFFFFF',
    icon: '🍟',
    prefix: 'FRITES',
  },
  {
    id: '20_percent',
    label: '-20% sur votre commande',
    shortLabel: '-20%',
    discountType: 'percentage',
    discountValue: 20,
    color: '#F59E0B', // Bright Gold
    textColor: '#0D1F14',
    icon: '🔥',
    prefix: 'WIN20',
  },
  {
    id: 'free_delivery',
    label: 'Livraison gratuite',
    shortLabel: 'Livraison Gratuite',
    discountType: 'free_delivery',
    discountValue: 3.50,
    color: '#4F46E5', // Royal Indigo
    textColor: '#FFFFFF',
    icon: '🚚',
    prefix: 'LIVR',
  },
];

export interface PromoCode {
  id: string;
  code: string;
  rewardId: string;
  rewardLabel: string;
  discountType: 'percentage' | 'free_item' | 'free_delivery';
  discountValue?: number;
  freeItemName?: string;
  customerContact?: string;
  createdAt: string;
  expiresAt: string;
  isUsed: boolean;
  usedAt?: string;
  clientIp?: string;
}

export interface GameSettings {
  isGameActive: boolean;
  probabilities: Record<string, number>;
  codeValidityHours: number;
}
