import { useApp } from '../contexts/AppContext.jsx';
import styles from './SettingsPage.module.css';

export default function SettingsPage() {
  const { state, dispatch } = useApp();
  const isHe = state.lang === 'he';

  return (
    <div>
      <h1 className={styles.pageTitle}>{isHe ? 'הגדרות נגישות ושפה' : 'Accessibility & Language Settings'}</h1>
      <p className="text-muted" style={{ marginBottom: 'var(--space-8)' }}>
        {isHe ? 'התאם את הממשק לצרכיך.' : 'Customize the interface to your needs.'}
      </p>

      {/* Language */}
      <section className={`card ${styles.section}`} aria-labelledby="lang-heading">
        <h2 id="lang-heading" className={styles.sectionTitle}>{isHe ? 'שפה / Language' : 'Language / שפה'}</h2>
        <div className={styles.optionGroup} role="radiogroup" aria-labelledby="lang-heading">
          {[{ value: 'he', label: 'עברית (RTL)', labelEn: 'Hebrew (RTL)' },
            { value: 'en', label: 'English (LTR)', labelEn: 'English (LTR)' }].map(opt => (
            <label key={opt.value} className={`${styles.option} ${state.lang === opt.value ? styles.optionActive : ''}`}>
              <input
                type="radio"
                name="language"
                value={opt.value}
                checked={state.lang === opt.value}
                onChange={() => dispatch({ type: 'SET_LANG', payload: opt.value })}
                className="sr-only"
              />
              <span className={styles.optionInner}>
                <span className={styles.optionLabel}>{isHe ? opt.label : opt.labelEn}</span>
              </span>
            </label>
          ))}
        </div>
      </section>

      {/* Font size */}
      <section className={`card ${styles.section}`} aria-labelledby="font-heading">
        <h2 id="font-heading" className={styles.sectionTitle}>{isHe ? 'גודל טקסט' : 'Text Size'}</h2>
        <div className={styles.optionGroup} role="radiogroup" aria-labelledby="font-heading">
          {[
            { value: 'normal', label: 'רגיל (18px)', labelEn: 'Normal (18px)' },
            { value: 'large',  label: 'גדול (21px)',  labelEn: 'Large (21px)' },
            { value: 'xlarge', label: 'ענק (24px)',   labelEn: 'Extra Large (24px)' },
          ].map(opt => (
            <label key={opt.value} className={`${styles.option} ${state.fontSize === opt.value ? styles.optionActive : ''}`}>
              <input
                type="radio"
                name="fontSize"
                value={opt.value}
                checked={state.fontSize === opt.value}
                onChange={() => dispatch({ type: 'SET_FONT_SIZE', payload: opt.value })}
                className="sr-only"
              />
              <span className={styles.optionInner}>
                <span className={styles.optionLabel}>{isHe ? opt.label : opt.labelEn}</span>
              </span>
            </label>
          ))}
        </div>
      </section>

      {/* High contrast */}
      <section className={`card ${styles.section}`} aria-labelledby="contrast-heading">
        <h2 id="contrast-heading" className={styles.sectionTitle}>{isHe ? 'ניגודיות גבוהה' : 'High Contrast'}</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <button
            role="switch"
            aria-checked={state.highContrast}
            aria-label={isHe ? 'הפעל ניגודיות גבוהה' : 'Toggle high contrast'}
            className={`${styles.toggle} ${state.highContrast ? styles.toggleOn : ''}`}
            onClick={() => dispatch({ type: 'TOGGLE_CONTRAST' })}
          >
            <span className={styles.toggleKnob} />
          </button>
          <span className="text-strong">
            {state.highContrast
              ? (isHe ? 'מופעל — ניגודיות מוגברת' : 'Enabled — Enhanced contrast')
              : (isHe ? 'כבוי' : 'Disabled')}
          </span>
        </div>
      </section>

      {/* Currency */}
      <section className={`card ${styles.section}`} aria-labelledby="currency-heading">
        <h2 id="currency-heading" className={styles.sectionTitle}>{isHe ? 'מטבע תצוגה' : 'Display Currency'}</h2>
        <div className={styles.optionGroup} role="radiogroup" aria-labelledby="currency-heading">
          {[
            { value: 'usd', label: 'דולר אמריקאי (USD $)', labelEn: 'US Dollar (USD $)' },
            { value: 'eur', label: 'אירו (EUR €)', labelEn: 'Euro (EUR €)' },
            { value: 'ils', label: 'שקל ישראלי (ILS ₪)', labelEn: 'Israeli Shekel (ILS ₪)' },
            { value: 'gbp', label: 'פאונד בריטי (GBP £)', labelEn: 'British Pound (GBP £)' },
          ].map(opt => (
            <label key={opt.value} className={`${styles.option} ${state.currency === opt.value ? styles.optionActive : ''}`}>
              <input
                type="radio"
                name="currency"
                value={opt.value}
                checked={state.currency === opt.value}
                onChange={() => dispatch({ type: 'SET_CURRENCY', payload: opt.value })}
                className="sr-only"
              />
              <span className={styles.optionInner}>
                <span className={styles.optionLabel}>{isHe ? opt.label : opt.labelEn}</span>
              </span>
            </label>
          ))}
        </div>
      </section>
    </div>
  );
}
