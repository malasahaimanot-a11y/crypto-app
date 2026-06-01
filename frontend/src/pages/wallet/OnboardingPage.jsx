import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as AuthService from '../../services/mock/auth.js';
import { useWallet } from '../../contexts/WalletContext.jsx';
import styles from './OnboardingPage.module.css';

// ─── Step 0: Welcome ───────────────────────────────────────
function Welcome({ onNext }) {
  return (
    <div key="welcome" className={`${styles.step} wStepIn`}>
      <div className={styles.heroArea}>
        <div className={styles.heroBadge} aria-hidden="true">⚡</div>
        <h1 className={styles.heroTitle}>
          הכסף שלך —<br/>
          בלי בנק, בלי עמלות,<br/>
          מוגן מנפילות
        </h1>
        <p className={styles.heroSub}>
          האפליקציה הראשונה שמביאה Bitcoin לכולם —<br/>
          פשוט כמו Bit, חזק כמו Bitcoin.
        </p>
      </div>

      <ul className={styles.benefits} aria-label="יתרונות">
        {[
          { icon: '🏦', title: 'בלי בנק', desc: 'הכסף שלך בידיים שלך. אף אחד לא יכול לקפוא לך את החשבון.' },
          { icon: '⚡', title: 'עמלות אפסיות', desc: '₪0.02 במקום ₪3.50. חסוך 99% מהעמלות.' },
          { icon: '🛡️', title: 'מוגן אוטומטית', desc: 'הטכנולוגיה שומרת על הקרן שלך אפילו כשהשוק יורד.' },
        ].map((b) => (
          <li key={b.title} className={styles.benefit}>
            <span className={styles.benefitIcon} aria-hidden="true">{b.icon}</span>
            <div>
              <strong className={styles.benefitTitle}>{b.title}</strong>
              <p className={styles.benefitDesc}>{b.desc}</p>
            </div>
          </li>
        ))}
      </ul>

      <button className={styles.btnPrimary} onClick={onNext}>
        בוא נתחיל
        <ArrowIcon />
      </button>
    </div>
  );
}

// ─── Step 1: Create Account ────────────────────────────────
function CreateAccount({ onSuccess }) {
  const [mode, setMode]         = useState('signup'); // signup | login
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [shake, setShake]       = useState(false);

  const lightningPreview = username.trim().length >= 1
    ? `${username.trim().toLowerCase()}@satoshipay.co`
    : null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 1400)); // simulate wallet creation
    try {
      let userData;
      if (mode === 'signup') {
        userData = AuthService.signup(username.trim(), password);
      } else {
        userData = AuthService.login(username.trim(), password);
      }
      onSuccess(userData);
    } catch (err) {
      setError(err.message);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div key={mode} className={`${styles.step} wStepIn`}>
      <h2 className={styles.formTitle}>
        {mode === 'signup' ? 'יצירת חשבון' : 'כניסה לחשבון'}
      </h2>
      <p className={styles.formSub}>
        {mode === 'signup'
          ? 'בחר שם משתמש — זוהי גם כתובת התשלום שלך'
          : 'הכנס פרטי הכניסה שלך'}
      </p>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={`${styles.field} ${shake ? 'wShake' : ''}`}>
          <label className={styles.fieldLabel} htmlFor="username">שם משתמש</label>
          <div className={styles.inputRow}>
            <span className={styles.inputPrefix} aria-hidden="true">@</span>
            <input
              id="username"
              type="text"
              className={styles.input}
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="username"
              dir="ltr"
              autoComplete="username"
              required
              disabled={loading}
              aria-describedby="username-hint"
            />
          </div>
          {lightningPreview && mode === 'signup' && (
            <p className={styles.lightningPreview} id="username-hint" aria-live="polite">
              <span aria-hidden="true">⚡</span> כתובת תשלום: {lightningPreview}
            </p>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="password">סיסמה</label>
          <div className={styles.inputRow}>
            <input
              id="password"
              type={showPw ? 'text' : 'password'}
              className={styles.input}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={mode === 'signup' ? 'לפחות 6 תווים' : 'הסיסמה שלך'}
              dir="ltr"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              required
              disabled={loading}
            />
            <button
              type="button"
              className={styles.eyeBtn}
              onClick={() => setShowPw(p => !p)}
              aria-label={showPw ? 'הסתר סיסמה' : 'הצג סיסמה'}
            >
              {showPw ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        {error && (
          <p className={styles.errorMsg} role="alert" aria-live="assertive">
            {error}
          </p>
        )}

        {mode === 'signup' && (
          <p className={styles.passwordNote}>
            🔐 הסיסמה מאבטחת את הארנק שלך. שמור אותה היטב — לא ניתן לשחזר ללא הסיסמה או מילות השחזור.
          </p>
        )}

        <button
          type="submit"
          className={styles.btnPrimary}
          disabled={loading || !username || !password}
          aria-busy={loading}
        >
          {loading ? (
            <>
              <span className={`${styles.spinner} wSpin`} aria-hidden="true"/>
              {mode === 'signup' ? 'יוצר ארנק...' : 'נכנס...'}
            </>
          ) : (
            <>
              {mode === 'signup' ? 'צור ארנק' : 'כנס'}
              <ArrowIcon />
            </>
          )}
        </button>
      </form>

      <button
        className={styles.modeSwitch}
        onClick={() => { setMode(m => m === 'signup' ? 'login' : 'signup'); setError(''); }}
      >
        {mode === 'signup' ? 'כבר יש לי חשבון — כניסה' : 'אין לי חשבון — הרשמה'}
      </button>
    </div>
  );
}

// ─── Step 2: Ready ─────────────────────────────────────────
function Ready({ user, onDone }) {
  return (
    <div key="ready" className={`${styles.step} ${styles.stepCenter} wStepIn`}>
      <div className={styles.successCircle} aria-hidden="true">
        <svg viewBox="0 0 52 52" width="52" height="52">
          <circle cx="26" cy="26" r="25" fill="none" stroke="white" strokeWidth="2"/>
          <polyline
            points="14,27 22,35 38,18"
            fill="none" stroke="white" strokeWidth="3"
            strokeLinecap="round" strokeLinejoin="round"
            strokeDasharray="50" strokeDashoffset="0"
            style={{ animation: 'wCheckDraw 0.5s 0.2s ease both' }}
          />
        </svg>
      </div>

      <h2 className={styles.readyTitle}>הארנק שלך מוכן!</h2>

      <div className={styles.readyAddress}>
        <span className={styles.addressLabel}>כתובת התשלום שלך</span>
        <span className={styles.addressValue} dir="ltr">
          ⚡ {user?.lightningAddress}
        </span>
        <span className={styles.addressHint}>שתף כדי לקבל כסף בשניות</span>
      </div>

      <div className={styles.recoveryNote}>
        <span className={styles.recoveryIcon} aria-hidden="true">🔑</span>
        <p>
          <strong>12 מילות שחזור</strong> שמורות לבטיחות.
          ניתן לצפות בהן תחת{' '}
          <span className={styles.recoveryLink}>הגדרות ← פרטים אישיים</span>.
        </p>
      </div>

      <button className={styles.btnPrimary} onClick={onDone}>
        קדימה!
        <ArrowIcon />
      </button>
    </div>
  );
}

// ─── Root component ────────────────────────────────────────
export default function OnboardingPage() {
  const [step, setStep]   = useState(0);
  const [newUser, setNewUser] = useState(null);
  const navigate = useNavigate();
  const { signIn } = useWallet();

  function handleSignupSuccess(userData) {
    signIn(userData);
    setNewUser(userData);
    setStep(2);
  }

  function handleDone() {
    navigate('/wallet', { replace: true });
  }

  return (
    <div className={styles.page}>
      {/* Progress dots */}
      <div className={styles.dots} role="tablist" aria-label="שלב">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            role="tab"
            aria-selected={i === step}
            className={`${styles.dot} ${i === step ? styles.dotActive : ''} ${i < step ? styles.dotDone : ''}`}
          />
        ))}
      </div>

      {step === 0 && <Welcome onNext={() => setStep(1)} />}
      {step === 1 && <CreateAccount onSuccess={handleSignupSuccess} />}
      {step === 2 && <Ready user={newUser} onDone={handleDone} />}
    </div>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  );
}
