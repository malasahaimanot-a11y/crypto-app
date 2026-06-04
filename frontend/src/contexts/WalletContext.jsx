import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as storage from '../services/storage.js';

const WalletContext = createContext(null);

function nowStamp() {
  return { date: 'היום', time: new Date().toTimeString().slice(0, 5) };
}

export function WalletProvider({ children }) {
  const [user,   setUser]   = useState(null);
  const [wallet, setWallet] = useState(null);
  const [ready,  setReady]  = useState(false);

  useEffect(() => {
    const session = storage.getStoredSession();
    if (session?.loggedIn) {
      const u = storage.getStoredUser();
      if (u) {
        setUser(u);
        setWallet(storage.getStoredWallet());
      }
    }
    setReady(true);
  }, []);

  // Called right after signup or login
  const signIn = useCallback((userData) => {
    setUser(userData);
    setWallet(storage.getStoredWallet());
  }, []);

  const signOut = useCallback(() => {
    storage.clearSession();
    setUser(null);
    setWallet(null);
  }, []);

  const updateWallet = useCallback((next) => {
    storage.saveWallet(next);
    setWallet(next);
  }, []);

  const updateBtcRate = useCallback((rateILS) => {
    setWallet(prev => {
      if (!prev || prev.btcRateILS === rateILS) return prev;
      const next = { ...prev, btcRateILS: rateILS };
      storage.saveWallet(next);
      return next;
    });
  }, []);

  const updateProtectionLevel = useCallback((levelId) => {
    const idx = storage.PROTECTION_LEVELS.findIndex(l => l.id === levelId);
    const levelIndex = idx >= 0 ? idx : 1;

    setWallet(prev => {
      if (!prev) return prev;
      const next = { ...prev, protection: { isActive: true, level: levelIndex } };
      storage.saveWallet(next);
      return next;
    });
    setUser(prev => {
      if (!prev) return prev;
      const next = { ...prev, protectionLevel: levelId, protectionLevelIndex: levelIndex };
      storage.saveUser(next);
      return next;
    });
  }, []);

  const sendPayment = useCallback((amountILS, recipientName, note = '') => {
    setWallet(prev => {
      if (!prev) return prev;
      const { date, time } = nowStamp();
      const growFrac    = prev.totalILS > 0 ? prev.growingILS / prev.totalILS : 1;
      const newTotal    = Math.max(0, prev.totalILS    - amountILS);
      const newGrowing  = Math.max(0, prev.growingILS  - Math.round(amountILS * growFrac));
      const newProt     = Math.max(0, newTotal - newGrowing);
      const btcRate     = prev.btcRateILS ?? 56500;
      const tx = {
        id:          `tx-${Date.now()}`,
        type:        'send',
        amountILS,
        description: `ל${recipientName}`,
        date, time,
        status:      'confirmed',
        txId:        `lnbc${Math.round(amountILS * 100)}n1${Date.now().toString(36)}`,
        note,
      };
      const next = {
        ...prev,
        totalILS:    newTotal,
        growingILS:  newGrowing,
        protectedILS: newProt,
        btcAmount:   +(newGrowing / btcRate).toFixed(6),
        transactions: [tx, ...(prev.transactions ?? [])],
      };
      storage.saveWallet(next);
      return next;
    });
  }, []);

  const depositPayment = useCallback((amountILS, btcILS, protILS, note = '') => {
    setWallet(prev => {
      if (!prev) return prev;
      const { date, time } = nowStamp();
      const btcRate    = prev.btcRateILS ?? 56500;
      const newGrowing = (prev.growingILS   ?? 0) + btcILS;
      const newProt    = (prev.protectedILS ?? 0) + protILS;
      const newTotal   = newGrowing + newProt;
      const tx = {
        id:          `dep-${Date.now()}`,
        type:        'receive',
        amountILS,
        description: 'הפקדה',
        date, time,
        status:      'confirmed',
        txId:        `dep${Date.now().toString(36)}`,
        note,
      };
      const next = {
        ...prev,
        totalILS:    newTotal,
        growingILS:  newGrowing,
        protectedILS: newProt,
        btcAmount:   +(newGrowing / btcRate).toFixed(6),
        transactions: [tx, ...(prev.transactions ?? [])],
      };
      storage.saveWallet(next);
      return next;
    });
  }, []);

  const receivePayment = useCallback((amountILS, senderName = 'תשלום נכנס') => {
    setWallet(prev => {
      if (!prev) return prev;
      const { date, time } = nowStamp();
      const btcRate    = prev.btcRateILS ?? 56500;
      const lvl        = storage.getLevelByIndex(prev.protection?.level ?? 1);
      const btcILS     = Math.round(amountILS * (lvl.btcPct / 100));
      const protILS    = amountILS - btcILS;
      const newGrowing = (prev.growingILS   ?? 0) + btcILS;
      const newProt    = (prev.protectedILS ?? 0) + protILS;
      const newTotal   = newGrowing + newProt;
      const tx = {
        id:          `rx-${Date.now()}`,
        type:        'receive',
        amountILS,
        description: `מ${senderName}`,
        date, time,
        status:      'confirmed',
        txId:        `lnbc${Math.round(amountILS * 100)}n1rx${Date.now().toString(36)}`,
        note:        '',
      };
      const next = {
        ...prev,
        totalILS:    newTotal,
        growingILS:  newGrowing,
        protectedILS: newProt,
        btcAmount:   +(newGrowing / btcRate).toFixed(6),
        transactions: [tx, ...(prev.transactions ?? [])],
      };
      storage.saveWallet(next);
      return next;
    });
  }, []);

  return (
    <WalletContext.Provider value={{
      user, wallet, ready,
      signIn, signOut,
      updateWallet, updateBtcRate, updateProtectionLevel,
      sendPayment, depositPayment, receivePayment,
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
