import { useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import BottomNav from './BottomNav.jsx';
import { useWallet } from '../../contexts/WalletContext.jsx';
import styles from './WalletLayout.module.css';

export default function WalletLayout() {
  const { pathname } = useLocation();
  const navigate     = useNavigate();
  const { user, ready } = useWallet();
  const mainRef = useRef(null);

  useEffect(() => {
    document.body.classList.add('wallet-active');
    return () => document.body.classList.remove('wallet-active');
  }, []);

  // Unauthenticated users go to the landing page
  useEffect(() => {
    if (ready && !user) {
      navigate('/landing', { replace: true });
    }
  }, [ready, user, navigate]);

  // Drive --decor-opacity from scroll position
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    function onScroll() {
      el.style.setProperty('--decor-opacity', Math.max(0, 1 - el.scrollTop / 160));
    }
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const hideNav = pathname === '/deposit';

  return (
    <div className={styles.root}>
      <div className={styles.screen}>
        <a href="#main" className={styles.skipLink}>דלג לתוכן</a>
        <main id="main" ref={mainRef} className={styles.main}>
          <Outlet />
        </main>
        {!hideNav && <BottomNav />}
      </div>
    </div>
  );
}
