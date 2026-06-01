import { NavLink, useLocation } from 'react-router-dom';
import styles from './BottomNav.module.css';

const ITEMS = [
  {
    label: 'בית',
    path: '/',
    end: true,
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9,22 9,12 15,12 15,22"/>
      </svg>
    ),
  },
  {
    label: 'שלח',
    path: '/send',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13"/>
        <polygon points="22,2 15,22 11,13 2,9"/>
      </svg>
    ),
  },
  {
    label: 'קבל',
    path: '/receive',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v14"/>
        <polyline points="7,12 12,17 17,12"/>
        <path d="M20 21H4"/>
      </svg>
    ),
  },
  {
    label: 'הגנה',
    path: '/protection',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
  },
  {
    label: 'היסטוריה',
    path: '/history',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12,6 12,12 16,14"/>
      </svg>
    ),
  },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className={styles.nav} aria-label="ניווט ראשי">
      {ITEMS.map((item) => {
        const isActive = item.end
          ? location.pathname === item.path
          : location.pathname.startsWith(item.path);

        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={`${styles.item} ${isActive ? styles.active : ''}`}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className={styles.iconWrap}>{item.icon}</span>
            <span className={styles.label}>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
