import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockWallet, formatILS } from '../../data/mockWalletData.js';
import styles from './ProtectionPage.module.css';

export default function ProtectionPage() {
  const navigate = useNavigate();
  const { balance, protection } = mockWallet;
  const [level, setLevel] = useState(protection.currentLevel);
  const [saved, setSaved] = useState(false);

  const current = protection.levels[level];
  const protectedAmt = balance.totalILS * (current.protectedPct / 100);
  const btcAmt = balance.totalILS * (current.btcPct / 100);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

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
        <h1 className={styles.title}>רמת הגנה</h1>
        <div style={{ width: 44 }}/>
      </header>

      {/* Status card */}
      <div className={styles.statusCard} role="region" aria-label="סטטוס הגנה נוכחי">
        <p className={styles.statusQuestion}>כמה מהכסף שלך מוגן עכשיו?</p>

        <div className={styles.progressRow} aria-hidden="true">
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${current.protectedPct}%` }}
            />
          </div>
          <span className={styles.progressPct} dir="ltr">{current.protectedPct}%</span>
        </div>

        <p className={styles.statusDesc} aria-live="polite">
          <span dir="ltr">{formatILS(protectedAmt, 0)}</span>
          {' '}מוגן מתוך{' '}
          <span dir="ltr">{formatILS(balance.totalILS, 0)}</span>
        </p>
      </div>

      {/* What does this mean? */}
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

      {/* Slider */}
      <div className={styles.sliderSection}>
        <div className={styles.sliderHeader}>
          <p className={styles.sliderTitle}>שנה רמת הגנה</p>
          <span
            className={styles.riskBadge}
            style={{ color: current.riskColor, background: current.riskColor + '18' }}
            aria-live="polite"
          >
            {current.riskLabel}
          </span>
        </div>

        <div className={styles.sliderWrap} dir="ltr">
          <input
            type="range"
            min="0"
            max="2"
            step="1"
            value={level}
            onChange={(e) => { setLevel(Number(e.target.value)); setSaved(false); }}
            className="wSlider"
            aria-label="רמת הגנה"
            aria-valuetext={current.label}
            aria-valuenow={level}
            aria-valuemin={0}
            aria-valuemax={2}
            style={{
              background: `linear-gradient(to right, #F7931A 0%, #F7931A ${level * 50}%, #252525 ${level * 50}%, #252525 100%)`
            }}
          />
          <div className={styles.sliderLabels}>
            {protection.levels.map((l, i) => (
              <button
                key={l.id}
                className={`${styles.levelLabel} ${i === level ? styles.levelLabelActive : ''}`}
                onClick={() => { setLevel(i); setSaved(false); }}
                aria-pressed={i === level}
              >
                {l.label}
                <span className={styles.levelPct} dir="ltr">{l.protectedPct}%</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Current level detail card */}
      <div className={styles.levelCard} aria-live="polite">
        <div className={styles.levelCardHeader}>
          <span className={styles.levelIcon} aria-hidden="true">
            {level === 0 ? '⚡' : level === 1 ? '⚖️' : '🛡️'}
          </span>
          <div>
            <p className={styles.levelCardTitle}>{current.label}</p>
            <p className={styles.levelCardSub}>{current.description}</p>
          </div>
        </div>

        <div className={styles.levelCardBars}>
          <div className={styles.levelBarRow}>
            <span className={styles.levelBarLabel}>מוגן</span>
            <div className={styles.levelBarTrack}>
              <div
                className={`${styles.levelBarFill} ${styles.levelBarProtected}`}
                style={{ width: `${current.protectedPct}%` }}
              />
            </div>
            <span className={styles.levelBarPct} dir="ltr">{current.protectedPct}%</span>
          </div>
          <div className={styles.levelBarRow}>
            <span className={styles.levelBarLabel}>Bitcoin</span>
            <div className={styles.levelBarTrack}>
              <div
                className={`${styles.levelBarFill} ${styles.levelBarBtc}`}
                style={{ width: `${current.btcPct}%` }}
              />
            </div>
            <span className={styles.levelBarPct} dir="ltr">{current.btcPct}%</span>
          </div>
        </div>
      </div>

      {/* Save button */}
      <div className={styles.saveWrap}>
        <button
          className={`${styles.saveBtn} ${saved ? styles.saveBtnSuccess : ''}`}
          onClick={handleSave}
          aria-label={saved ? 'הגדרות נשמרו' : 'שמור הגדרות הגנה'}
        >
          {saved
            ? <><span aria-hidden="true">✓</span> נשמר בהצלחה</>
            : 'שמור הגדרות'}
        </button>
      </div>
    </div>
  );
}
