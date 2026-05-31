import { useState } from 'react';
import { useMarkets } from '../hooks/useApi.js';
import { useFormatter } from '../hooks/useFormatter.js';
import { useApp } from '../contexts/AppContext.jsx';
import CoinRow from '../components/CoinRow.jsx';
import styles from './MarketPage.module.css';

const SORT_KEYS = {
  market_cap: (a, b) => b.market_cap - a.market_cap,
  price:      (a, b) => b.current_price - a.current_price,
  change24h:  (a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h,
  volume:     (a, b) => b.total_volume - a.total_volume,
};

export default function MarketPage() {
  const { state, dispatch } = useApp();
  const isHe = state.lang === 'he';

  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState('market_cap');
  const [sortDesc, setSortDesc] = useState(true);

  const { data, isLoading, isError } = useMarkets(state.currency, page);
  const { formatLarge } = useFormatter();

  const coins = data
    ? [...data].sort((a, b) => (sortDesc ? 1 : -1) * SORT_KEYS[sortKey](a, b))
    : [];

  function toggleSort(key) {
    if (sortKey === key) setSortDesc(d => !d);
    else { setSortKey(key); setSortDesc(true); }
  }

  function SortTh({ colKey, label, labelHe }) {
    const active = sortKey === colKey;
    return (
      <th
        scope="col"
        onClick={() => toggleSort(colKey)}
        className={styles.sortTh}
        aria-sort={active ? (sortDesc ? 'descending' : 'ascending') : 'none'}
      >
        {isHe ? labelHe : label}
        <span aria-hidden="true" className={styles.sortIcon}>
          {active ? (sortDesc ? ' ▼' : ' ▲') : ' ⇅'}
        </span>
      </th>
    );
  }

  return (
    <div>
      <div className={styles.toolbar}>
        <div>
          <h1 className={styles.pageTitle}>{isHe ? 'שוק הקריפטו' : 'Crypto Market'}</h1>
          <p className="text-muted">{isHe ? 'מחירים בזמן אמת • מתעדכן כל דקה' : 'Live prices • Updates every minute'}</p>
        </div>
        <div className={styles.currencySelector}>
          <label htmlFor="currency-select" className={styles.currencyLabel}>
            {isHe ? 'מטבע:' : 'Currency:'}
          </label>
          <select
            id="currency-select"
            className={styles.select}
            value={state.currency}
            onChange={e => dispatch({ type: 'SET_CURRENCY', payload: e.target.value })}
          >
            <option value="usd">USD $</option>
            <option value="eur">EUR €</option>
            <option value="ils">ILS ₪</option>
            <option value="gbp">GBP £</option>
          </select>
        </div>
      </div>

      {isError && (
        <div role="alert" className={styles.errorBox}>
          {isHe ? 'שגיאה בטעינת הנתונים. אנא נסה שוב.' : 'Failed to load data. Please try again.'}
        </div>
      )}

      <div className={`card ${styles.tableCard}`} style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }} role="region" aria-label={isHe ? 'טבלת מטבעות קריפטו' : 'Crypto coin table'}>
          <table className={styles.table} aria-busy={isLoading}>
            <thead>
              <tr>
                <th scope="col" className={styles.th}>#</th>
                <th scope="col" className={styles.th}>{isHe ? 'מטבע' : 'Coin'}</th>
                <SortTh colKey="price"     label="Price"      labelHe="מחיר" />
                <SortTh colKey="change24h" label="24h %"      labelHe="24ש %" />
                <SortTh colKey="market_cap" label="Market Cap" labelHe="שווי שוק" />
                <SortTh colKey="volume"    label="Volume"     labelHe="נפח" />
              </tr>
            </thead>
            <tbody>
              {isLoading && Array.from({ length: 10 }).map((_, i) => (
                <tr key={i} aria-hidden="true">
                  {[...Array(6)].map((_, j) => (
                    <td key={j} style={{ padding: 'var(--space-4)' }}>
                      <div className="skeleton" style={{ height: 20, width: j === 1 ? 140 : 80 }} />
                    </td>
                  ))}
                </tr>
              ))}
              {!isLoading && coins.map((coin, i) => (
                <CoinRow key={coin.id} coin={coin} rank={(page - 1) * 50 + i + 1} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={styles.pagination} role="navigation" aria-label={isHe ? 'ניווט בין עמודים' : 'Pagination'}>
        <button
          className="btn btn-ghost"
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          aria-label={isHe ? 'עמוד קודם' : 'Previous page'}
        >
          {isHe ? '← הקודם' : '← Prev'}
        </button>
        <span aria-live="polite" aria-atomic="true" className={styles.pageNum}>
          {isHe ? `עמוד ${page}` : `Page ${page}`}
        </span>
        <button
          className="btn btn-ghost"
          onClick={() => setPage(p => p + 1)}
          disabled={!data || data.length < 50}
          aria-label={isHe ? 'עמוד הבא' : 'Next page'}
        >
          {isHe ? 'הבא →' : 'Next →'}
        </button>
      </div>
    </div>
  );
}
