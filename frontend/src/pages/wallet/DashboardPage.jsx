import { useNavigate } from 'react-router-dom';
import { mockWallet, formatILS } from '../../data/mockWalletData.js';
import styles from './DashboardPage.module.css';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, balance, transactions } = mockWallet;
  const recent = transactions.slice(0, 4);

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.greeting}>
          <p className={styles.greetSub}>שלום,</p>
          <p className={styles.greetName}>{user.name} 👋</p>
        </div>
        <button
          className={styles.settingsBtn}
          onClick={() => navigate('/wallet/settings')}
          aria-label="הגדרות"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>
      </header>

      {/* Balance card */}
      <div className={styles.cardWrap}>
        <div className={styles.balanceCard} role="region" aria-label="יתרה נוכחית">
          <p className={styles.cardLabel}>היתרה הכוללת שלך</p>

          <p className={styles.balanceAmount} aria-live="polite">
            <span dir="ltr">{formatILS(balance.totalILS)}</span>
          </p>

          <div className={styles.change24h} aria-label={`שינוי של ${balance.change24h > 0 ? '+' : ''}${balance.change24h}% היום`}>
            <span className={styles.changeArrow}>{balance.change24h > 0 ? '↑' : '↓'}</span>
            <span dir="ltr">{balance.change24h > 0 ? '+' : ''}{balance.change24h}%</span>
            <span className={styles.changePeriod}>היום</span>
          </div>

          {/* Split pills */}
          <div className={styles.splitRow} role="list" aria-label="הרכב הסכום">
            <div className={styles.pill} role="listitem">
              <span className={styles.pillDot} style={{ background: '#F7931A' }} aria-hidden="true"/>
              <span>Bitcoin</span>
              <span className={styles.pillAmount} dir="ltr">{formatILS(balance.bitcoinILS, 0)}</span>
              <span className={styles.pillPct} dir="ltr">{balance.bitcoinPct}%</span>
            </div>
            <div className={styles.pill} role="listitem">
              <span className={styles.pillDot} style={{ background: '#60A5FA' }} aria-hidden="true"/>
              <span>מוגן</span>
              <span className={styles.pillAmount} dir="ltr">{formatILS(balance.stablecoinILS, 0)}</span>
              <span className={styles.pillPct} dir="ltr">{balance.stablecoinPct}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className={styles.actions}>
        <button
          className={`${styles.actionBtn} ${styles.sendBtn}`}
          onClick={() => navigate('/wallet/send')}
          aria-label="שלח כסף"
        >
          <span className={styles.actionIcon} aria-hidden="true">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22,2 15,22 11,13 2,9"/>
            </svg>
          </span>
          <span>שלח</span>
        </button>

        <button
          className={`${styles.actionBtn} ${styles.receiveBtn}`}
          onClick={() => navigate('/wallet/receive')}
          aria-label="קבל כסף"
        >
          <span className={styles.actionIcon} aria-hidden="true">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none"
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
            onClick={() => navigate('/wallet/history')}
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
              onClick={() => navigate('/wallet/history')}
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
