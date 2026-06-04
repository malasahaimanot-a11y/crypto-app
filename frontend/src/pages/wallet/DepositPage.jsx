import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatILS } from '../../data/mockWalletData.js';
import { PROTECTION_LEVELS } from '../../services/storage.js';
import { useWallet } from '../../contexts/WalletContext.jsx';
import styles from './DepositPage.module.css';

const KEYS = ['1','2','3','4','5','6','7','8','9','.','0','⌫'];

const METHODS = [
  { id: 'bank', title: 'העברה בנקאית',          sub: 'פועלים · לאומי · מזרחי · דיסקונט', icon: '🏦' },
  { id: 'card', title: 'כרטיס אשראי / Apple Pay', sub: 'Visa · Mastercard · Apple Pay',     icon: '💳' },
];

export default function DepositPage() {
  const navigate = useNavigate();
  const { wallet, depositPayment } = useWallet();
  const [step,   setStep]   = useState(0);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState(null);

  const amountNum    = parseFloat(amount) || 0;
  const protLevel    = wallet?.protection?.level ?? 1;
  const level        = PROTECTION_LEVELS[protLevel] ?? PROTECTION_LEVELS[1];
  const btcILS       = Math.round(amountNum * (level.btcPct / 100));
  const protILS      = amountNum - btcILS;
  const methodLabel  = METHODS.find(m => m.id === method)?.title ?? '';

  function handleKey(k) {
    if (k === '⌫') { setAmount(a => a.slice(0, -1)); return; }
    if (k === '.' && amount.includes('.')) return;
    if (k === '.' && amount === '') { setAmount('0.'); return; }
    const next  = amount + k;
    const parts = next.split('.');
    if (parts[1] && parts[1].length > 2) return;
    if (parts[0].length > 6) return;
    setAmount(next);
  }

  function goBack() {
    if (step > 0) setStep(s => s - 1);
    else navigate('/');
  }

  function confirmDeposit() {
    setStep(3);
    setTimeout(() => {
      depositPayment(amountNum, btcILS, protILS, methodLabel);
      navigate('/');
    }, 2600);
  }

  /* ── Step 3: Processing animation ─────────────────── */
  if (step === 3) {
    return (
      <div className={styles.processingScreen}>
        <div className={styles.spinnerWrap} aria-label="מעבד" role="status">
          <svg viewBox="0 0 64 64" width="72" height="72" aria-hidden="true">
            <circle cx="32" cy="32" r="27" fill="none" stroke="var(--w-border)" strokeWidth="5"/>
            <circle cx="32" cy="32" r="27" fill="none" stroke="var(--w-accent)" strokeWidth="5"
              strokeDasharray="50 120" strokeLinecap="round">
              <animateTransform attributeName="transform" type="rotate"
                from="0 32 32" to="360 32 32" dur="0.85s" repeatCount="indefinite"/>
            </circle>
          </svg>
          <span className={styles.btcBadge} aria-hidden="true">₿</span>
        </div>
        <p className={styles.processingTitle}>קונה ביטקוין...</p>
        <p className={styles.processingSub}>{formatILS(btcILS)} מועברים לביטקוין</p>
        <p className={styles.processingDetail}>{formatILS(protILS)} נשמרים כסטייבלקוין מוגן</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={goBack} aria-label="חזור">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 className={styles.title}>הפקדה</h1>
        <div style={{ width: 44 }}/>
      </header>

      <div className={styles.progress} aria-hidden="true">
        {[0, 1, 2].map(i => (
          <div key={i}
            className={`${styles.dot} ${i === step ? styles.dotActive : i < step ? styles.dotDone : ''}`}/>
        ))}
      </div>

      {/* ── Step 0: Amount ── */}
      {step === 0 && (
        <div className={`${styles.stepWrap} wStepIn`}>
          <p className={styles.stepHint}>כמה תרצה להפקיד?</p>

          <div className={styles.amountArea} aria-live="polite" aria-label={`סכום: ₪${amount || '0'}`}>
            <span className={styles.currency} aria-hidden="true">₪</span>
            <span className={`${styles.amountNum} ${!amount ? styles.amountPlaceholder : ''}`} dir="ltr">
              {amount || '0'}
            </span>
            <span className={`${styles.cursor} wCursorBlink`} aria-hidden="true">|</span>
          </div>

          {amountNum > 0 && (
            <div className={styles.splitPreview} aria-live="polite">
              <span><span className={styles.splitAccent}>₿</span> {formatILS(btcILS, 0)} ביטקוין</span>
              <span className={styles.splitSep}>+</span>
              <span><span className={styles.splitShield}>🛡</span> {formatILS(protILS, 0)} מוגן</span>
            </div>
          )}

          <div className={styles.numpad} role="group" aria-label="לוח מקשים">
            {KEYS.map(k => (
              <button key={k}
                className={`${styles.key} ${k === '⌫' ? styles.keyBack : ''}`}
                onClick={() => handleKey(k)}
                aria-label={k === '⌫' ? 'מחק' : k}>
                {k === '⌫'
                  ? <svg viewBox="0 0 24 24" width="20" height="20" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/>
                      <line x1="18" y1="9" x2="12" y2="15"/>
                      <line x1="12" y1="9" x2="18" y2="15"/>
                    </svg>
                  : k}
              </button>
            ))}
          </div>

          <div className={styles.footer}>
            <button className={`${styles.ctaBtn} ${amountNum <= 0 ? styles.ctaBtnDisabled : ''}`}
              disabled={amountNum <= 0} onClick={() => setStep(1)}>
              המשך
            </button>
          </div>
        </div>
      )}

      {/* ── Step 1: Payment method ── */}
      {step === 1 && (
        <div className={`${styles.stepWrap} wStepIn`}>
          <p className={styles.stepHint}>איך תרצה לשלם?</p>
          <div className={styles.methodList}>
            {METHODS.map(m => (
              <button key={m.id}
                className={`${styles.methodCard} ${method === m.id ? styles.methodSelected : ''}`}
                onClick={() => setMethod(m.id)}
                aria-pressed={method === m.id}>
                <span className={styles.methodIcon} aria-hidden="true">{m.icon}</span>
                <span className={styles.methodInfo}>
                  <span className={styles.methodTitle}>{m.title}</span>
                  <span className={styles.methodSub}>{m.sub}</span>
                </span>
                <span className={`${styles.methodCheck} ${method === m.id ? styles.methodCheckOn : ''}`} aria-hidden="true">
                  {method === m.id ? '✓' : ''}
                </span>
              </button>
            ))}
          </div>
          <div className={styles.footer}>
            <button className={`${styles.ctaBtn} ${!method ? styles.ctaBtnDisabled : ''}`}
              disabled={!method} onClick={() => setStep(2)}>
              המשך
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2: Confirm ── */}
      {step === 2 && (
        <div className={`${styles.stepWrap} wStepIn`}>
          <p className={styles.stepHint}>אישור הפקדה</p>
          <div className={styles.confirmCard}>
            <div className={styles.confirmTotal}>
              <p className={styles.confirmTotalLabel}>סכום להפקדה</p>
              <p className={styles.confirmTotalAmt} dir="ltr">{formatILS(amountNum)}</p>
            </div>
            <div className={styles.confirmDivider}/>
            <p className={styles.confirmSplitTitle}>
              פיצול לפי רמת הגנה &ldquo;{level.label}&rdquo;
            </p>
            <div className={styles.confirmSplit}>
              <div className={styles.confirmSplitRow}>
                <span className={`${styles.confirmSplitIcon} ${styles.iconGold}`} aria-hidden="true">₿</span>
                <span className={styles.confirmSplitLabel}>Bitcoin</span>
                <span className={styles.confirmSplitPct}>{100 - level.protectedPct}%</span>
                <span className={styles.confirmSplitAmt} dir="ltr">{formatILS(btcILS, 0)}</span>
              </div>
              <div className={styles.confirmSplitRow}>
                <span className={`${styles.confirmSplitIcon} ${styles.iconGrey}`} aria-hidden="true">🛡</span>
                <span className={styles.confirmSplitLabel}>מוגן (Stablecoin)</span>
                <span className={styles.confirmSplitPct}>{level.protectedPct}%</span>
                <span className={styles.confirmSplitAmt} dir="ltr">{formatILS(protILS, 0)}</span>
              </div>
            </div>
            <div className={styles.confirmDivider}/>
            <div className={styles.confirmMeta}>
              <span className={styles.confirmMetaKey}>אמצעי תשלום</span>
              <span className={styles.confirmMetaVal}>{methodLabel}</span>
            </div>
          </div>
          <div className={styles.footer}>
            <button className={styles.ctaBtn} onClick={confirmDeposit}>אשר הפקדה</button>
            <p className={styles.disclaimer}>הדמיה בלבד · לא יחויב שום אמצעי תשלום אמיתי</p>
          </div>
        </div>
      )}
    </div>
  );
}
