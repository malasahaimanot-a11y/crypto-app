import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { formatILS } from '../../data/mockWalletData.js';
import { useWallet } from '../../contexts/WalletContext.jsx';
import { useProtectionLevel } from '../../hooks/useProtectionLevel.js';
import { useBtcPrice } from '../../hooks/useBtcPrice.js';
import { useCountUp } from '../../hooks/useCountUp.js';
import PageDecor from '../../components/wallet/PageDecor.jsx';
import styles from './DashboardPage.module.css';

// ── Shared animation variants ──────────────────────────────
const fadeUp = {
  hidden:  { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0,  transition: { duration: 0.4, ease: 'easeOut' } },
};
const fadeIn = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.35 } },
};

export default function DashboardPage() {
  const navigate         = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, wallet, updateBtcRate } = useWallet();
  const { level: protLevel }            = useProtectionLevel();
  const { price, fresh, error }         = useBtcPrice();
  const prefersReduced   = useReducedMotion();

  useEffect(() => {
    if (price?.ils) updateBtcRate(price.ils);
  }, [price?.ils, updateBtcRate]);

  const btcRate      = price?.ils ?? wallet?.btcRateILS ?? 56500;
  const btcAmount    = wallet?.btcAmount    ?? 0;
  const protectedILS = wallet?.protectedILS ?? 0;
  const liveBtcILS   = Math.round(btcAmount * btcRate);
  const liveTotalILS = liveBtcILS + protectedILS;
  const liveBtcPct   = liveTotalILS > 0 ? Math.round((liveBtcILS / liveTotalILS) * 100) : 0;
  const liveProtPct  = 100 - liveBtcPct;

  const displayTotal = useCountUp(liveTotalILS, 1200, !prefersReduced);

  const recent      = (wallet?.transactions ?? []).slice(0, 4);
  const displayName = user?.displayName ?? user?.name ?? '';

  // Tap spring for primary vs secondary buttons
  const primaryTap   = { scale: 0.91, transition: { type: 'spring', stiffness: 400, damping: 20 } };
  const secondaryTap = { scale: 0.94, transition: { type: 'spring', stiffness: 400, damping: 20 } };

  return (
    <div className={styles.page}>
      <PageDecor />

      {/* ── Header ── */}
      <header className={styles.header}>
        <div className={styles.greeting}>
          <p className={styles.greetSub}>שלום,</p>
          <p className={styles.greetName}>{displayName}</p>
        </div>
        <div className={styles.menuWrap}>
          <motion.button
            className={styles.menuBtn}
            onClick={() => setMenuOpen(o => !o)}
            aria-label="תפריט" aria-expanded={menuOpen} aria-haspopup="true"
            whileTap={secondaryTap}>
            ⋮
          </motion.button>
          {menuOpen && (
            <>
              <div className={styles.menuBackdrop} onClick={() => setMenuOpen(false)} aria-hidden="true"/>
              <div className={styles.dropdown} role="menu">
                {[
                  { label: 'רמת הגנה', path: '/protection' },
                  { label: 'היסטוריה', path: '/history' },
                  { label: 'הגדרות',   path: '/settings' },
                ].map(item => (
                  <button key={item.path} className={styles.dropdownItem} role="menuitem"
                    onClick={() => { setMenuOpen(false); navigate(item.path); }}>
                    {item.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </header>

      {/* ── Balance section ── */}
      <motion.section
        className={styles.balanceSection}
        aria-label="יתרה נוכחית"
        initial={prefersReduced ? false : 'hidden'}
        animate="visible"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } } }}>

        {/* Label row */}
        <motion.div className={styles.balanceLabelRow} variants={fadeIn}>
          <p className={styles.balanceLabel}>היתרה שלך</p>
          {fresh && <span className={styles.freshBadge} aria-live="polite">עדכני ✓</span>}
          {error && !price && <span className={styles.errorBadge}>אין חיבור</span>}
        </motion.div>

        {/* Balance — counts up */}
        <motion.p className={styles.balanceAmount} aria-live="polite" dir="ltr" variants={fadeUp}>
          {formatILS(displayTotal)}
        </motion.p>

        {/* BTC price line — or skeleton while loading */}
        <motion.div variants={fadeIn}>
          {!price && !error && (
            <div className={styles.priceSkeleton} aria-label="טוען מחיר ביטקוין..." role="status"/>
          )}
          {price && (
            <p className={styles.btcPriceLine} dir="ltr">
              1 BTC = {formatILS(price.ils, 0)}
              <span className={styles.btcUsd}> · ${price.usd.toLocaleString()}</span>
            </p>
          )}
        </motion.div>

        {/* Split bar */}
        {liveTotalILS > 0 && (
          <motion.div className={styles.splitWrap} variants={fadeUp}>
            <div className={styles.splitRow} role="list" aria-label="הרכב הסכום">
              <div className={styles.pill} role="listitem">
                <div className={styles.pillHeader}>
                  <span className={styles.pillDot} style={{ background: 'var(--w-accent)' }} aria-hidden="true"/>
                  <span className={styles.pillLabel}>Bitcoin</span>
                </div>
                <span className={styles.pillAmount} dir="ltr">{formatILS(liveBtcILS, 0)}</span>
                {liveBtcPct > 0 && <span className={styles.pillPct} dir="ltr">{liveBtcPct}%</span>}
              </div>
              <div className={styles.pillDivider} aria-hidden="true"/>
              <div className={styles.pill} role="listitem">
                <div className={styles.pillHeader}>
                  <span className={styles.pillDot} style={{ background: 'var(--w-text-muted)' }} aria-hidden="true"/>
                  <span className={styles.pillLabel}>מוגן</span>
                </div>
                <span className={styles.pillAmount} dir="ltr">{formatILS(protectedILS, 0)}</span>
                {liveProtPct > 0 && <span className={styles.pillPct} dir="ltr">{liveProtPct}%</span>}
              </div>
            </div>
            <span className={styles.levelBadge} aria-label={`מסלול: ${protLevel.label}`}>
              {protLevel.icon} {protLevel.label}
            </span>
          </motion.div>
        )}
      </motion.section>

      {/* ── Action buttons — staggered ── */}
      <motion.div
        className={styles.actions}
        role="group" aria-label="פעולות"
        initial={prefersReduced ? false : 'hidden'}
        animate="visible"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1, delayChildren: 0.45 } } }}>

        {[
          { label: 'שלח',   path: '/send',    primary: false,
            icon: <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/></svg> },
          { label: 'הפקדה', path: '/deposit', primary: true,
            icon: <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="16"/><polyline points="7,11 12,16 17,11"/><path d="M20 21H4"/></svg> },
          { label: 'קבל',   path: '/receive', primary: false,
            icon: <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v14"/><polyline points="7,12 12,17 17,12"/><path d="M20 21H4"/></svg> },
        ].map(({ label, path, primary, icon }) => (
          <motion.button
            key={path}
            variants={fadeUp}
            className={`${styles.actionBtn} ${primary ? styles.actionPrimary : styles.actionSecondary}`}
            onClick={() => navigate(path)}
            aria-label={label}
            whileTap={primary ? primaryTap : secondaryTap}>
            <span className={styles.actionIcon} aria-hidden="true">{icon}</span>
            <span>{label}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* ── Recent activity ── */}
      <section className={styles.activity}>
        <motion.div
          className={styles.sectionHeader}
          initial={prefersReduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65, duration: 0.3 }}>
          <h2 className={styles.sectionTitle}>פעילות אחרונה</h2>
          {recent.length > 0 && (
            <button className={styles.seeAllBtn} onClick={() => navigate('/history')}>
              ראה הכל
            </button>
          )}
        </motion.div>

        {recent.length === 0 ? (
          <motion.div
            className={styles.emptyState}
            initial={prefersReduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.35 }}>
            <p className={styles.emptyIcon} aria-hidden="true">💸</p>
            <p className={styles.emptyText}>אין עדיין פעילות</p>
            <p className={styles.emptySub}>הפקד כסף כדי להתחיל</p>
          </motion.div>
        ) : (
          <div className={styles.txList} role="list">
            {recent.map((tx, i) => (
              <motion.button
                key={tx.id}
                className={styles.txRow}
                role="listitem"
                onClick={() => navigate('/history')}
                aria-label={`${tx.description}, ${tx.type === 'receive' ? '+' : '-'}${formatILS(tx.amountILS)}, ${tx.date}`}
                initial={prefersReduced ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75 + i * 0.1, duration: 0.32, ease: 'easeOut' }}
                whileTap={{ scale: 0.98, transition: { type: 'spring', stiffness: 400 } }}>
                <span className={`${styles.txIcon} ${tx.type === 'receive' ? styles.txIconReceive : styles.txIconSend}`}
                  aria-hidden="true">
                  {tx.type === 'receive' ? '↓' : '↑'}
                </span>
                <span className={styles.txMeta}>
                  <span className={styles.txDesc}>{tx.description}</span>
                  <span className={styles.txDate}>{tx.date}</span>
                </span>
                <span className={`${styles.txAmount} ${tx.type === 'receive' ? styles.txAmountReceive : styles.txAmountSend}`}
                  dir="ltr">
                  {tx.type === 'receive' ? '+' : '−'}{formatILS(tx.amountILS, 0)}
                </span>
              </motion.button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
