import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../../contexts/WalletContext.jsx';
import styles from './LandingPage.module.css';

const FEATURES = [
  { icon: '🛡️', label: 'מוגן אוטומטית' },
  { icon: '⚡', label: 'מהיר כמו מחשבה' },
  { icon: '🔑', label: 'הארנק שלך בלבד' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, ready } = useWallet();

  // Logged-in users skip straight to the dashboard
  useEffect(() => {
    if (ready && user) {
      navigate('/home', { replace: true });
    }
  }, [ready, user, navigate]);

  // Don't flash the landing page while we're still checking localStorage
  if (!ready) return null;

  return (
    <div className={styles.page}>

      {/* ── Hero ─────────────────────────────── */}
      <div className={styles.hero}>
        <div className={styles.glowRing}  aria-hidden="true" />
        <div className={styles.btcCircle} aria-hidden="true">
          <span className={styles.btcSymbol}>₿</span>
        </div>
        <h1 className={styles.appName}>PassIT</h1>
      </div>

      {/* ── Tagline ──────────────────────────── */}
      <div className={styles.taglineWrap}>
        <p className={styles.tagline}>תעביר את זה ⚡</p>
        <p className={styles.subtitle}>
          הכסף שלך. בלי בנק. בלי עמלות. בלי פשרות.
        </p>
      </div>

      {/* ── Feature cards ────────────────────── */}
      <div className={styles.features} role="list" aria-label="יתרונות">
        {FEATURES.map(f => (
          <div key={f.label} className={styles.featureCard} role="listitem">
            <span className={styles.featureIcon} aria-hidden="true">{f.icon}</span>
            <span className={styles.featureLabel}>{f.label}</span>
          </div>
        ))}
      </div>

      {/* ── CTA ──────────────────────────────── */}
      <div className={styles.ctaWrap}>
        <button
          className={styles.ctaBtn}
          onClick={() => navigate('/onboard')}
        >
          בואו נתחיל
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
            strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>

        <button
          className={styles.loginLink}
          onClick={() => navigate('/onboard', { state: { mode: 'login' } })}
        >
          כבר יש לך ארנק? <span className={styles.loginLinkAccent}>התחבר</span>
        </button>
      </div>

    </div>
  );
}
