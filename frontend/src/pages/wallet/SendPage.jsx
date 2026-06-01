import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockWallet, formatILS } from '../../data/mockWalletData.js';
import styles from './SendPage.module.css';

const KEYS = ['1','2','3','4','5','6','7','8','9','.','0','⌫'];

export default function SendPage() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState(null);
  const [tab, setTab] = useState('contacts'); // contacts | lightning | qr
  const [note, setNote] = useState('');
  const [lightningAddr, setLightningAddr] = useState('');
  const [sent, setSent] = useState(false);

  const displayAmount = amount === '' ? '0' : amount;
  const amountNum = parseFloat(amount) || 0;
  const canSend = amountNum > 0 && (recipient || lightningAddr.includes('@'));

  function handleKey(k) {
    if (k === '⌫') {
      setAmount(a => a.slice(0, -1));
      return;
    }
    if (k === '.' && amount.includes('.')) return;
    if (k === '.' && amount === '') { setAmount('0.'); return; }
    const next = amount + k;
    const parts = next.split('.');
    if (parts[1] && parts[1].length > 2) return;
    if (parts[0].length > 6) return;
    setAmount(next);
  }

  function handleSend() {
    if (!canSend) return;
    setSent(true);
    setTimeout(() => navigate('/wallet'), 2200);
  }

  if (sent) {
    return (
      <div className={styles.successScreen}>
        <div className={styles.successRipple} aria-hidden="true"/>
        <div className={styles.successIcon} aria-hidden="true">✓</div>
        <p className={styles.successTitle}>הכסף נשלח!</p>
        <p className={styles.successSub}>
          {formatILS(amountNum)} אל {recipient?.name || lightningAddr}
        </p>
      </div>
    );
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
        <h1 className={styles.title}>שלח כסף</h1>
        <div style={{ width: 44 }}/>
      </header>

      {/* Amount display */}
      <div className={styles.amountArea} aria-live="polite" aria-label={`סכום: ${formatILS(amountNum)}`}>
        <span className={styles.currency} aria-hidden="true">₪</span>
        <span className={`${styles.amountNum} ${amount === '' ? styles.amountPlaceholder : ''}`} dir="ltr">
          {displayAmount}
        </span>
        <span className={`${styles.cursor} wCursorBlink`} aria-hidden="true">|</span>
      </div>

      {/* Fee badge */}
      {amountNum > 0 && (
        <div className={styles.feeBadge} role="status">
          <span aria-hidden="true">⚡</span>
          <span>עמלה: ~₪0.01 (כמעט חינם)</span>
        </div>
      )}

      {/* Number pad */}
      <div className={styles.numpad} role="group" aria-label="לוח מקשים">
        {KEYS.map((k) => (
          <button
            key={k}
            className={`${styles.key} ${k === '⌫' ? styles.keyBack : ''}`}
            onClick={() => handleKey(k)}
            aria-label={k === '⌫' ? 'מחק' : k}
          >
            {k === '⌫'
              ? <svg viewBox="0 0 24 24" width="22" height="22" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/>
                  <line x1="18" y1="9" x2="12" y2="15"/>
                  <line x1="12" y1="9" x2="18" y2="15"/>
                </svg>
              : k}
          </button>
        ))}
      </div>

      {/* Recipient */}
      <div className={styles.recipientSection}>
        <p className={styles.recipientLabel}>שלח אל</p>

        <div className={styles.tabs} role="tablist">
          {[
            { id: 'contacts', label: 'אנשי קשר' },
            { id: 'lightning', label: 'כתובת Lightning' },
            { id: 'qr', label: 'סרוק QR' },
          ].map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              className={`${styles.tab} ${tab === t.id ? styles.tabActive : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'contacts' && (
          <div className={styles.contactList} role="tabpanel" aria-label="אנשי קשר">
            {mockWallet.contacts.map((c) => (
              <button
                key={c.id}
                className={`${styles.contactRow} ${recipient?.id === c.id ? styles.contactSelected : ''}`}
                onClick={() => setRecipient(recipient?.id === c.id ? null : c)}
                aria-pressed={recipient?.id === c.id}
                aria-label={`שלח ל${c.name}`}
              >
                <span
                  className={styles.avatar}
                  style={{ background: c.color }}
                  aria-hidden="true"
                >
                  {c.initials}
                </span>
                <span className={styles.contactMeta}>
                  <span className={styles.contactName}>{c.name}</span>
                  <span className={styles.contactAddr}>{c.address}</span>
                </span>
                {recipient?.id === c.id && (
                  <span className={styles.checkIcon} aria-hidden="true">✓</span>
                )}
              </button>
            ))}
          </div>
        )}

        {tab === 'lightning' && (
          <div className={styles.inputWrap} role="tabpanel" aria-label="כתובת Lightning">
            <input
              type="text"
              className={styles.addrInput}
              placeholder="user@domain.com"
              value={lightningAddr}
              onChange={(e) => setLightningAddr(e.target.value)}
              dir="ltr"
              aria-label="כתובת Lightning"
            />
          </div>
        )}

        {tab === 'qr' && (
          <div className={styles.qrPrompt} role="tabpanel" aria-label="סריקת QR">
            <div className={styles.qrFrame} aria-hidden="true">
              <svg viewBox="0 0 80 80" width="80" height="80" fill="none"
                stroke="var(--w-navy)" strokeWidth="3">
                <polyline points="0,20 0,0 20,0"/>
                <polyline points="60,0 80,0 80,20"/>
                <polyline points="80,60 80,80 60,80"/>
                <polyline points="20,80 0,80 0,60"/>
              </svg>
            </div>
            <p className={styles.qrText}>הפנה את המצלמה לקוד QR</p>
            <button className={styles.qrOpenBtn} aria-label="פתח מצלמה (סימולציה)">
              פתח מצלמה
            </button>
          </div>
        )}
      </div>

      {/* Optional note */}
      <div className={styles.noteWrap}>
        <input
          type="text"
          className={styles.noteInput}
          placeholder="הוסף הערה (אופציונלי)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={60}
          aria-label="הערה לתשלום"
        />
      </div>

      {/* Send button */}
      <div className={styles.sendWrap}>
        <button
          className={`${styles.sendBtn} ${!canSend ? styles.sendBtnDisabled : ''}`}
          onClick={handleSend}
          disabled={!canSend}
          aria-disabled={!canSend}
        >
          {canSend
            ? `שלח ${formatILS(amountNum)}`
            : 'הזן סכום ונמען'}
        </button>
      </div>
    </div>
  );
}
