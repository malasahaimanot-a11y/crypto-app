import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockWallet, formatILS } from '../../data/mockWalletData.js';
import styles from './DashboardPage.module.css';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, balance, transactions } = mockWallet;
  const recent = transactions.slice(0, 4);

  return (
    <div className={styles.page}>

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.greeting}>
          <p className={styles.greetSub}>שלום,</p>
          <p className={styles.greetName}>{user.name}</p>
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
                <button
                  className={styles.dropdownItem}
                  role="menuitem"
                  onClick={() => { setMenuOpen(false); navigate('/protection'); }}
                >
                  רמת הגנה
                </button>
                <button
                  className={styles.dropdownItem}
                  role="menuitem"
                  onClick={() => { setMenuOpen(false); navigate('/history'); }}
                >
                  היסטוריה
                </button>
                <button
                  className={styles.dropdownItem}
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                >
                  הגדרות
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Balance */}
      <section className={styles.balanceSection} aria-label="יתרה נוכחית">
        <p className={styles.balanceLabel}>היתרה שלך</p>
        <p className={styles.balanceAmount} aria-live="polite" dir="ltr">
          {formatILS(balance.totalILS)}
        </p>
        <div
          className={styles.changeBadge}
          aria-label={`שינוי ${balance.change24h > 0 ? '+' : ''}${balance.change24h}% היום`}
        >
          <span aria-hidden="true">{balance.change24h > 0 ? '↑' : '↓'}</span>
          <span dir="ltr">{balance.change24h > 0 ? '+' : ''}{balance.change24h}%</span>
          <span>היום</span>
        </div>

        {/* Split pills */}
        <div className={styles.splitRow} role="list" aria-label="הרכב הסכום">
          <div className={styles.pill} role="listitem">
            <span className={styles.pillDot} style={{ background: 'var(--w-accent)' }} aria-hidden="true"/>
            <span className={styles.pillLabel}>Bitcoin</span>
            <span className={styles.pillAmount} dir="ltr">{formatILS(balance.bitcoinILS, 0)}</span>
            <span className={styles.pillPct} dir="ltr">{balance.bitcoinPct}%</span>
          </div>
          <div className={styles.pillDivider} aria-hidden="true"/>
          <div className={styles.pill} role="listitem">
            <span className={styles.pillDot} style={{ background: 'var(--w-text-muted)' }} aria-hidden="true"/>
            <span className={styles.pillLabel}>מוגן</span>
            <span className={styles.pillAmount} dir="ltr">{formatILS(balance.stablecoinILS, 0)}</span>
            <span className={styles.pillPct} dir="ltr">{balance.stablecoinPct}%</span>
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className={styles.actions} role="group" aria-label="פעולות">
        <button
          className={`${styles.actionBtn} ${styles.actionSecondary}`}
          onClick={() => navigate('/send')}
          aria-label="שלח כסף"
        >
          <span className={styles.actionIcon} aria-hidden="true">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22,2 15,22 11,13 2,9"/>
            </svg>
          </span>
          <span>שלח</span>
        </button>

        <button
          className={`${styles.actionBtn} ${styles.actionPrimary}`}
          onClick={() => navigate('/deposit')}
          aria-label="הפקד כסף"
        >
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

        <button
          className={`${styles.actionBtn} ${styles.actionSecondary}`}
          onClick={() => navigate('/receive')}
          aria-label="קבל כסף"
        >
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
          <button
            className={styles.seeAllBtn}
            onClick={() => navigate('/history')}
          >
            ראה הכל
          </button>
        </div>

        <div className={styles.txList} role="list">
          {recent.map((tx) => (
            <button
              key={tx.id}
              className={styles.txRow}
              role="listitem"
              onClick={() => navigate('/history')}
              aria-label={`${tx.description}, ${tx.type === 'receive' ? '+' : '-'}${formatILS(tx.amountILS)}, ${tx.date}`}
            >
              <span
                className={`${styles.txIcon} ${tx.type === 'receive' ? styles.txIconReceive : styles.txIconSend}`}
                aria-hidden="true"
              >
                {tx.type === 'receive' ? '↓' : '↑'}
              </span>
              <span className={styles.txMeta}>
                <span className={styles.txDesc}>{tx.description}</span>
                <span className={styles.txDate}>{tx.date}</span>
              </span>
              <span
                className={`${styles.txAmount} ${tx.type === 'receive' ? styles.txAmountReceive : styles.txAmountSend}`}
                dir="ltr"
              >
                {tx.type === 'receive' ? '+' : '−'}{formatILS(tx.amountILS, 0)}
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
