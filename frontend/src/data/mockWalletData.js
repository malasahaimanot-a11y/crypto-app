export const mockWallet = {
  user: { name: 'ישראל' },

  balance: {
    totalILS: 15234.50,
    bitcoinILS: 11883.51,
    stablecoinILS: 3350.99,
    bitcoinBTC: 0.021847,
    bitcoinPct: 78,
    stablecoinPct: 22,
    change24h: +2.3,
  },

  address: {
    lightning: 'israel@satoshipay.co',
    onchain: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  },

  contacts: [
    { id: 1, name: 'שרה כהן',    address: 'sarah@satoshipay.co',  initials: 'שכ', color: '#E0F2FE' },
    { id: 2, name: 'דוד לוי',    address: 'david@satoshipay.co',  initials: 'דל', color: '#DCFCE7' },
    { id: 3, name: 'מרים אברהם', address: 'miriam@satoshipay.co', initials: 'מא', color: '#FEF3C7' },
  ],

  transactions: [
    {
      id: 'tx1', type: 'receive', amountILS: 1200,
      description: 'מדוד לוי', date: '30 במאי', time: '14:32',
      status: 'confirmed',
      txId: 'lnbc12000n1pjqhd5xpp5qczqe5j0e3vk9sq8wmz...',
      note: 'תשלום שכ"ד',
    },
    {
      id: 'tx2', type: 'send', amountILS: 450,
      description: 'לשרה כהן', date: '29 במאי', time: '09:15',
      status: 'confirmed',
      txId: 'lnbc4500n1pjqhd6xpp5abc123def456ghi789...',
      note: '',
    },
    {
      id: 'tx3', type: 'receive', amountILS: 3500,
      description: 'שכר — חברת אלפא', date: '28 במאי', time: '17:00',
      status: 'confirmed',
      txId: 'lnbc35000n1pjqhd7xpp5jkl012mno345pqr678...',
      note: 'שכר מאי 2026',
    },
    {
      id: 'tx4', type: 'send', amountILS: 85,
      description: 'למרים אברהם', date: '27 במאי', time: '12:45',
      status: 'confirmed',
      txId: 'lnbc850n1pjqhd8xpp5stu901vwx234yz5678...',
      note: 'קפה',
    },
    {
      id: 'tx5', type: 'send', amountILS: 2100,
      description: 'שכר דירה', date: '1 במאי', time: '10:00',
      status: 'confirmed',
      txId: 'lnbc21000n1pjqhd9xpp5abc567def890ghi123...',
      note: 'מאי 2026',
    },
    {
      id: 'tx6', type: 'receive', amountILS: 750,
      description: 'מדוד לוי', date: '28 באפריל', time: '16:20',
      status: 'confirmed',
      txId: 'lnbc7500n1pjqhdaxpp5jkl456mno789pqr012...',
      note: '',
    },
  ],

  protection: {
    currentLevel: 1,
    levels: [
      { id: 0, label: 'דינמי',  protectedPct: 50, btcPct: 50, riskLabel: 'חשיפה גבוהה',  riskColor: '#DC2626' },
      { id: 1, label: 'מאוזן',  protectedPct: 70, btcPct: 30, riskLabel: 'חשיפה בינונית', riskColor: '#EA580C' },
      { id: 2, label: 'יציב',   protectedPct: 90, btcPct: 10, riskLabel: 'חשיפה נמוכה',  riskColor: '#16A34A' },
    ],
  },
};

export function formatILS(amount, decimals = 2) {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}
