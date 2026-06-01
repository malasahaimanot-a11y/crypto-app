import styles from './MoneyBar.module.css';

// Reusable "growing vs protected" split bar.
// dark=true renders lighter colors suitable for dark card backgrounds.
export default function MoneyBar({ growing = 0, protected: prot = 0, total, dark = false }) {
  const safeTotal = total || growing + prot || 1;
  const growPct  = Math.round((growing / safeTotal) * 100);
  const protPct  = 100 - growPct;

  return (
    <div
      className={`${styles.bar} ${dark ? styles.dark : ''}`}
      role="img"
      aria-label={`${growPct}% צומח, ${protPct}% מוגן`}
    >
      {growPct > 0 && (
        <div
          className={styles.growSegment}
          style={{ width: `${growPct}%` }}
          aria-hidden="true"
        />
      )}
      {protPct > 0 && (
        <div
          className={styles.protSegment}
          style={{ width: `${protPct}%` }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
