import { useNavigate } from 'react-router-dom';
import { useFormatter } from '../hooks/useFormatter.js';
import { useApp } from '../contexts/AppContext.jsx';
import styles from './CoinRow.module.css';

export default function CoinRow({ coin, rank }) {
  const navigate = useNavigate();
  const { formatPrice, formatLarge, formatPct } = useFormatter();
  const { state } = useApp();
  const isHe = state.lang === 'he';

  const pct24h = coin.price_change_percentage_24h;
  const pctClass = pct24h >= 0 ? 'gain' : 'loss';

  return (
    <tr
      className={styles.row}
      onClick={() => navigate(`/coin/${coin.id}`)}
      onKeyDown={e => e.key === 'Enter' && navigate(`/coin/${coin.id}`)}
      tabIndex={0}
      role="button"
      aria-label={`${coin.name} — ${formatPrice(coin.current_price)}`}
    >
      <td className={styles.rank} aria-label={isHe ? `דירוג ${rank}` : `Rank ${rank}`}>
        {rank}
      </td>
      <td className={styles.coinCell}>
        <img src={coin.image} alt={coin.name} width={32} height={32} className={styles.coinIcon} />
        <div>
          <div className="text-strong">{coin.name}</div>
          <div className="text-muted">{coin.symbol?.toUpperCase()}</div>
        </div>
      </td>
      <td className={`ltr ${styles.numCell}`}>
        {formatPrice(coin.current_price)}
      </td>
      <td className={`ltr ${styles.numCell} ${pctClass}`} aria-label={`שינוי 24 שעות: ${formatPct(pct24h)}`}>
        {formatPct(pct24h)}
      </td>
      <td className={`ltr ${styles.numCell}`}>
        {formatLarge(coin.market_cap)}
      </td>
      <td className={`ltr ${styles.numCell}`}>
        {formatLarge(coin.total_volume)}
      </td>
    </tr>
  );
}
