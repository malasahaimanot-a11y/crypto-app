import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import BottomNav from './BottomNav.jsx';
import styles from './WalletLayout.module.css';

export default function WalletLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const hideNav = pathname === '/onboard' || pathname === '/deposit';

  useEffect(() => {
    document.body.classList.add('wallet-active');
    return () => document.body.classList.remove('wallet-active');
  }, []);

  useEffect(() => {
    if (!localStorage.getItem('satoshi_onboarded') && pathname !== '/onboard') {
      navigate('/onboard', { replace: true });
    }
  }, [pathname, navigate]);

  return (
    <div className={styles.root}>
      <div className={styles.screen}>
        <a href="#main" className={styles.skipLink}>דלג לתוכן</a>
        <main id="main" className={styles.main}>
          <Outlet />
        </main>
        {!hideNav && <BottomNav />}
      </div>
    </div>
  );
}
