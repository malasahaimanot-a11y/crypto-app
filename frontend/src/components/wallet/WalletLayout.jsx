import { useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import BottomNav from './BottomNav.jsx';
import { useWallet } from '../../contexts/WalletContext.jsx';
import styles from './WalletLayout.module.css';

export default function WalletLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, ready } = useWallet();
  const hideNav = pathname === '/onboard' || pathname === '/deposit';
  const mainRef = useRef(null);

  useEffect(() => {
    document.body.classList.add('wallet-active');
    return () => document.body.classList.remove('wallet-active');
  }, []);

  useEffect(() => {
    if (ready && !user && pathname !== '/onboard') {
      navigate('/onboard', { replace: true });
    }
  }, [ready, user, pathname, navigate]);

  // Drive the --decor-opacity CSS variable from scroll position
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;

    function onScroll() {
      const opacity = Math.max(0, 1 - el.scrollTop / 160);
      el.style.setProperty('--decor-opacity', opacity);
    }

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

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
