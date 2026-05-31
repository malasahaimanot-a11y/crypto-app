import { NavLink } from 'react-router-dom';
import { useApp } from '../contexts/AppContext.jsx';
import styles from './Layout.module.css';

const NAV_ITEMS = [
  { to: '/',          label: 'שוק',        labelEn: 'Market',    icon: '📈' },
  { to: '/portfolio', label: 'תיק',         labelEn: 'Portfolio', icon: '💼' },
  { to: '/settings',  label: 'הגדרות',     labelEn: 'Settings',  icon: '⚙️' },
];

export default function Layout({ children }) {
  const { state } = useApp();
  const isHe = state.lang === 'he';

  return (
    <>
      <a href="#main" className="skip-link">
        {isHe ? 'עבור לתוכן הראשי' : 'Skip to main content'}
      </a>

      <div className={styles.shell}>
        <header className={styles.header} role="banner">
          <div className={styles.logo} aria-label="CryptoVault">
            <span className={styles.logoIcon} aria-hidden="true">🔐</span>
            <span className={styles.logoText}>CryptoVault</span>
          </div>

          <nav className={styles.nav} aria-label={isHe ? 'ניווט ראשי' : 'Main navigation'}>
            {NAV_ITEMS.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.navActive : ''}`
                }
                aria-current={undefined}
              >
                <span aria-hidden="true">{item.icon}</span>
                <span>{isHe ? item.label : item.labelEn}</span>
              </NavLink>
            ))}
          </nav>
        </header>

        <main id="main" className={styles.main} tabIndex={-1}>
          {children}
        </main>

        <footer className={styles.footer} role="contentinfo">
          <p className="text-muted">
            {isHe
              ? 'מידע לצורכי עיון בלבד. אינו מהווה ייעוץ השקעות.'
              : 'For informational purposes only. Not investment advice.'}
          </p>
        </footer>
      </div>
    </>
  );
}
