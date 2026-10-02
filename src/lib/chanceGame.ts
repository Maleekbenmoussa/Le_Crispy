import fs from 'fs';
import path from 'path';

import { RewardDefinition, CHANCE_REWARDS, PromoCode, GameSettings } from '@/types/chance';
export * from '@/types/chance';

const DEFAULT_SETTINGS: GameSettings = {
  isGameActive: true,
  probabilities: {
    '10_percent': 30,
    'free_drink': 20,
    '15_percent': 20,
    'free_fries': 15,
    'free_delivery': 10,
    '20_percent': 5,
  },
  codeValidityHours: 48,
};

// Initial mock promo codes for admin demonstration
const INITIAL_CODES: PromoCode[] = [
  {
    id: 'code-1',
    code: 'WIN15-X7K9',
    rewardId: '15_percent',
    rewardLabel: '-15% sur votre commande',
    discountType: 'percentage',
    discountValue: 15,
    customerContact: '06 12 34 56 78',
    createdAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
    expiresAt: new Date(Date.now() + 3600 * 1000 * 44).toISOString(),
    isUsed: false,
  },
  {
    id: 'code-2',
    code: 'FRITES-K3M8',
    rewardId: 'free_fries',
    rewardLabel: 'Frites offertes',
    discountType: 'free_item',
    freeItemName: 'Portion de Frites Maison Croustillantes',
    customerContact: 'client.gourmet@gmail.com',
    createdAt: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
    expiresAt: new Date(Date.now() + 3600 * 1000 * 36).toISOString(),
    isUsed: true,
    usedAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
  },
  {
    id: 'code-3',
    code: 'WIN20-H8R2',
    rewardId: '20_percent',
    rewardLabel: '-20% sur votre commande',
    discountType: 'percentage',
    discountValue: 20,
    customerContact: '07 89 45 12 00',
    createdAt: new Date(Date.now() - 3600 * 1000 * 20).toISOString(),
    expiresAt: new Date(Date.now() + 3600 * 1000 * 28).toISOString(),
    isUsed: false,
  },
];

interface StoreData {
  settings: GameSettings;
  codes: PromoCode[];
  spinsByIp: Record<string, number>; // IP/clientId -> timestamp
}

// In-memory cache + persistent fallback
let store: StoreData = {
  settings: { ...DEFAULT_SETTINGS },
  codes: [...INITIAL_CODES],
  spinsByIp: {},
};

const DATA_FILE = path.join(process.cwd(), '.chance-data.json');

function loadStore(): StoreData {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed && parsed.settings && parsed.codes) {
        store = parsed;
        return store;
      }
    }
  } catch (err) {
    console.warn('[ChanceGame] Failed to read .chance-data.json, using memory store:', err);
  }
  return store;
}

function saveStore(): void {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[ChanceGame] Failed to persist .chance-data.json:', err);
  }
}

// Initialize on module load
loadStore();

export function getGameSettings(): GameSettings {
  return store.settings;
}

export function updateGameSettings(newSettings: Partial<GameSettings>): GameSettings {
  if (typeof newSettings.isGameActive === 'boolean') {
    store.settings.isGameActive = newSettings.isGameActive;
  }
  if (newSettings.probabilities) {
    store.settings.probabilities = { ...store.settings.probabilities, ...newSettings.probabilities };
  }
  if (typeof newSettings.codeValidityHours === 'number') {
    store.settings.codeValidityHours = newSettings.codeValidityHours;
  }
  saveStore();
  return store.settings;
}

export function getAllPromoCodes(): PromoCode[] {
  return [...store.codes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function updatePromoCodeStatus(codeId: string, isUsed: boolean): PromoCode | null {
  const item = store.codes.find(c => c.id === codeId || c.code === codeId);
  if (!item) return null;
  item.isUsed = isUsed;
  item.usedAt = isUsed ? new Date().toISOString() : undefined;
  saveStore();
  return item;
}

export function deletePromoCode(codeId: string): boolean {
  const initialLen = store.codes.length;
  store.codes = store.codes.filter(c => c.id !== codeId && c.code !== codeId);
  if (store.codes.length !== initialLen) {
    saveStore();
    return true;
  }
  return false;
}

export function saveContactForCode(code: string, contact: string): PromoCode | null {
  const item = store.codes.find(c => c.code.toUpperCase() === code.toUpperCase().trim());
  if (!item) return null;
  item.customerContact = contact.trim();
  saveStore();
  return item;
}

export function checkCooldown(identifier: string): { canPlay: boolean; remainingHours?: number; existingCode?: PromoCode } {
  if (!identifier) return { canPlay: true };
  const lastSpinTime = store.spinsByIp[identifier];
  if (!lastSpinTime) return { canPlay: true };

  const elapsedMs = Date.now() - lastSpinTime;
  const cooldownMs = 24 * 3600 * 1000; // 24 hours cooldown

  if (elapsedMs < cooldownMs) {
    const remainingHours = Math.ceil((cooldownMs - elapsedMs) / (3600 * 1000));
    // Find the code generated for this identifier
    const existingCode = store.codes.find(c => c.clientIp === identifier && !c.isUsed);
    return { canPlay: false, remainingHours, existingCode };
  }

  return { canPlay: true };
}

// Generate random alphanumeric suffix: 4 chars uppercase e.g. "X7K9"
function generateRandomSuffix(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let res = '';
  for (let i = 0; i < 4; i++) {
    res += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return res;
}

export function drawReward(clientIdentifier?: string): {
  reward: RewardDefinition;
  sliceIndex: number;
  promoCode: PromoCode;
} {
  const settings = getGameSettings();
  if (!settings.isGameActive) {
    throw new Error('LE_JEU_EST_DESACTIVE');
  }

  // Weight-based random selection
  const probs = settings.probabilities;
  const totalWeight = CHANCE_REWARDS.reduce((sum, r) => sum + (probs[r.id] ?? 10), 0);
  let randomVal = Math.random() * totalWeight;

  let selectedIndex = 0;
  let selectedReward = CHANCE_REWARDS[0];

  for (let i = 0; i < CHANCE_REWARDS.length; i++) {
    const r = CHANCE_REWARDS[i];
    const weight = probs[r.id] ?? 10;
    if (randomVal < weight) {
      selectedReward = r;
      selectedIndex = i;
      break;
    }
    randomVal -= weight;
  }

  // Generate unique code
  let codeStr = `${selectedReward.prefix}-${generateRandomSuffix()}`;
  // Ensure uniqueness
  while (store.codes.some(c => c.code === codeStr)) {
    codeStr = `${selectedReward.prefix}-${generateRandomSuffix()}`;
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + settings.codeValidityHours * 3600 * 1000);

  const newPromoCode: PromoCode = {
    id: `code_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    code: codeStr,
    rewardId: selectedReward.id,
    rewardLabel: selectedReward.label,
    discountType: selectedReward.discountType,
    discountValue: selectedReward.discountValue,
    freeItemName: selectedReward.freeItemName,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    isUsed: false,
    clientIp: clientIdentifier,
  };

  store.codes.unshift(newPromoCode);

  if (clientIdentifier) {
    store.spinsByIp[clientIdentifier] = Date.now();
  }

  saveStore();

  return {
    reward: selectedReward,
    sliceIndex: selectedIndex,
    promoCode: newPromoCode,
  };
}

export function verifyPromoCode(codeToVerify: string): {
  isValid: boolean;
  code?: PromoCode;
  error?: string;
} {
  const cleanCode = codeToVerify.trim().toUpperCase();
  const promo = store.codes.find(c => c.code.toUpperCase() === cleanCode);

  if (!promo) {
    return { isValid: false, error: 'Code promotionnel invalide ou introuvable.' };
  }

  if (promo.isUsed) {
    return { isValid: false, error: 'Ce code promotionnel a déjà été utilisé.' };
  }

  const now = new Date();
  if (new Date(promo.expiresAt).getTime() < now.getTime()) {
    return { isValid: false, error: 'Ce code promotionnel a expiré.' };
  }

  return { isValid: true, code: promo };
}
