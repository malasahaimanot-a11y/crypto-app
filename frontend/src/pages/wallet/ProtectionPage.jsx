import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatILS } from '../../data/mockWalletData.js';
import { PROTECTION_LEVELS } from '../../services/storage.js';
import { useWallet } from '../../contexts/WalletContext.jsx';
import styles from './ProtectionPage.module.css';

export default function ProtectionPage() {
  const navigate = useNavigate();
  const { wallet, updateProtectionLevel } = useWallet();

  const balance    = wallet?.totalILS ?? 0;
  const savedLevel = wallet?.protection?.level ?? 1;
  const [level,  setLevel]  = useState(savedLevel);
  const [saved,  setSaved]  = useState(false);

  const current      = PROTECTION_LEVELS[level] ?? PROTECTION_LEVELS[1];
  const protectedAmt = balance * (current.protectedPct / 100);
  const btcAmt       = balance * (current.btcPct / 100);

  function handleSave() {
    updateProtectionLevel(current.id);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className={styles.page}>
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
            <div className={styles.progressFill} style={{ width: `${current.protectedPct}%` }}/>
          </div>
          <span className={styles.progressPct} dir="ltr">{current.protectedPct}%</span>
        </div>

        <p className={styles.statusDesc} aria-live="polite">
          <span dir="ltr">{formatILS(protectedAmt, 0)}</span>
          {' '}מוגן מתוך{' '}
          <span dir="ltr">{formatILS(balance, 0)}</span>
        </p>
      </div>

      {/* Breakdown */}
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
          <span className={styles.riskBadge}
            style={{ color: current.riskColor, background: current.riskColor + '18' }}
            aria-live="polite">
            {current.riskLabel}
          </span>
        </div>

        <div className={styles.sliderWrap} dir="ltr">
          <input type="range" min="0" max="3" step="1"
            value={level}
            onChange={e => { setLevel(Number(e.target.value)); setSaved(false); }}
            className="wSlider"
            aria-label="רמת הגנה"
            aria-valuetext={current.label}
            style={{
              background: `linear-gradient(to right, #E8920A 0%, #E8920A ${(level / 3) * 100}%, #252525 ${(level / 3) * 100}%, #252525 100%)`
            }}
          />
          <div className={styles.sliderLabels}>
            {PROTECTION_LEVELS.map((l, i) => (
              <button key={l.id}
                className={`${styles.levelLabel} ${i === level ? styles.levelLabelActive : ''}`}
                onClick={() => { setLevel(i); setSaved(false); }}
                aria-pressed={i === level}>
                {l.label}
                <span className={styles.levelPct} dir="ltr">{l.protectedPct}%</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Level detail card */}
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
            { label: 'מוגן',   pct: current.protectedPct, cls: styles.levelBarProtected },
            { label: 'Bitcoin', pct: current.btcPct,       cls: styles.levelBarBtc },
          ].map(b => (
            <div key={b.label} className={styles.levelBarRow}>
              <span className={styles.levelBarLabel}>{b.label}</span>
              <div className={styles.levelBarTrack}>
                <div className={`${styles.levelBarFill} ${b.cls}`} style={{ width: `${b.pct}%` }}/>
              </div>
              <span className={styles.levelBarPct} dir="ltr">{b.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Save button */}
      <div className={styles.saveWrap}>
        <button
          className={`${styles.saveBtn} ${saved ? styles.saveBtnSuccess : ''}`}
          onClick={handleSave}
          aria-label={saved ? 'הגדרות נשמרו' : 'שמור הגדרות הגנה'}>
          {saved ? <><span aria-hidden="true">✓</span> נשמר בהצלחה</> : 'שמור הגדרות'}
        </button>
      </div>
    </div>
  );
}
