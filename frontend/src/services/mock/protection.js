// Mock protection algorithm service.
// Production replacement: DCA/rebalancing engine that swaps BTC↔stablecoin
// via liquidity pools or exchange APIs when price moves outside thresholds.

export const PROTECTION_LEVELS = [
  {
    id: 0, key: 'bitcoin',
    label: 'ביטקוין טהור',
    emoji: '₿',
    protectedPct: 0,
    desc: 'כל הכסף שלך ב-Bitcoin. חשיפה מלאה לצמיחה ולסיכון.',
    riskLabel: 'ללא הגנה',
    riskColor: '#DC2626',
    riskBg: '#FEE2E2',
  },
  {
    id: 1, key: 'gamish',
    label: 'גמיש',
    emoji: '⚡',
    protectedPct: 50,
    desc: '50% מוגן בסטייבלקוין, 50% צומח ב-Bitcoin.',
    riskLabel: 'חשיפה בינונית',
    riskColor: '#EA580C',
    riskBg: '#FFF7ED',
  },
  {
    id: 2, key: 'muvzan',
    label: 'מאוזן',
    emoji: '⚖️',
    protectedPct: 70,
    desc: '70% מוגן. הגנה טובה תוך שמירה על פוטנציאל צמיחה.',
    riskLabel: 'חשיפה נמוכה',
    riskColor: '#D97706',
    riskBg: '#FFFBEB',
  },
  {
    id: 3, key: 'shamran',
    label: 'שמרן',
    emoji: '🛡️',
    protectedPct: 90,
    desc: '90% מוגן בסטייבלקוין. ביטחון מקסימלי לקרן שלך.',
    riskLabel: 'חשיפה מינימלית',
    riskColor: '#16A34A',
    riskBg: '#DCFCE7',
  },
];

export function getLevelById(id) {
  return PROTECTION_LEVELS[id] ?? PROTECTION_LEVELS[2];
}

export function applyLevel(wallet, levelId) {
  const level = getLevelById(levelId);
  const total = wallet.totalILS;
  const protectedAmt = Math.round(total * (level.protectedPct / 100));
  const growingAmt = total - protectedAmt;
  return {
    ...wallet,
    protectedILS: protectedAmt,
    growingILS: growingAmt,
    btcAmount: +(growingAmt / wallet.btcRateILS).toFixed(6),
    protection: { ...wallet.protection, level: levelId },
  };
}

// Simulate a ~15% BTC price drop triggering automatic rebalancing.
// Returns { newWallet, movedILS, notification }
export function simulatePriceDrop(wallet) {
  const level = getLevelById(wallet.protection.level);
  if (!wallet.protection.isActive || level.protectedPct === 0) {
    return { newWallet: wallet, movedILS: 0, notification: null };
  }

  // Protect 12% of the currently-growing portion
  const toProtect = Math.round(wallet.growingILS * 0.12);
  if (toProtect < 1) return { newWallet: wallet, movedILS: 0, notification: null };

  const newGrowing = wallet.growingILS - toProtect;
  const newProtected = wallet.protectedILS + toProtect;
  const total = newGrowing + newProtected;

  const protectTx = {
    id: `protect-${Date.now()}`,
    type: 'protect',
    amountILS: toProtect,
    description: 'הגנה אוטומטית',
    date: 'היום',
    time: new Date().toTimeString().slice(0, 5),
    status: 'confirmed',
    txId: `internal-swap-${Date.now()}`,
    note: 'המחיר ירד — הגנתי על הכסף שלך 🛡️',
  };

  const newWallet = {
    ...wallet,
    totalILS: total,
    growingILS: newGrowing,
    protectedILS: newProtected,
    btcAmount: +(newGrowing / wallet.btcRateILS).toFixed(6),
    transactions: [protectTx, ...wallet.transactions],
  };

  return {
    newWallet,
    movedILS: toProtect,
    notification: `המחיר ירד — הגנתי על ₪${toProtect} 🛡️`,
  };
}
