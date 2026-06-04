import styles from './PageDecor.module.css';

export default function PageDecor() {
  return (
    <div className={styles.wrap} aria-hidden="true">
      <svg
        className={styles.svg}
        viewBox="0 0 430 280"
        xmlns="http://www.w3.org/2000/svg"
        overflow="hidden"
      >
        <defs>
          {/* Gold radial glow at top-right */}
          <radialGradient id="pd-glow" cx="100%" cy="0%" r="55%" gradientUnits="objectBoundingBox">
            <stop offset="0%"   stopColor="#E8920A" stopOpacity="0.09"/>
            <stop offset="100%" stopColor="#E8920A" stopOpacity="0"/>
          </radialGradient>
          {/* Soft glow halo behind the ₿ icon */}
          <radialGradient id="pd-btc-halo" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#E8920A" stopOpacity="0.13"/>
            <stop offset="60%"  stopColor="#E8920A" stopOpacity="0.05"/>
            <stop offset="100%" stopColor="#E8920A" stopOpacity="0"/>
          </radialGradient>
          {/* Shimmer sweep — gold highlight across the ₿ glyph */}
          <linearGradient id="pd-btc-shimmer" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#FFFFFF"  stopOpacity="0"/>
            <stop offset="45%"  stopColor="#FFFFFF"  stopOpacity="0.18"/>
            <stop offset="55%"  stopColor="#FFD580"  stopOpacity="0.10"/>
            <stop offset="100%" stopColor="#FFFFFF"  stopOpacity="0"/>
          </linearGradient>
          {/* Vertical fade for the whole SVG (bottom edge blends into page) */}
          <linearGradient id="pd-vfade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="55%" stopColor="white" stopOpacity="0"/>
            <stop offset="100%" stopColor="white" stopOpacity="1"/>
          </linearGradient>
        </defs>

        {/* Very subtle gold wash at top-right */}
        <rect width="430" height="280" fill="url(#pd-glow)"/>

        {/* ── Concentric arcs from top-right corner ── */}
        {/* Each arc is a full SVG circle; SVG clips them to the viewBox */}
        <circle cx="430" cy="0" r="215" fill="none" stroke="#E8920A" strokeWidth="0.9" opacity="0.20"/>
        <circle cx="430" cy="0" r="168" fill="none" stroke="#E8920A" strokeWidth="0.75" opacity="0.16"/>
        <circle cx="430" cy="0" r="124" fill="none" stroke="#E8920A" strokeWidth="0.65" opacity="0.13"/>
        <circle cx="430" cy="0" r="84"  fill="none" stroke="#E8920A" strokeWidth="0.55" opacity="0.10"/>
        <circle cx="430" cy="0" r="50"  fill="none" stroke="#E8920A" strokeWidth="0.45" opacity="0.08"/>

        {/* ── Gold accent dots — upper-right cluster ── */}
        <circle cx="393" cy="46"  r="2.8"  fill="#E8920A" opacity="0.42"/>
        <circle cx="414" cy="74"  r="1.7"  fill="#E8920A" opacity="0.32"/>
        <circle cx="372" cy="22"  r="1.4"  fill="#E8920A" opacity="0.28"/>
        <circle cx="353" cy="68"  r="1.1"  fill="#E8920A" opacity="0.22"/>
        <circle cx="418" cy="100" r="1.4"  fill="#E8920A" opacity="0.24"/>
        <circle cx="408" cy="30"  r="1.0"  fill="#E8920A" opacity="0.18"/>

        {/* ── Black / dark accent — left side balance ── */}
        <circle cx="30"  cy="60"  r="1.4"  fill="#0D0D0D" opacity="0.07"/>
        <circle cx="52"  cy="36"  r="0.9"  fill="#0D0D0D" opacity="0.05"/>
        <circle cx="18"  cy="90"  r="0.9"  fill="#0D0D0D" opacity="0.05"/>

        {/* ── Thin black sweep curve from lower-left ── */}
        <path
          d="M 0 170 C 55 80 145 18 240 0"
          stroke="#0D0D0D"
          strokeWidth="0.55"
          fill="none"
          opacity="0.06"
        />

        {/* ── Second thinner curve, offset ── */}
        <path
          d="M 0 210 C 70 120 170 45 290 0"
          stroke="#0D0D0D"
          strokeWidth="0.4"
          fill="none"
          opacity="0.04"
        />

        {/* ── Fine gold cross-hair lines radiating from corner ── */}
        <line x1="284" y1="0" x2="430" y2="104" stroke="#E8920A" strokeWidth="0.5" opacity="0.10"/>
        <line x1="332" y1="0" x2="430" y2="62"  stroke="#E8920A" strokeWidth="0.4" opacity="0.07"/>

        {/* ── Bitcoin ₿ icon — subtle watermark with halo + ring + shimmer ── */}
        {/* Outer soft glow halo */}
        <ellipse cx="96" cy="152" rx="58" ry="58" fill="url(#pd-btc-halo)"/>
        {/* Decorative outer ring — thin, dashed rhythm */}
        <circle cx="96" cy="152" r="46"
          fill="none" stroke="#E8920A" strokeWidth="0.7" opacity="0.18"
          strokeDasharray="4 3"/>
        {/* Inner solid ring */}
        <circle cx="96" cy="152" r="38"
          fill="none" stroke="#E8920A" strokeWidth="0.5" opacity="0.12"/>
        {/* The ₿ glyph itself — very faint watermark */}
        <text
          x="96" y="172"
          textAnchor="middle"
          fontFamily="'Helvetica Neue', Arial, sans-serif"
          fontSize="54"
          fontWeight="700"
          fill="#E8920A"
          opacity="0.09"
          letterSpacing="-1"
        >₿</text>
        {/* Shimmer overlay on the glyph area */}
        <ellipse cx="96" cy="152" rx="38" ry="38" fill="url(#pd-btc-shimmer)" opacity="0.8"/>

        {/* ── White overlay fade at bottom (blends into page background) ── */}
        <rect width="430" height="280" fill="url(#pd-vfade)"/>
      </svg>
    </div>
  );
}
