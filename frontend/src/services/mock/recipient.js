// Mock recipient detection service.
// Production replacement: Lightning address resolution (LNURL-pay),
// on-chain address validation, contact lookup via federated server.

export function detectType(input) {
  const s = input.trim();
  if (!s) return 'empty';
  // Israeli phone number
  if (/^05\d[\d\-\s]{7,9}$/.test(s)) return 'phone';
  // Lightning address (LNURL-pay handle)
  if (/^[a-zA-Z0-9._+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(s)) return 'lightning';
  // Bech32 on-chain (bc1... or 1... or 3...)
  if (/^(bc1|[13])[a-zA-HJ-NP-Za-km-z1-9]{25,62}$/.test(s)) return 'onchain';
  return 'unknown';
}

export function displayRecipient(input) {
  const type = detectType(input);
  const s = input.trim();
  if (type === 'onchain' && s.length > 20) {
    return `${s.slice(0, 10)}...${s.slice(-6)}`;
  }
  return s;
}

// Mock app contacts (in production: fetched from contact server)
export const APP_CONTACTS = [
  { id: 1, name: 'שרה כהן',    address: 'sarah@passitpay.co',  initials: 'שכ', color: '#DBEAFE' },
  { id: 2, name: 'דוד לוי',    address: 'david@passitpay.co',  initials: 'דל', color: '#DCFCE7' },
  { id: 3, name: 'מרים אברהם', address: 'miriam@passitpay.co', initials: 'מא', color: '#FEF3C7' },
];

export const TYPE_LABELS = {
  phone:     { icon: '📱', label: 'מספר טלפון' },
  lightning: { icon: '⚡', label: 'כתובת Lightning' },
  onchain:   { icon: '₿',  label: 'כתובת Bitcoin' },
  unknown:   { icon: '🔍', label: 'מחפש...' },
  empty:     { icon: null, label: '' },
};
