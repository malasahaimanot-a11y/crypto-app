import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatILS } from '../../data/mockWalletData.js';
import { useWallet } from '../../contexts/WalletContext.jsx';
import { useBtcPrice } from '../../hooks/useBtcPrice.js';
import PageDecor from '../../components/wallet/PageDecor.jsx';
import styles from './DashboardPage.module.css';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, wallet, updateBtcRate } = useWallet();
  const { price, fresh, error } = useBtcPrice();

  // Keep wallet's stored BTC rate in sync with live price
  useEffect(() => {
    if (price?.ils) updateBtcRate(price.ils);
  }, [price?.ils, updateBtcRate]);

  const btcRate      = price?.ils ?? wallet?.btcRateILS ?? 56500;
  const btcAmount    = wallet?.btcAmount    ?? 0;
  const protectedILS = wallet?.protectedILS ?? 0;
  const liveBtcILS   = Math.round(btcAmount * btcRate);
  const liveTotalILS = liveBtcILS + protectedILS;
  const liveBtcPct   = liveTotalILS > 0 ? Math.round((liveBtcILS / liveTotalILS) * 100) : 0;
  const liveProtPct  = 100 - liveBtcPct;

  const recent       = (wallet?.transactions ?? []).slice(0, 4);
  const displayName  = user?.displayName ?? user?.username ?? '';

  return (
    <div className={styles.page}>
      <PageDecor />

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.greeting}>
          <p className={styles.greetSub}>שלום,</p>
          <p className={styles.greetName}>{displayName}</p>
        </div>
        <div className={styles.menuWrap}>
          <button
            className={styles.menuBtn}
            onClick={() => setMenuOpen(o => !o)}
            aria-label="תפריט"
            aria-expanded={menuOpen}
            aria-haspopup="true"
          >
            ⋮
          </button>
          {menuOpen && (
            <>
              <div className={styles.menuBackdrop} onClick={() => setMenuOpen(false)} aria-hidden="true"/>
              <div className={styles.dropdown} role="menu">
                <button className={styles.dropdownItem} role="menuitem"
                  onClick={() => { setMenuOpen(false); navigate('/protection'); }}>
                  רמת הגנה
                </button>
                <button className={styles.dropdownItem} role="menuitem"
                  onClick={() => { setMenuOpen(false); navigate('/history'); }}>
                  היסטוריה
                </button>
                <button className={styles.dropdownItem} role="menuitem"
                  onClick={() => { setMenuOpen(false); navigate('/settings'); }}>
                  הגדרות
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Balance */}
      <section className={styles.balanceSection} aria-label="יתרה נוכחית">
        <div className={styles.balanceLabelRow}>
          <p className={styles.balanceLabel}>היתרה שלך</p>
          {fresh && <span className={styles.freshBadge} aria-live="polite">עדכני ✓</span>}
          {error && !price && <span className={styles.errorBadge}>אין חיבור</span>}
        </div>

        <p className={styles.balanceAmount} aria-live="polite" dir="ltr">
          {formatILS(liveTotalILS)}
        </p>

        {price && (
          <p className={styles.btcPriceLine} dir="ltr">
            1 BTC = {formatILS(price.ils, 0)}
            <span className={styles.btcUsd}> · ${price.usd.toLocaleString()}</span>
          </p>
        )}

        {/* Split pills — only show when there is a balance */}
        {liveTotalILS > 0 && (
          <div className={styles.splitRow} role="list" aria-label="הרכב הסכום">
            <div className={styles.pill} role="listitem">
              <span className={styles.pillDot} style={{ background: 'var(--w-accent)' }} aria-hidden="true"/>
              <span className={styles.pillLabel}>Bitcoin</span>
              <span className={styles.pillAmount} dir="ltr">{formatILS(liveBtcILS, 0)}</span>
              <span className={styles.pillPct} dir="ltr">{liveBtcPct}%</span>
            </div>
            <div className={styles.pillDivider} aria-hidden="true"/>
            <div className={styles.pill} role="listitem">
              <span className={styles.pillDot} style={{ background: 'var(--w-text-muted)' }} aria-hidden="true"/>
              <span className={styles.pillLabel}>מוגן</span>
              <span className={styles.pillAmount} dir="ltr">{formatILS(protectedILS, 0)}</span>
              <span className={styles.pillPct} dir="ltr">{liveProtPct}%</span>
            </div>
          </div>
        )}
      </section>

      {/* Actions */}
      <div className={styles.actions} role="group" aria-label="פעולות">
        <button className={`${styles.actionBtn} ${styles.actionSecondary}`}
          onClick={() => navigate('/send')} aria-label="שלח כסף">
          <span className={styles.actionIcon} aria-hidden="true">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22,2 15,22 11,13 2,9"/>
            </svg>
          </span>
          <span>שלח</span>
        </button>

        <button className={`${styles.actionBtn} ${styles.actionPrimary}`}
          onClick={() => navigate('/deposit')} aria-label="הפקד כסף">
          <span className={styles.actionIcon} aria-hidden="true">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="2" x2="12" y2="16"/>
              <polyline points="7,11 12,16 17,11"/>
              <path d="M20 21H4"/>
            </svg>
          </span>
          <span>הפקדה</span>
        </button>

        <button className={`${styles.actionBtn} ${styles.actionSecondary}`}
          onClick={() => navigate('/receive')} aria-label="קבל כסף">
          <span className={styles.actionIcon} aria-hidden="true">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v14"/>
              <polyline points="7,12 12,17 17,12"/>
              <path d="M20 21H4"/>
            </svg>
          </span>
          <span>קבל</span>
        </button>
      </div>

      {/* Recent activity */}
      <section className={styles.activity}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>פעילות אחרונה</h2>
          {recent.length > 0 && (
            <button className={styles.seeAllBtn} onClick={() => navigate('/history')}>
              ראה הכל
            </button>
          )}
        </div>

        {recent.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyIcon} aria-hidden="true">💸</p>
            <p className={styles.emptyText}>אין עדיין פעילות</p>
            <p className={styles.emptySub}>הפקד כסף כדי להתחיל</p>
          </div>
        ) : (
          <div className={styles.txList} role="list">
            {recent.map((tx) => (
              <button key={tx.id} className={styles.txRow} role="listitem"
                onClick={() => navigate('/history')}
                aria-label={`${tx.description}, ${tx.type === 'receive' ? '+' : '-'}${formatILS(tx.amountILS)}, ${tx.date}`}>
                <span className={`${styles.txIcon} ${tx.type === 'receive' ? styles.txIconReceive : styles.txIconSend}`}
                  aria-hidden="true">
                  {tx.type === 'receive' ? '↓' : '↑'}
                </span>
                <span className={styles.txMeta}>
                  <span className={styles.txDesc}>{tx.description}</span>
                  <span className={styles.txDate}>{tx.date}</span>
                </span>
                <span className={`${styles.txAmount} ${tx.type === 'receive' ? styles.txAmountReceive : styles.txAmountSend}`}
                  dir="ltr">
                  {tx.type === 'receive' ? '+' : '−'}{formatILS(tx.amountILS, 0)}
                </span>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
