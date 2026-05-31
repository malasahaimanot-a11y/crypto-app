import { useApp } from '../contexts/AppContext.jsx';

const CURRENCY_SYMBOLS = { usd: '$', eur: '€', ils: '₪', gbp: '£', btc: '₿' };

export function useFormatter() {
  const { state } = useApp();
  const { currency, lang } = state;

  const locale = lang === 'he' ? 'he-IL' : 'en-US';

  function formatPrice(value, opts = {}) {
    if (value == null || isNaN(value)) return '—';
    const abs = Math.abs(value);
    const decimals = abs >= 1 ? 2 : abs >= 0.01 ? 4 : 8;
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency.toUpperCase() === 'BTC' ? 'USD' : currency.toUpperCase(),
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      ...opts,
    }).format(value);
  }

  function formatPct(value) {
    if (value == null || isNaN(value)) return '—';
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  }

  function formatLarge(value) {
    if (value == null || isNaN(value)) return '—';
    if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9)  return `${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6)  return `${(value / 1e6).toFixed(2)}M`;
    return value.toLocaleString(locale);
  }

  function formatNumber(value, decimals = 6) {
    if (value == null || isNaN(value)) return '—';
    return value.toLocaleString(locale, { maximumFractionDigits: decimals });
  }

  return { formatPrice, formatPct, formatLarge, formatNumber, currency, locale };
}
