import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { formatILS } from '../../data/mockWalletData.js';
import { PROTECTION_LEVELS } from '../../services/storage.js';
import { useWallet } from '../../contexts/WalletContext.jsx';
import styles from './ProtectionPage.module.css';

// ── Confirmation modal ─────────────────────────────────────
function ConfirmModal({ fromIdx, toIdx, onConfirm, onCancel }) {
  const from = PROTECTION_LEVELS[fromIdx];
  const to   = PROTECTION_LEVELS[toIdx];

  return (
    <motion.div
      className={styles.overlay}
      role="dialog" aria-modal="true" aria-labelledby="modal-title"
      onClick={e => e.target === e.currentTarget && onCancel()}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}>
      <motion.div
        className={styles.modal}
        initial={{ scale: 0.88, opacity: 0, y: 16 }}
        animate={{ scale: 1,    opacity: 1, y: 0 }}
        exit={{ scale: 0.88, opacity: 0, y: 8 }}
        transition={{ type: 'spring', stiffness: 420, damping: 26 }}>
        <span className={styles.modalIcon} aria-hidden="true">🔄</span>
        <h2 className={styles.modalTitle} id="modal-title">שינוי מסלול הגנה</h2>
        <p className={styles.modalBody}>
          עובר מ<span className={styles.modalFrom}>{from?.label}</span>
          {' '}ל<span className={styles.modalTo}>{to?.label}</span>.{' '}
          שינוי זה ישפיע על אופן חלוקת הכסף שלך.
        </p>
        <div className={styles.modalBtns}>
          <button className={styles.modalCancel} onClick={onCancel}>
            ביטול
          </button>
          <button className={styles.modalConfirm} onClick={onConfirm}
            autoFocus>
            אישור
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main page ──────────────────────────────────────────────
export default function ProtectionPage() {
  const navigate = useNavigate();
  const { wallet, updateProtectionLevel } = useWallet();

  const balance = wallet?.totalILS ?? 0;

  const [level,        setLevel]        = useState(wallet?.protection?.level ?? 1);
  const [pendingLevel, setPendingLevel] = useState(null); // null = no modal
  const [saved,        setSaved]        = useState(false);

  // Sync once when wallet loads from localStorage (async)
  useEffect(() => {
    if (wallet?.protection?.level !== undefined) {
      setLevel(wallet.protection.level);
    }
  }, [wallet?.protection?.level]);

  const current      = PROTECTION_LEVELS[level] ?? PROTECTION_LEVELS[1];
  const protectedAmt = balance * (current.protectedPct / 100);
  const btcAmt       = balance * (current.btcPct / 100);

  // Ask for confirmation before applying a change
  function requestChange(newIdx) {
    if (newIdx === level) return; // already selected — nothing to do
    setPendingLevel(newIdx);
  }

  function applyChange() {
    const newIdx = pendingLevel;
    setPendingLevel(null);
    setLevel(newIdx);
    const lvl = PROTECTION_LEVELS[newIdx];
    if (lvl) updateProtectionLevel(lvl.id);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function cancelChange() {
    setPendingLevel(null);
  }

  return (
    <div className={styles.page}>
      {/* Confirmation modal — AnimatePresence for smooth exit */}
      <AnimatePresence>
        {pendingLevel !== null && (
        <ConfirmModal
          fromIdx={level}
          toIdx={pendingLevel}
          onConfirm={applyChange}
          onCancel={cancelChange}
        />
        )}
      </AnimatePresence>

      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/')} aria-label="חזור">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 className={styles.title}>רמת הגנה</h1>
        <div style={{ width: 44 }}/>
      </header>

      {/* ── Status card ── */}
      <div className={styles.statusCard} role="region" aria-label="סטטוס הגנה נוכחי">
        <p className={styles.statusQuestion}>כמה מהכסף שלך מוגן עכשיו?</p>
        <div className={styles.progressRow} aria-hidden="true">
          <div className={styles.progressBar}>
            <div className={styles.progressFill}
              style={{ width: `${current.protectedPct}%`, transition: 'width 350ms ease' }}/>
          </div>
          <span className={styles.progressPct} dir="ltr">{current.protectedPct}%</span>
        </div>
        <p className={styles.statusDesc} aria-live="polite">
          <span dir="ltr">{formatILS(protectedAmt, 0)}</span>
          {' '}מוגן מתוך{' '}
          <span dir="ltr">{formatILS(balance, 0)}</span>
        </p>
      </div>

      {/* ── Split breakdown ── */}
      <div className={styles.explainer}>
        <div className={styles.explainerRow}>
          <span className={styles.explainerDot} style={{ background: '#60A5FA' }} aria-hidden="true"/>
          <span className={styles.explainerLabel}>כסף מוגן (Stablecoin)</span>
          <span className={styles.explainerValue} dir="ltr">{formatILS(protectedAmt, 0)}</span>
        </div>
        <div className={styles.explainerRow}>
          <span className={styles.explainerDot} style={{ background: '#F7931A' }} aria-hidden="true"/>
          <span className={styles.explainerLabel}>ב-Bitcoin (לצמיחה)</span>
          <span className={styles.explainerValue} dir="ltr">{formatILS(btcAmt, 0)}</span>
        </div>
      </div>

      {/* ── Slider ── */}
      <div className={styles.sliderSection}>
        <div className={styles.sliderHeader}>
          <p className={styles.sliderTitle}>בחר רמת הגנה</p>
          <span className={styles.riskBadge}
            style={{ color: current.riskColor, background: current.riskColor + '18' }}
            aria-live="polite">
            {current.riskLabel}
          </span>
        </div>

        <div className={styles.sliderWrap} dir="ltr">
          <input type="range" min="0" max="3" step="1"
            value={level}
            onChange={e => requestChange(Number(e.target.value))}
            className="wSlider"
            aria-label="רמת הגנה"
            aria-valuetext={current.label}
            style={{
              background: `linear-gradient(to right, #E8920A 0%, #E8920A ${(level / 3) * 100}%, #E5E7EB ${(level / 3) * 100}%, #E5E7EB 100%)`
            }}
          />
          <div className={styles.sliderLabels}>
            {PROTECTION_LEVELS.map((l, i) => (
              <motion.button key={l.id}
                className={`${styles.levelLabel} ${i === level ? styles.levelLabelActive : ''}`}
                onClick={() => requestChange(i)}
                aria-pressed={i === level}
                whileHover={{ scale: i !== level ? 1.05 : 1 }}
                whileTap={{ scale: 0.94, transition: { type: 'spring', stiffness: 400 } }}>
                <span className={styles.levelLabelText}>{l.label}</span>
                <span className={styles.levelPct} dir="ltr">{l.protectedPct}%</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Active level detail card ── */}
      <div className={styles.levelCard} aria-live="polite">
        <div className={styles.levelCardHeader}>
          <span className={styles.levelIcon} aria-hidden="true">{current.icon}</span>
          <div>
            <p className={styles.levelCardTitle}>{current.label}</p>
            <p className={styles.levelCardSub}>{current.desc}</p>
          </div>
        </div>
        <div className={styles.levelCardBars}>
          {[
            { label: 'מוגן',    pct: current.protectedPct, cls: styles.levelBarProtected },
            { label: 'Bitcoin', pct: current.btcPct,        cls: styles.levelBarBtc },
          ].map(b => (
            <div key={b.label} className={styles.levelBarRow}>
              <span className={styles.levelBarLabel}>{b.label}</span>
              <div className={styles.levelBarTrack}>
                <div className={`${styles.levelBarFill} ${b.cls}`}
                  style={{ width: `${b.pct}%`, transition: 'width 350ms ease' }}/>
              </div>
              <span className={styles.levelBarPct} dir="ltr">{b.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Auto-save status ── */}
      <div className={styles.saveWrap}>
        {saved ? (
          <div className={styles.savedConfirm} role="status" aria-live="polite">
            <span aria-hidden="true">✓</span> נשמר בהצלחה
          </div>
        ) : (
          <p className={styles.saveHint}>השינויים נשמרים אוטומטית לאחר אישור</p>
        )}
      </div>
    </div>
  );
}
