import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as AuthService from '../../services/mock/auth.js';
import { PROTECTION_LEVELS } from '../../services/storage.js';
import { useWallet } from '../../contexts/WalletContext.jsx';
import styles from './OnboardingPage.module.css';

// ── Password strength ──────────────────────────────────────
function pwStrength(pw) {
  if (!pw || pw.length < 6) return 0;
  if (pw.length < 8)         return 1;
  const hasNum = /[0-9]/.test(pw);
  const hasMix = /[A-Za-z]/.test(pw);
  if (hasNum && hasMix)      return 3;
  return 2;
}
const STRENGTH_LABELS = ['', 'חלשה', 'בינונית', 'חזקה'];
const STRENGTH_COLORS = ['', '#DC2626', '#EA580C', '#16A34A'];

// ── Screen 0: Personal details ─────────────────────────────
function DetailsStep({ onNext }) {
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState('');

  const strength = pwStrength(password);
  const canNext  = name.trim().length >= 2 && email.includes('@') && password.length >= 8;

  function handleNext(e) {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 2) { setError('נא להזין שם מלא (לפחות 2 תווים)'); return; }
    if (!email.includes('@'))                   { setError('נא להזין כתובת מייל תקינה'); return; }
    if (password.length < 8)                    { setError('הסיסמה חייבת להכיל לפחות 8 תווים'); return; }
    setError('');
    onNext({ name: name.trim(), email: email.trim().toLowerCase(), password });
  }

  return (
    <div className={`${styles.step} wStepIn`}>
      <h2 className={styles.stepTitle}>יצירת חשבון</h2>
      <p className={styles.stepSub}>בוא נתחיל — כמה פרטים קטנים</p>

      <form className={styles.form} onSubmit={handleNext} noValidate>
        {/* Full name */}
        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="fullName">שם מלא</label>
          <div className={styles.inputRow}>
            <input id="fullName" type="text" className={styles.input}
              value={name} onChange={e => { setName(e.target.value); setError(''); }}
              placeholder="ישראל ישראלי" autoComplete="name" required/>
          </div>
        </div>

        {/* Email */}
        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="email">כתובת מייל</label>
          <div className={styles.inputRow}>
            <input id="email" type="email" className={styles.input}
              value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
              placeholder="you@example.com" dir="ltr" autoComplete="email" required/>
          </div>
        </div>

        {/* Password */}
        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="password">סיסמה</label>
          <div className={styles.inputRow}>
            <input id="password" type={showPw ? 'text' : 'password'} className={styles.input}
              value={password} onChange={e => { setPassword(e.target.value); setError(''); }}
              placeholder="לפחות 8 תווים" dir="ltr" autoComplete="new-password" required/>
            <button type="button" className={styles.eyeBtn}
              onClick={() => setShowPw(v => !v)}
              aria-label={showPw ? 'הסתר סיסמה' : 'הצג סיסמה'}>
              {showPw ? '🙈' : '👁️'}
            </button>
          </div>

          {/* Strength bar */}
          {password.length > 0 && (
            <div className={styles.strengthWrap} aria-live="polite">
              <div className={styles.strengthTrack}>
                <div
                  className={styles.strengthFill}
                  style={{
                    width:      `${(strength / 3) * 100}%`,
                    background: STRENGTH_COLORS[strength],
                  }}
                />
              </div>
              <span className={styles.strengthLabel} style={{ color: STRENGTH_COLORS[strength] }}>
                {STRENGTH_LABELS[strength]}
              </span>
            </div>
          )}
        </div>

        {error && <p className={styles.errorMsg} role="alert">{error}</p>}

        <button type="submit" className={styles.btnPrimary} disabled={!canNext}>
          המשך
          <ArrowIcon />
        </button>
      </form>
    </div>
  );
}

// ── Screen 1: Protection level ─────────────────────────────
function ProtectionStep({ onNext, onBack }) {
  const [selected, setSelected] = useState('מאוזן');

  return (
    <div className={`${styles.step} wStepIn`}>
      <h2 className={styles.stepTitle}>רמת ההגנה שלך</h2>
      <p className={styles.stepSub}>כמה מהכסף שלך יהיה מוגן אוטומטית?</p>

      <div className={styles.protGrid} role="radiogroup" aria-label="רמת הגנה">
        {PROTECTION_LEVELS.map(lvl => (
          <button
            key={lvl.id}
            role="radio"
            aria-checked={selected === lvl.id}
            className={`${styles.protCard} ${selected === lvl.id ? styles.protCardSelected : ''}`}
            onClick={() => setSelected(lvl.id)}
          >
            {lvl.recommended && (
              <span className={styles.protRecommended}>מומלץ</span>
            )}
            <span className={styles.protIcon} aria-hidden="true">{lvl.icon}</span>
            <span className={styles.protLabel}>{lvl.label}</span>
            <span className={styles.protSub}>{lvl.sub}</span>
            <span className={styles.protDesc}>{lvl.desc}</span>
          </button>
        ))}
      </div>

      <button className={styles.btnPrimary} onClick={() => onNext(selected)}>
        צור ארנק
        <ArrowIcon />
      </button>
      <button className={styles.backLink} onClick={onBack}>חזור</button>
    </div>
  );
}

// ── Screen 2: Wallet created ───────────────────────────────
function CreatedStep({ onDone }) {
  const [copied,  setCopied]  = useState(false);
  const { user } = useWallet();
  const words = user?.recoveryWords ?? [];

  function handleCopy() {
    navigator.clipboard?.writeText(words.join(' ')).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  }

  return (
    <div className={`${styles.step} ${styles.stepCenter} wStepIn`}>
      {/* Animated wallet icon */}
      <div className={styles.walletAnim} aria-hidden="true">
        <svg viewBox="0 0 64 64" width="64" height="64" fill="none">
          <rect x="4" y="16" width="56" height="36" rx="8" fill="#E8920A" opacity="0.15"/>
          <rect x="4" y="16" width="56" height="36" rx="8" stroke="#E8920A" strokeWidth="2.5"/>
          <rect x="36" y="28" width="20" height="12" rx="6" fill="#E8920A"/>
          <circle cx="44" cy="34" r="3" fill="white"/>
          <path d="M4 26 L60 26" stroke="#E8920A" strokeWidth="2.5"/>
        </svg>
      </div>

      <h2 className={styles.createdTitle}>הארנק שלך נוצר! ✅</h2>
      <p className={styles.createdSub}>שמור את 12 המילות השחזור שלך במקום בטוח</p>

      {/* 12 recovery words grid: 3 columns × 4 rows */}
      <div className={styles.wordsGrid} aria-label="12 מילות שחזור">
        {words.map((word, i) => (
          <div key={i} className={styles.wordCell}>
            <span className={styles.wordNum}>{i + 1}</span>
            <span className={styles.wordText} dir="ltr">{word}</span>
          </div>
        ))}
      </div>

      {/* Warning */}
      <div className={styles.warningBox} role="alert">
        <span aria-hidden="true">⚠️</span>
        <span>שמור את המילים האלה במקום בטוח. הן היחידות שיכולות לשחזר את הכסף שלך.</span>
      </div>

      {/* Copy button */}
      <button
        className={`${styles.copyWordsBtn} ${copied ? styles.copyWordsBtnDone : ''}`}
        onClick={handleCopy}
        aria-label={copied ? 'הועתק!' : 'העתק מילים'}
      >
        {copied ? '✓ הועתק!' : 'העתק מילים'}
      </button>

      <button className={styles.btnPrimary} onClick={onDone}>
        כניסה לארנק
        <ArrowIcon />
      </button>
    </div>
  );
}

// ── Login mode ─────────────────────────────────────────────
function LoginStep({ onSuccess, onSignup }) {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    try {
      const user = AuthService.login(email, password);
      onSuccess(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`${styles.step} wStepIn`}>
      <h2 className={styles.stepTitle}>ברוך הבא חזרה</h2>
      <p className={styles.stepSub}>הכנס פרטי הכניסה שלך</p>

      <form className={styles.form} onSubmit={handleLogin} noValidate>
        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="loginEmail">כתובת מייל</label>
          <div className={styles.inputRow}>
            <input id="loginEmail" type="email" className={styles.input}
              value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
              placeholder="you@example.com" dir="ltr" autoComplete="email"/>
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="loginPw">סיסמה</label>
          <div className={styles.inputRow}>
            <input id="loginPw" type={showPw ? 'text' : 'password'} className={styles.input}
              value={password} onChange={e => { setPassword(e.target.value); setError(''); }}
              placeholder="הסיסמה שלך" dir="ltr" autoComplete="current-password"/>
            <button type="button" className={styles.eyeBtn}
              onClick={() => setShowPw(v => !v)}
              aria-label={showPw ? 'הסתר' : 'הצג'}>
              {showPw ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        {error && <p className={styles.errorMsg} role="alert">{error}</p>}

        <button type="submit" className={styles.btnPrimary}
          disabled={loading || !email || !password} aria-busy={loading}>
          {loading
            ? <><span className={`${styles.spinner} wSpin`} aria-hidden="true"/> נכנס...</>
            : <> כנס <ArrowIcon /></>}
        </button>
      </form>

      <button className={styles.modeSwitch} onClick={onSignup}>
        אין לי חשבון — הרשמה
      </button>
    </div>
  );
}

// ── Root component ─────────────────────────────────────────
export default function OnboardingPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { signIn } = useWallet();

  // Landing page can pass { state: { mode: 'login' } } to open login directly
  const [mode,    setMode]    = useState(location.state?.mode ?? 'signup');
  const [step,    setStep]    = useState(0);        // 0 | 1 | 2
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  async function handleDetailsNext(data) {
    setDetails(data);
    setStep(1);
  }

  async function handleProtectionNext(protectionLevel) {
    setLoading(true);
    setError('');
    await new Promise(r => setTimeout(r, 1200)); // simulate wallet generation
    try {
      const user = AuthService.signup(
        details.name,
        details.email,
        details.password,
        protectionLevel,
      );
      signIn(user);
      setStep(2);
    } catch (err) {
      setError(err.message);
      setStep(1);
    } finally {
      setLoading(false);
    }
  }

  function handleDone() {
    navigate('/home', { replace: true });
  }

  function handleLoginSuccess(user) {
    signIn(user);
    navigate('/home', { replace: true });
  }

  const totalSteps = 3;
  const showDots   = mode === 'signup';

  return (
    <div className={styles.page}>
      {/* Progress dots (signup only) */}
      {showDots && (
        <div className={styles.dots} role="tablist" aria-label="שלב">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} role="tab" aria-selected={i === step}
              className={`${styles.dot} ${i === step ? styles.dotActive : ''} ${i < step ? styles.dotDone : ''}`}/>
          ))}
        </div>
      )}

      {/* Signup error (between screens) */}
      {error && <p className={styles.errorMsg} role="alert" style={{ margin: '16px 24px 0' }}>{error}</p>}

      {/* Loading overlay for wallet generation */}
      {loading && (
        <div className={styles.generating} aria-live="polite">
          <span className={`${styles.spinner} wSpin`} aria-hidden="true"/>
          <span>יוצר את הארנק שלך...</span>
        </div>
      )}

      {/* Screens */}
      {!loading && mode === 'signup' && step === 0 && (
        <DetailsStep onNext={handleDetailsNext} />
      )}
      {!loading && mode === 'signup' && step === 1 && (
        <ProtectionStep
          onNext={handleProtectionNext}
          onBack={() => setStep(0)}
        />
      )}
      {!loading && mode === 'signup' && step === 2 && (
        <CreatedStep onDone={handleDone} />
      )}
      {!loading && mode === 'login' && (
        <LoginStep
          onSuccess={handleLoginSuccess}
          onSignup={() => setMode('signup')}
        />
      )}

      {/* Toggle signup ↔ login (only on first signup screen or login screen) */}
      {!loading && ((mode === 'signup' && step === 0) || mode === 'login') && (
        <button className={styles.modeSwitch} onClick={() => {
          setMode(m => m === 'signup' ? 'login' : 'signup');
          setError('');
        }}>
          {mode === 'signup' ? 'יש לי כבר חשבון — כניסה' : 'אין לי חשבון — הרשמה'}
        </button>
      )}
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
