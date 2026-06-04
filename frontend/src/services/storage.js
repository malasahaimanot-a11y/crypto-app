// Central persistence layer for PassIT.
// All localStorage access goes through here.

import { BIP39_WORDS } from '../data/bip39words.js';

/**
 * Generate 12 unique BIP-39 words using crypto.getRandomValues()
 * for true randomness (never Math.random).
 */
export function generateRecoveryWords() {
  const result = [];
  const seen   = new Set();
  const buf    = new Uint32Array(1);

  while (result.length < 12) {
    crypto.getRandomValues(buf);
    const idx  = buf[0] % BIP39_WORDS.length; // 0–2047, uniform enough for UX
    const word = BIP39_WORDS[idx];
    if (!seen.has(word)) {
      seen.add(word);
      result.push(word);
    }
  }
  return result;
}

const KEYS = {
  USER:    'passit_user',
  WALLET:  'passit_wallet',
  SESSION: 'passit_session',
};

// ── Protection levels ──────────────────────────────────────
export const PROTECTION_LEVELS = [
  {
    id: 'שמרן', label: 'שמרן', sub: 'מגן על 90% מהקרן',
    protectedPct: 90, btcPct: 10,
    icon: '🛡️', riskLabel: 'חשיפה נמוכה', riskColor: '#16A34A',
    desc: 'מתאים למי שמעדיף יציבות על פני תשואה',
  },
  {
    id: 'מאוזן', label: 'מאוזן', sub: 'מגן על 70% מהקרן',
    protectedPct: 70, btcPct: 30,
    icon: '⚖️', riskLabel: 'חשיפה בינונית', riskColor: '#EA580C',
    desc: 'איזון בין הגנה לצמיחה', recommended: true,
  },
  {
    id: 'גמיש', label: 'גמיש', sub: 'מגן על 50% מהקרן',
    protectedPct: 50, btcPct: 50,
    icon: '📈', riskLabel: 'חשיפה גבוהה', riskColor: '#DC2626',
    desc: 'חשיפה גבוהה יותר לביטקוין',
  },
  {
    id: 'ביטקוין טהור', label: 'ביטקוין טהור', sub: 'ללא הגנה, חשיפה מלאה',
    protectedPct: 0, btcPct: 100,
    icon: '₿', riskLabel: 'חשיפה מלאה', riskColor: '#7C3AED',
    desc: '100% Bitcoin — ללא הגנה',
  },
];

export function getLevelConfig(levelId) {
  return PROTECTION_LEVELS.find(l => l.id === levelId) ?? PROTECTION_LEVELS[1];
}

export function getLevelByIndex(idx) {
  return PROTECTION_LEVELS[idx] ?? PROTECTION_LEVELS[1];
}

// (RECOVERY_WORDS removed — use generateRecoveryWords() for per-user uniqueness)

// ── Empty wallet template ──────────────────────────────────
const EMPTY_WALLET = {
  totalILS:     0,
  growingILS:   0,
  protectedILS: 0,
  btcAmount:    0,
  btcRateILS:   56500,
  protection:   { isActive: true, level: 1 },
  transactions: [],
};

// ── Helpers ────────────────────────────────────────────────
function get(key) {
  try   { return JSON.parse(localStorage.getItem(key)); }
  catch { return null; }
}

function set(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

// ── User ───────────────────────────────────────────────────
export function createUserProfile({ name, email, protectionLevel = 'מאוזן' }) {
  const username = email.split('@')[0]
    .toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12) || 'user';
  const levelIndex = PROTECTION_LEVELS.findIndex(l => l.id === protectionLevel);
  return {
    name,
    displayName: name,
    username,
    email,
    protectionLevel,
    protectionLevelIndex: levelIndex >= 0 ? levelIndex : 1,
    lightningAddress: `${username}@passitpay.co`,
    mockAddress:      `bc1q${username.padEnd(8, '0')}xk2fd7grs4qqzge`,
    recoveryWords:    generateRecoveryWords(),
    createdAt:        Date.now(),
  };
}

export function saveUser(user)    { set(KEYS.USER, user); }
export function getStoredUser()   { return get(KEYS.USER); }

// ── Session ────────────────────────────────────────────────
export function saveSession(email) { set(KEYS.SESSION, { email, loggedIn: true }); }
export function getStoredSession() { return get(KEYS.SESSION); }
export function clearSession()     { localStorage.removeItem(KEYS.SESSION); }

// ── Wallet ─────────────────────────────────────────────────
export function getStoredWallet() {
  const saved = get(KEYS.WALLET);
  return saved ? { ...EMPTY_WALLET, ...saved } : { ...EMPTY_WALLET };
}
export function saveWallet(wallet) { set(KEYS.WALLET, wallet); }

// ── Reset ──────────────────────────────────────────────────
export function resetAll() {
  Object.values(KEYS).forEach(k => localStorage.removeItem(k));
}
