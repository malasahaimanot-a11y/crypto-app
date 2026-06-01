// Mock wallet state service.
// Production replacement: balances from LN node + on-chain UTXO set;
// transactions from LN invoice history + block explorer.

const WALLET_KEY = 'sp_wallet';

const INITIAL_TRANSACTIONS = [
  {
    id: 'tx1', type: 'receive', amountILS: 500,
    description: 'מדוד לוי', date: '30 במאי', time: '14:32',
    status: 'confirmed', txId: 'lnbc5000n1pjqhd5xpp5qczq...abc123', note: '',
  },
  {
    id: 'tx2', type: 'send', amountILS: 120,
    description: 'לשרה כהן', date: '29 במאי', time: '09:15',
    status: 'confirmed', txId: 'lnbc1200n1pjqhd6xpp5abc...def456', note: 'ארוחת צהריים',
  },
  {
    id: 'tx3', type: 'receive', amountILS: 800,
    description: 'שכר — חברת בטא', date: '28 במאי', time: '17:00',
    status: 'confirmed', txId: 'lnbc8000n1pjqhd7xpp5ghi...789jkl', note: 'שכר מאי',
  },
  {
    id: 'tx4', type: 'protect', amountILS: 350,
    description: 'הגנה אוטומטית', date: '25 במאי', time: '11:20',
    status: 'confirmed', txId: 'internal-swap-001',
    note: 'המחיר ירד — הגנתי על הכסף שלך 🛡️',
  },
  {
    id: 'tx5', type: 'send', amountILS: 45,
    description: 'לקפה גוגו', date: '24 במאי', time: '08:45',
    status: 'confirmed', txId: 'lnbc450n1pjqhd8xpp5mno...012pqr', note: '',
  },
  {
    id: 'tx6', type: 'receive', amountILS: 300,
    description: 'מיובל שגיא', date: '22 במאי', time: '16:10',
    status: 'confirmed', txId: 'lnbc3000n1pjqhd9xpp5stu...345vwx', note: 'החזר',
  },
];

const DEFAULT_STATE = {
  totalILS: 1250,
  growingILS: 900,
  protectedILS: 350,
  btcAmount: 0.01592,
  btcRateILS: 56500,
  protection: { isActive: true, level: 2 },
  transactions: INITIAL_TRANSACTIONS,
};

export function getWalletState() {
  try {
    const saved = localStorage.getItem(WALLET_KEY);
    if (saved) return { ...DEFAULT_STATE, ...JSON.parse(saved) };
  } catch {}
  return { ...DEFAULT_STATE };
}

export function saveWalletState(state) {
  localStorage.setItem(WALLET_KEY, JSON.stringify(state));
}

export function resetWallet() {
  localStorage.removeItem(WALLET_KEY);
}

export function ilsToSats(amountILS, btcRateILS = 56500) {
  return Math.round((amountILS / btcRateILS) * 1e8);
}

export function satsToIls(sats, btcRateILS = 56500) {
  return +((sats / 1e8) * btcRateILS).toFixed(2);
}
