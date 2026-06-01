import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockWallet, formatILS } from '../../data/mockWalletData.js';
import styles from './HistoryPage.module.css';

const FILTERS = [
  { id: 'all',     label: 'הכל' },
  { id: 'receive', label: 'קיבלתי' },
  { id: 'send',    label: 'שלחתי' },
];

function TxRow({ tx }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  function copyTxId() {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={styles.txWrapper}>
      <button
        className={styles.txRow}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label={`${tx.description}, ${tx.type === 'receive' ? '+' : '-'}${formatILS(tx.amountILS)}, ${tx.date}. ${open ? 'סגור פרטים' : 'פתח פרטים'}`}
      >
        <span
          className={`${styles.txIcon} ${tx.type === 'receive' ? styles.iconReceive : styles.iconSend}`}
          aria-hidden="true"
        >
          {tx.type === 'receive' ? '↓' : '↑'}
        </span>

        <span className={styles.txMeta}>
          <span className={styles.txDesc}>{tx.description}</span>
          <span className={styles.txDateTime}>{tx.date} · {tx.time}</span>
        </span>

        <span className={styles.txRight}>
          <span
            className={`${styles.txAmount} ${tx.type === 'receive' ? styles.amountReceive : styles.amountSend}`}
            dir="ltr"
          >
            {tx.type === 'receive' ? '+' : '−'}{formatILS(tx.amountILS, 0)}
          </span>
          <span className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`} aria-hidden="true">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6,9 12,15 18,9"/>
            </svg>
          </span>
        </span>
      </button>

      {open && (
        <div className={styles.txDetails} role="region" aria-label={`פרטי עסקה: ${tx.description}`}>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>סטטוס</span>
            <span className={`${styles.detailValue} ${styles.statusConfirmed}`}>
              <span aria-hidden="true">✓</span> אושרה
            </span>
          </div>

          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>תאריך</span>
            <span className={styles.detailValue} dir="ltr">{tx.date} {tx.time}</span>
          </div>

          {tx.note && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>הערה</span>
              <span className={styles.detailValue}>{tx.note}</span>
            </div>
          )}

          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>מזהה עסקה</span>
            <div className={styles.txIdRow}>
              <span className={styles.txIdText} dir="ltr">{tx.txId}</span>
              <button
                className={`${styles.copyBtn} ${copied ? styles.copyBtnDone : ''}`}
                onClick={copyTxId}
                aria-label={copied ? 'הועתק' : 'העתק מזהה עסקה'}
              >
                {copied
                  ? <span aria-hidden="true">✓</span>
                  : <svg viewBox="0 0 24 24" width="14" height="14" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                      <rect x="9" y="9" width="13" height="13" rx="2"/>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HistoryPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');

  const filtered = mockWallet.transactions.filter((tx) =>
    filter === 'all' || tx.type === filter
  );

  const totalReceived = mockWallet.transactions
    .filter((t) => t.type === 'receive')
    .reduce((s, t) => s + t.amountILS, 0);

  const totalSent = mockWallet.transactions
    .filter((t) => t.type === 'send')
    .reduce((s, t) => s + t.amountILS, 0);

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/')} aria-label="חזור">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 className={styles.title}>היסטוריה</h1>
        <div style={{ width: 44 }}/>
      </header>

      {/* Summary row */}
      <div className={styles.summaryRow}>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>קיבלתי</span>
          <span className={`${styles.summaryAmt} ${styles.summaryReceive}`} dir="ltr">
            +{formatILS(totalReceived, 0)}
          </span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>שלחתי</span>
          <span className={`${styles.summaryAmt} ${styles.summarySend}`} dir="ltr">
            −{formatILS(totalSent, 0)}
          </span>
        </div>
      </div>

      {/* Filter tabs */}
      <div className={styles.filterRow} role="group" aria-label="סינון עסקאות">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            className={`${styles.filterBtn} ${filter === f.id ? styles.filterActive : ''}`}
            onClick={() => setFilter(f.id)}
            aria-pressed={filter === f.id}
          >
            {f.label}
            <span className={styles.filterCount} aria-label={`${mockWallet.transactions.filter(t => f.id === 'all' || t.type === f.id).length} עסקאות`}>
              {f.id === 'all'
                ? mockWallet.transactions.length
                : mockWallet.transactions.filter((t) => t.type === f.id).length}
            </span>
          </button>
        ))}
      </div>

      {/* Transaction list */}
      <div className={styles.txList} role="list" aria-label="רשימת עסקאות">
        {filtered.length === 0 ? (
          <p className={styles.emptyMsg}>אין עסקאות להצגה</p>
        ) : (
          filtered.map((tx) => (
            <div key={tx.id} role="listitem">
              <TxRow tx={tx} />
            </div>
          ))
        )}
      </div>

      {/* Export button */}
      <div className={styles.exportWrap}>
        <button className={styles.exportBtn} aria-label="יצוא לדוח מס">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7,10 12,15 17,10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          יצוא לדוח מס (CSV)
        </button>
      </div>
    </div>
  );
}
