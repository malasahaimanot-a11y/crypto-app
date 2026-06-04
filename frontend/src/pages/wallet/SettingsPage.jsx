import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../../contexts/WalletContext.jsx';
import PageDecor from '../../components/wallet/PageDecor.jsx';
import styles from './SettingsPage.module.css';

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15,18 9,12 15,6"/>
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20,6 9,17 4,12"/>
    </svg>
  );
}

function ChevronIcon({ open }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }}
      aria-hidden="true">
      <polyline points="6,9 12,15 18,9"/>
    </svg>
  );
}

function CopyField({ label, value }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard?.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className={styles.copyField}>
      <span className={styles.copyLabel}>{label}</span>
      <div className={styles.copyRow}>
        <span className={styles.copyValue} dir="ltr">{value}</span>
        <button
          className={`${styles.copyBtn} ${copied ? styles.copyBtnDone : ''}`}
          onClick={handleCopy}
          aria-label={copied ? 'הועתק' : `העתק ${label}`}>
          {copied ? <CheckIcon /> : <CopyIcon />}
        </button>
      </div>
    </div>
  );
}

function SectionCard({ title, children }) {
  return (
    <section className={styles.card}>
      <h2 className={styles.cardTitle}>{title}</h2>
      {children}
    </section>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, signOut } = useWallet();
  const [wordsVisible,    setWordsVisible]    = useState(false);
  const [wordsBlurred,    setWordsBlurred]    = useState(true);
  const [logoutConfirm,   setLogoutConfirm]   = useState(false);

  const recoveryWords = user?.recoveryWords ?? [];

  function handleLogout() {
    if (!logoutConfirm) {
      setLogoutConfirm(true);
      setTimeout(() => setLogoutConfirm(false), 3000);
      return;
    }
    signOut();
    navigate('/onboard', { replace: true });
  }

  return (
    <div className={`${styles.page} wStepIn`}>
      <PageDecor />

      {/* Header */}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)} aria-label="חזור">
          <BackIcon />
        </button>
        <h1 className={styles.title}>הגדרות</h1>
        <div style={{ width: 44 }} />
      </header>

      <div className={styles.content}>

        {/* ── Personal Details ── */}
        <SectionCard title="פרטים אישיים">
          <div className={styles.avatarRow}>
            <div className={styles.avatar} aria-hidden="true">
              {user?.name?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div>
              <p className={styles.displayName}>{user?.name ?? '—'}</p>
              <p className={styles.userEmail}>{user?.email ?? '—'}</p>
            </div>
          </div>

          <div className={styles.infoRows}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>רמת הגנה</span>
              <span className={styles.infoValue}>{user?.protectionLevel ?? '—'}</span>
            </div>
          </div>

          <div className={styles.fields}>
            <CopyField label="כתובת Lightning" value={user?.lightningAddress ?? '—'} />
            <CopyField label="כתובת Bitcoin"   value={user?.mockAddress      ?? '—'} />
          </div>
        </SectionCard>

        {/* ── Recovery Words ── */}
        <SectionCard title="מילות גיבוי">
          <p className={styles.sectionHint}>
            שמור את 12 המילות האלה במקום בטוח. הן מאפשרות שחזור הארנק.
          </p>
          <button
            className={styles.revealBtn}
            onClick={() => setWordsVisible(v => !v)}
            aria-expanded={wordsVisible}>
            <span>{wordsVisible ? 'הסתר מילות גיבוי' : 'הצג מילות גיבוי'}</span>
            <ChevronIcon open={wordsVisible} />
          </button>

          {wordsVisible && (
            <div className={`${styles.wordGrid} wStepIn`}
              style={{ filter: wordsBlurred ? 'blur(6px)' : 'none', cursor: wordsBlurred ? 'pointer' : 'auto' }}
              onClick={() => wordsBlurred && setWordsBlurred(false)}
              role="group"
              aria-label={wordsBlurred ? 'לחץ לחשיפת מילות הגיבוי' : 'מילות גיבוי'}>
              {recoveryWords.map((word, i) => (
                <div key={i} className={styles.wordCell}>
                  <span className={styles.wordNum}>{i + 1}</span>
                  <span className={styles.wordText} dir="ltr">{word}</span>
                </div>
              ))}
              {wordsBlurred && (
                <div className={styles.blurHint}>לחץ לחשיפה</div>
              )}
            </div>
          )}
        </SectionCard>

        {/* ── Security ── */}
        <SectionCard title="אבטחה">
          <div className={styles.securityRows}>
            {[
              { label: 'נעילה ביומטרית',   desc: 'כניסה עם טביעת אצבע או פנים' },
              { label: 'אימות דו-שלבי',   desc: 'הגנה נוספת לחשבון שלך'        },
            ].map(r => (
              <div key={r.label} className={styles.securityRow}>
                <div>
                  <p className={styles.securityLabel}>{r.label}</p>
                  <p className={styles.securityDesc}>{r.desc}</p>
                </div>
                <div className={styles.badge}>בקרוב</div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ── About ── */}
        <SectionCard title="אודות">
          <div className={styles.infoRows}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>גרסה</span>
              <span className={styles.infoValue}>1.0.0 (beta)</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>רשת</span>
              <span className={styles.infoValue} dir="ltr">Bitcoin Mainnet</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>אפליקציה</span>
              <span className={styles.infoValue}>PassIT</span>
            </div>
          </div>
        </SectionCard>

        {/* Logout */}
        <button
          className={`${styles.logoutBtn} ${logoutConfirm ? styles.logoutConfirm : ''}`}
          onClick={handleLogout}>
          {logoutConfirm ? 'לחץ שוב לאישור יציאה' : 'יציאה מהחשבון'}
        </button>
      </div>
    </div>
  );
}
