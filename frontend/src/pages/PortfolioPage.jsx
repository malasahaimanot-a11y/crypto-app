import { useState, useMemo } from 'react';
import { usePortfolio, useAddHolding, useRemoveHolding, usePrices } from '../hooks/useApi.js';
import { useFormatter } from '../hooks/useFormatter.js';
import { useApp } from '../contexts/AppContext.jsx';
import AddHoldingModal from '../components/AddHoldingModal.jsx';
import styles from './PortfolioPage.module.css';

export default function PortfolioPage() {
  const { state } = useApp();
  const isHe = state.lang === 'he';
  const userId = state.userId;

  const [showModal, setShowModal] = useState(false);

  const { data: portfolio, isLoading } = usePortfolio(userId);
  const addHolding = useAddHolding(userId);
  const removeHolding = useRemoveHolding(userId);
  const { formatPrice, formatPct, formatNumber } = useFormatter();

  const coinIds = (portfolio?.holdings ?? []).map(h => h.coinId).join(',');
  const { data: prices } = usePrices(coinIds, state.currency);

  const holdings = useMemo(() => {
    if (!portfolio?.holdings) return [];
    return portfolio.holdings.map(h => {
      const priceData = prices?.[h.coinId];
      const currentPrice = priceData?.[state.currency] ?? 0;
      const change24h = priceData?.[`${state.currency}_24h_change`] ?? 0;
      const currentValue = currentPrice * h.amount;
      const costBasis = h.purchasePrice * h.amount;
      const pnl = currentValue - costBasis;
      const pnlPct = costBasis > 0 ? (pnl / costBasis) * 100 : 0;
      return { ...h, currentPrice, change24h, currentValue, costBasis, pnl, pnlPct };
    });
  }, [portfolio, prices, state.currency]);

  const summary = useMemo(() => {
    const totalValue = holdings.reduce((s, h) => s + h.currentValue, 0);
    const totalCost  = holdings.reduce((s, h) => s + h.costBasis, 0);
    const totalPnl   = totalValue - totalCost;
    const totalPnlPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;
    return { totalValue, totalCost, totalPnl, totalPnlPct };
  }, [holdings]);

  return (
    <div>
      <div className={styles.toolbar}>
        <div>
          <h1 className={styles.pageTitle}>{isHe ? 'תיק ההשקעות שלי' : 'My Portfolio'}</h1>
          <p className="text-muted">{isHe ? 'עקוב אחר הנכסים שלך בזמן אמת' : 'Track your assets in real time'}</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
          aria-label={isHe ? 'הוסף מטבע לתיק' : 'Add coin to portfolio'}
        >
          <span aria-hidden="true">+</span>
          {isHe ? 'הוסף מטבע' : 'Add Coin'}
        </button>
      </div>

      {/* Summary cards */}
      {holdings.length > 0 && (
        <div className={styles.summaryGrid} role="region" aria-label={isHe ? 'סיכום תיק' : 'Portfolio summary'}>
          <div className="card">
            <div className="text-muted" style={{ marginBottom: 'var(--space-2)' }}>
              {isHe ? 'שווי כולל' : 'Total Value'}
            </div>
            <div className={`ltr ${styles.summaryValue}`}>{formatPrice(summary.totalValue)}</div>
          </div>
          <div className="card">
            <div className="text-muted" style={{ marginBottom: 'var(--space-2)' }}>
              {isHe ? 'עלות כוללת' : 'Total Cost'}
            </div>
            <div className={`ltr ${styles.summaryValue}`}>{formatPrice(summary.totalCost)}</div>
          </div>
          <div className="card">
            <div className="text-muted" style={{ marginBottom: 'var(--space-2)' }}>
              {isHe ? 'רווח / הפסד' : 'P&L'}
            </div>
            <div className={`ltr ${styles.summaryValue} ${summary.totalPnl >= 0 ? 'gain' : 'loss'}`}>
              {formatPrice(summary.totalPnl)}
            </div>
            <div className={`ltr ${summary.totalPnlPct >= 0 ? 'gain' : 'loss'}`} style={{ fontSize: 'var(--size-sm)', marginTop: 'var(--space-1)' }}>
              {formatPct(summary.totalPnlPct)}
            </div>
          </div>
        </div>
      )}

      {/* Holdings list */}
      {isLoading && (
        <div aria-busy="true">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 80, marginBottom: 'var(--space-3)', borderRadius: 'var(--radius-md)' }} />
          ))}
        </div>
      )}

      {!isLoading && holdings.length === 0 && (
        <div className={`card ${styles.empty}`} role="status">
          <div className={styles.emptyIcon} aria-hidden="true">💼</div>
          <h2>{isHe ? 'התיק ריק' : 'Portfolio is empty'}</h2>
          <p className="text-muted">
            {isHe ? 'לחץ "הוסף מטבע" כדי להתחיל לעקוב אחר ההשקעות שלך.' : 'Click "Add Coin" to start tracking your investments.'}
          </p>
        </div>
      )}

      {!isLoading && holdings.length > 0 && (
        <div role="list" aria-label={isHe ? 'רשימת אחזקות' : 'Holdings list'}>
          {holdings.map(holding => (
            <article key={holding.id} role="listitem" className={`card ${styles.holdingCard}`}
              aria-label={`${holding.coinName}: ${formatPrice(holding.currentValue)}`}>
              <div className={styles.holdingLeft}>
                {holding.image && (
                  <img src={holding.image} alt={holding.coinName} width={48} height={48} style={{ borderRadius: '50%' }} />
                )}
                <div>
                  <div className="text-strong" style={{ fontSize: 'var(--size-lg)' }}>{holding.coinName}</div>
                  <div className="text-muted">{holding.symbol?.toUpperCase()} · {formatNumber(holding.amount)} {isHe ? 'יח' : 'units'}</div>
                </div>
              </div>

              <div className={styles.holdingStats}>
                <div className={styles.statBlock}>
                  <div className="text-muted">{isHe ? 'מחיר נוכחי' : 'Current Price'}</div>
                  <div className={`ltr text-strong`} style={{ fontSize: 'var(--size-lg)' }}>{formatPrice(holding.currentPrice)}</div>
                  <div className={`ltr ${holding.change24h >= 0 ? 'gain' : 'loss'}`}>{formatPct(holding.change24h)}</div>
                </div>
                <div className={styles.statBlock}>
                  <div className="text-muted">{isHe ? 'שווי' : 'Value'}</div>
                  <div className="ltr text-strong" style={{ fontSize: 'var(--size-lg)' }}>{formatPrice(holding.currentValue)}</div>
                </div>
                <div className={styles.statBlock}>
                  <div className="text-muted">{isHe ? 'רווח/הפסד' : 'P&L'}</div>
                  <div className={`ltr ${holding.pnl >= 0 ? 'gain' : 'loss'}`} style={{ fontSize: 'var(--size-lg)', fontWeight: 'var(--weight-bold)' }}>
                    {formatPrice(holding.pnl)}
                  </div>
                  <div className={`ltr ${holding.pnlPct >= 0 ? 'gain' : 'loss'}`}>{formatPct(holding.pnlPct)}</div>
                </div>
              </div>

              <button
                className="btn btn-danger"
                onClick={() => removeHolding.mutate(holding.id)}
                aria-label={isHe ? `הסר ${holding.coinName} מהתיק` : `Remove ${holding.coinName} from portfolio`}
                style={{ alignSelf: 'center', padding: 'var(--space-2) var(--space-4)', fontSize: 'var(--size-sm)' }}
              >
                {isHe ? 'הסר' : 'Remove'}
              </button>
            </article>
          ))}
        </div>
      )}

      {showModal && (
        <AddHoldingModal
          onClose={() => setShowModal(false)}
          onAdd={data => addHolding.mutate(data)}
        />
      )}
    </div>
  );
}
