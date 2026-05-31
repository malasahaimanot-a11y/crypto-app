import { useState, useRef, useEffect } from 'react';
import { useSearch } from '../hooks/useApi.js';
import { useApp } from '../contexts/AppContext.jsx';
import styles from './AddHoldingModal.module.css';

export default function AddHoldingModal({ onClose, onAdd }) {
  const { state } = useApp();
  const isHe = state.lang === 'he';

  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [amount, setAmount] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [error, setError] = useState('');

  const { data: searchResults } = useSearch(query);
  const firstInputRef = useRef(null);
  const dialogRef = useRef(null);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  // Trap focus inside modal
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const focusable = el.querySelectorAll('button, input, [tabindex]:not([tabindex="-1"])');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const trap = e => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last?.focus(); } }
      else            { if (document.activeElement === last)  { e.preventDefault(); first?.focus(); } }
    };
    const esc = e => { if (e.key === 'Escape') onClose(); };
    el.addEventListener('keydown', trap);
    el.addEventListener('keydown', esc);
    return () => { el.removeEventListener('keydown', trap); el.removeEventListener('keydown', esc); };
  }, [onClose]);

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!selected) { setError(isHe ? 'יש לבחור מטבע' : 'Please select a coin'); return; }
    if (!amount || isNaN(amount) || Number(amount) <= 0) { setError(isHe ? 'כמות לא תקינה' : 'Invalid amount'); return; }
    if (!purchasePrice || isNaN(purchasePrice) || Number(purchasePrice) <= 0) { setError(isHe ? 'מחיר לא תקין' : 'Invalid price'); return; }
    onAdd({ coinId: selected.id, coinName: selected.name, symbol: selected.symbol, image: selected.thumb, amount: Number(amount), purchasePrice: Number(purchasePrice) });
    onClose();
  }

  return (
    <div className={styles.backdrop} role="presentation" onClick={e => e.target === e.currentTarget && onClose()}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={styles.modal}
      >
        <div className={styles.header}>
          <h2 id="modal-title" className={styles.title}>
            {isHe ? 'הוספת מטבע לתיק' : 'Add Coin to Portfolio'}
          </h2>
          <button
            onClick={onClose}
            className="btn btn-ghost"
            aria-label={isHe ? 'סגור' : 'Close'}
            style={{ padding: 'var(--space-2) var(--space-3)' }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* Coin search */}
          <div className={styles.field}>
            <label htmlFor="coin-search" className={styles.label}>
              {isHe ? 'חיפוש מטבע' : 'Search Coin'}
            </label>
            {selected ? (
              <div className={styles.selectedCoin}>
                <img src={selected.thumb} alt={selected.name} width={24} height={24} style={{ borderRadius: '50%' }} />
                <span>{selected.name}</span>
                <button type="button" className="btn btn-ghost" onClick={() => setSelected(null)}
                  style={{ padding: '2px 8px', fontSize: 'var(--size-xs)', marginInlineStart: 'auto' }}>
                  {isHe ? 'שנה' : 'Change'}
                </button>
              </div>
            ) : (
              <>
                <input
                  id="coin-search"
                  ref={firstInputRef}
                  type="search"
                  className={styles.input}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder={isHe ? 'Bitcoin, Ethereum...' : 'Bitcoin, Ethereum...'}
                  autoComplete="off"
                  aria-autocomplete="list"
                  aria-controls="coin-list"
                />
                {searchResults?.coins?.length > 0 && (
                  <ul id="coin-list" className={styles.dropdown} role="listbox" aria-label={isHe ? 'תוצאות חיפוש' : 'Search results'}>
                    {searchResults.coins.map(coin => (
                      <li
                        key={coin.id}
                        role="option"
                        aria-selected={selected?.id === coin.id}
                        className={styles.dropdownItem}
                        onClick={() => { setSelected(coin); setQuery(''); }}
                        onKeyDown={e => e.key === 'Enter' && (setSelected(coin), setQuery(''))}
                        tabIndex={0}
                      >
                        <img src={coin.thumb} alt={coin.name} width={20} height={20} style={{ borderRadius: '50%' }} />
                        <span>{coin.name}</span>
                        <span className="text-muted" style={{ marginInlineStart: 'auto' }}>{coin.symbol?.toUpperCase()}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>

          {/* Amount */}
          <div className={styles.field}>
            <label htmlFor="amount" className={styles.label}>{isHe ? 'כמות' : 'Amount'}</label>
            <input
              id="amount"
              type="number"
              className={`${styles.input} ltr`}
              value={amount}
              onChange={e => setAmount(e.target.value)}
              min="0"
              step="any"
              placeholder="0.5"
              aria-describedby={error ? 'modal-error' : undefined}
            />
          </div>

          {/* Purchase price */}
          <div className={styles.field}>
            <label htmlFor="purchase-price" className={styles.label}>
              {isHe ? 'מחיר קנייה (USD)' : 'Purchase Price (USD)'}
            </label>
            <input
              id="purchase-price"
              type="number"
              className={`${styles.input} ltr`}
              value={purchasePrice}
              onChange={e => setPurchasePrice(e.target.value)}
              min="0"
              step="any"
              placeholder="45000"
            />
          </div>

          {error && (
            <p id="modal-error" role="alert" className={styles.error}>{error}</p>
          )}

          <div className={styles.actions}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>{isHe ? 'ביטול' : 'Cancel'}</button>
            <button type="submit" className="btn btn-primary">{isHe ? 'הוסף לתיק' : 'Add to Portfolio'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
