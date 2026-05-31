import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCoinDetail } from '../hooks/useApi.js';
import { useFormatter } from '../hooks/useFormatter.js';
import { useApp } from '../contexts/AppContext.jsx';
import PriceChart from '../components/PriceChart.jsx';
import styles from './CoinDetailPage.module.css';

export default function CoinDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useApp();
  const isHe = state.lang === 'he';

  const [chartDays, setChartDays] = useState('7');
  const { data: coin, isLoading, isError } = useCoinDetail(id);
  const { formatPrice, formatLarge, formatPct, formatNumber } = useFormatter();

  if (isLoading) return (
    <div aria-busy="true" aria-label={isHe ? 'טוען...' : 'Loading...'}>
      {[...Array(4)].map((_, i) => (
        <div key={i} className="skeleton" style={{ height: 60, marginBottom: 'var(--space-4)', borderRadius: 'var(--radius-md)' }} />
      ))}
    </div>
  );

  if (isError || !coin) return (
    <div role="alert" className={styles.errorBox}>
      {isHe ? 'לא ניתן לטעון את נתוני המטבע.' : 'Could not load coin data.'}
    </div>
  );

  const md = coin.market_data;
  const price = md?.current_price?.[state.currency];
  const pct24h = md?.price_change_percentage_24h;
  const pct7d = md?.price_change_percentage_7d;

  const STATS = [
    { label: isHe ? 'שווי שוק' : 'Market Cap',         value: formatLarge(md?.market_cap?.[state.currency]) },
    { label: isHe ? 'נפח 24ש' : '24h Volume',           value: formatLarge(md?.total_volume?.[state.currency]) },
    { label: isHe ? 'גבוה 24ש' : '24h High',            value: formatPrice(md?.high_24h?.[state.currency]) },
    { label: isHe ? 'נמוך 24ש' : '24h Low',             value: formatPrice(md?.low_24h?.[state.currency]) },
    { label: isHe ? 'כמות במחזור' : 'Circulating Supply', value: formatNumber(md?.circulating_supply, 0) },
    { label: isHe ? 'כמות מקסימלית' : 'Max Supply',     value: md?.max_supply ? formatNumber(md.max_supply, 0) : '∞' },
    { label: isHe ? 'שיא כל הזמנים' : 'ATH',            value: formatPrice(md?.ath?.[state.currency]) },
    { label: isHe ? 'מעמד שוק' : 'Market Rank',         value: `#${coin.market_cap_rank ?? '—'}` },
  ];

  return (
    <div>
      <button
        className={`btn btn-ghost ${styles.backBtn}`}
        onClick={() => navigate(-1)}
        aria-label={isHe ? 'חזור לשוק' : 'Back to market'}
      >
        {isHe ? '→ חזרה' : '← Back'}
      </button>

      {/* Hero */}
      <div className={`card ${styles.hero}`}>
        <div className={styles.heroLeft}>
          <img src={coin.image?.large} alt={coin.name} width={64} height={64} className={styles.coinImage} />
          <div>
            <h1 className={styles.coinName}>{coin.name}</h1>
            <span className={styles.symbol}>{coin.symbol?.toUpperCase()}</span>
          </div>
        </div>
        <div className={styles.heroPrice}>
          <div className={`ltr ${styles.priceValue}`}>{formatPrice(price)}</div>
          <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', marginTop: 'var(--space-2)' }}>
            <span className={`ltr ${pct24h >= 0 ? 'gain' : 'loss'}`} aria-label={`24h: ${formatPct(pct24h)}`}>
              24h: {formatPct(pct24h)}
            </span>
            <span className={`ltr ${pct7d >= 0 ? 'gain' : 'loss'}`} aria-label={`7d: ${formatPct(pct7d)}`}>
              7d: {formatPct(pct7d)}
            </span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="card" style={{ marginTop: 'var(--space-6)' }}>
        <h2 className={styles.sectionTitle}>{isHe ? 'גרף מחיר' : 'Price Chart'}</h2>
        <PriceChart coinId={id} selectedDays={chartDays} onRangeChange={setChartDays} />
      </div>

      {/* Stats grid */}
      <div className={`card ${styles.statsCard}`} style={{ marginTop: 'var(--space-6)' }}>
        <h2 className={styles.sectionTitle}>{isHe ? 'נתוני שוק' : 'Market Stats'}</h2>
        <dl className={styles.statsGrid}>
          {STATS.map(s => (
            <div key={s.label} className={styles.statItem}>
              <dt className="text-muted">{s.label}</dt>
              <dd className={`ltr ${styles.statValue}`}>{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Description */}
      {coin.description?.he || coin.description?.en ? (
        <div className="card" style={{ marginTop: 'var(--space-6)' }}>
          <h2 className={styles.sectionTitle}>{isHe ? 'אודות' : 'About'}</h2>
          <p
            className={styles.description}
            dangerouslySetInnerHTML={{
              __html: (isHe && coin.description?.he
                ? coin.description.he
                : coin.description?.en ?? '').slice(0, 600) + '...'
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
