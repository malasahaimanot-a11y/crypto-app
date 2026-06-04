// Static reference data — contacts + formatILS only.
// All dynamic user data (balance, transactions, profile) lives in
// src/services/storage.js and WalletContext.

export const mockWallet = {
  contacts: [
    { id: 1, name: 'שרה כהן',    address: 'sarah@passitpay.co',  initials: 'שכ', color: '#E0F2FE' },
    { id: 2, name: 'דוד לוי',    address: 'david@passitpay.co',  initials: 'דל', color: '#DCFCE7' },
    { id: 3, name: 'מרים אברהם', address: 'miriam@passitpay.co', initials: 'מא', color: '#FEF3C7' },
  ],
};

export function formatILS(amount, decimals = 2) {
  return new Intl.NumberFormat('he-IL', {
    style:                 'currency',
    currency:              'ILS',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}
