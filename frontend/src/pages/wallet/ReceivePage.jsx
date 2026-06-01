import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockWallet, formatILS } from '../../data/mockWalletData.js';
import styles from './ReceivePage.module.css';

/* Renders a decorative mock QR code (21×21, accurate finder patterns) */
function MockQR({ size = 220 }) {
  const N = 21;
  const cell = size / N;

  function isFinderDark(lx, ly) {
    if (lx === 0 || lx === 6 || ly === 0 || ly === 6) return true;
    if (lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4) return true;
    return false;
  }

  function inFinder(x, y) {
    if (x <= 6 && y <= 6) return isFinderDark(x, y);
    if (x >= 14 && y <= 6) return isFinderDark(x - 14, y);
    if (x <= 6 && y >= 14) return isFinderDark(x, y - 14);
    return null;
  }

  function isSeparator(x, y) {
    return (x === 7 && y <= 7) || (y === 7 && x <= 7) ||
           (x === 7 && y >= 14) || (y === 7 && x >= 14);
  }

  function isDataDark(x, y) {
    return ((x * 17 + y * 31 + x * y * 3) % 100) < 48;
  }

  const rects = [];
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      if (isSeparator(x, y)) continue;
      const f = inFinder(x, y);
      const dark = f !== null ? f : isDataDark(x, y);
      if (dark) {
        rects.push(
          <rect key={`${x}-${y}`}
            x={x * cell} y={y * cell}
            width={cell} height={cell}
            fill="#F7931A"
          />
        );
      }
    }
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
      role="img" aria-label="קוד QR לקבלת תשלומים">
      <rect width={size} height={size} fill="#0A0A0A" rx="8"/>
      {rects}
    </svg>
  );
}

export default function ReceivePage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('open'); // open | amount
  const [requestAmount, setRequestAmount] = useState('');
  const [copied, setCopied] = useState(false);

  const { lightning, onchain } = mockWallet.address;
  const shortOnchain = `${onchain.slice(0, 12)}...${onchain.slice(-8)}`;

  function copyAddress() {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/wallet')} aria-label="חזור">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 className={styles.title}>קבל כסף</h1>
        <div style={{ width: 44 }}/>
      </header>

      {/* Mode toggle */}
      <div className={styles.modeToggle} role="group" aria-label="סוג הבקשה">
        <button
          className={`${styles.modeBtn} ${mode === 'open' ? styles.modeBtnActive : ''}`}
          onClick={() => setMode('open')}
          aria-pressed={mode === 'open'}
        >
          כל סכום
        </button>
        <button
          className={`${styles.modeBtn} ${mode === 'amount' ? styles.modeBtnActive : ''}`}
          onClick={() => setMode('amount')}
          aria-pressed={mode === 'amount'}
        >
          סכום מסוים
        </button>
      </div>

      {/* Amount request input */}
      {mode === 'amount' && (
        <div className={styles.amountInputWrap}>
          <label className={styles.amountLabel} htmlFor="requestAmount">
            כמה כסף לבקש?
          </label>
          <div className={styles.amountInputRow}>
            <span className={styles.amountPrefix} aria-hidden="true">₪</span>
            <input
              id="requestAmount"
              type="number"
              className={styles.amountInput}
              placeholder="0"
              value={requestAmount}
              onChange={(e) => setRequestAmount(e.target.value)}
              min="0"
              dir="ltr"
              aria-label="סכום לבקשה בשקלים"
            />
          </div>
          {requestAmount && (
            <p className={styles.amountHint}>
              {formatILS(parseFloat(requestAmount) || 0)} יופיע בקוד QR
            </p>
          )}
        </div>
      )}

      {/* QR code */}
      <div className={styles.qrArea}>
        <div className={styles.qrCard}>
          <div className={styles.qrWrapper}>
            <MockQR size={220} />
          </div>

          {mode === 'amount' && requestAmount && (
            <div className={styles.qrAmountBadge} aria-live="polite">
              <span dir="ltr">{formatILS(parseFloat(requestAmount) || 0)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Lightning address */}
      <div className={styles.addressSection}>
        <div className={styles.addressCard}>
          <div className={styles.addressRow}>
            <div className={styles.addressInfo}>
              <span className={styles.addressTypeLabel}>
                <span aria-hidden="true">⚡</span> Lightning
              </span>
              <span className={styles.addressValue} dir="ltr">{lightning}</span>
            </div>
            <button
              className={`${styles.copyBtn} ${copied ? styles.copyBtnSuccess : ''}`}
              onClick={copyAddress}
              aria-label={copied ? 'הועתק!' : 'העתק כתובת'}
            >
              {copied
                ? <><span aria-hidden="true">✓</span> הועתק</>
                : <><svg viewBox="0 0 24 24" width="14" height="14" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <rect x="9" y="9" width="13" height="13" rx="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg> העתק</>
              }
            </button>
          </div>

          <div className={styles.divider}/>

          <div className={styles.addressRow}>
            <div className={styles.addressInfo}>
              <span className={styles.addressTypeLabel}>
                <span aria-hidden="true">₿</span> On-chain
              </span>
              <span className={styles.addressValue} dir="ltr">{shortOnchain}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Share button */}
      <div className={styles.shareSection}>
        <button className={styles.whatsappBtn} aria-label="שתף כתובת לוואצאפ">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
          </svg>
          שתף לוואצאפ
        </button>

        <button className={styles.linkBtn} aria-label="שתף קישור תשלום">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
          </svg>
          העתק קישור תשלום
        </button>
      </div>
    </div>
  );
}
