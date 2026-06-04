// Mock wallet state service.
// Production: balances from LN node + on-chain UTXO set;
// transactions from LN invoice history + block explorer.

const WALLET_KEY = 'sp_wallet';

// New users start with nothing — no fake seeded history
const EMPTY_WALLET = {
  totalILS:    0,
  growingILS:  0,
  protectedILS: 0,
  btcAmount:   0,
  btcRateILS:  56500,
  protection:  { isActive: true, level: 1 },
  transactions: [],
};

export function getWalletState() {
  try {
    const saved = localStorage.getItem(WALLET_KEY);
    if (saved) return { ...EMPTY_WALLET, ...JSON.parse(saved) };
  } catch {}
  return { ...EMPTY_WALLET };
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
