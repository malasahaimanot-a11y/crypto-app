import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as AuthService from '../services/mock/auth.js';
import * as WalletService from '../services/mock/wallet.js';

const WalletContext = createContext(null);

function now() {
  return {
    date: 'היום',
    time: new Date().toTimeString().slice(0, 5),
  };
}

export function WalletProvider({ children }) {
  const [user,   setUser]   = useState(null);
  const [wallet, setWallet] = useState(null);
  const [ready,  setReady]  = useState(false);

  useEffect(() => {
    const session = AuthService.getSession();
    if (session?.username) {
      const u = AuthService.getUser(session.username);
      if (u) {
        setUser(u);
        setWallet(WalletService.getWalletState());
      }
    }
    setReady(true);
  }, []);

  const signIn = useCallback((userData) => {
    setUser(userData);
    // Always start a brand-new wallet for a fresh signup; login restores saved state
    const saved = WalletService.getWalletState();
    // If no transactions at all and balance is 0 this is a fresh wallet — keep it clean
    setWallet(saved);
  }, []);

  const signOut = useCallback(() => {
    AuthService.logout();
    setUser(null);
    setWallet(null);
  }, []);

  const updateWallet = useCallback((newWallet) => {
    setWallet(newWallet);
    WalletService.saveWalletState(newWallet);
  }, []);

  // Update live BTC rate (called by DashboardPage when CoinGecko responds)
  const updateBtcRate = useCallback((rateILS) => {
    setWallet((prev) => {
      if (!prev || prev.btcRateILS === rateILS) return prev;
      const next = { ...prev, btcRateILS: rateILS };
      WalletService.saveWalletState(next);
      return next;
    });
  }, []);

  // Send payment — deducts balance, appends transaction
  const sendPayment = useCallback((amountILS, recipientName, note = '') => {
    setWallet((prev) => {
      if (!prev) return prev;
      const { date, time } = now();
      const growFrac      = prev.totalILS > 0 ? prev.growingILS / prev.totalILS : 1;
      const newTotal      = Math.max(0, prev.totalILS    - amountILS);
      const newGrowing    = Math.max(0, prev.growingILS  - Math.round(amountILS * growFrac));
      const newProtected  = Math.max(0, newTotal - newGrowing);
      const btcRate       = prev.btcRateILS ?? 56500;
      const tx = {
        id:          `tx-${Date.now()}`,
        type:        'send',
        amountILS,
        description: `ל${recipientName}`,
        date,
        time,
        status:      'confirmed',
        txId:        `lnbc${Math.round(amountILS * 100)}n1${Date.now().toString(36)}`,
        note,
      };
      const next = {
        ...prev,
        totalILS:    newTotal,
        growingILS:  newGrowing,
        protectedILS: newProtected,
        btcAmount:   +(newGrowing / btcRate).toFixed(6),
        transactions: [tx, ...prev.transactions],
      };
      WalletService.saveWalletState(next);
      return next;
    });
  }, []);

  // Deposit — adds balance split by protection level, appends transaction
  const depositPayment = useCallback((amountILS, btcILS, protILS, note = '') => {
    setWallet((prev) => {
      if (!prev) return prev;
      const { date, time } = now();
      const btcRate       = prev.btcRateILS ?? 56500;
      const newGrowing    = (prev.growingILS   ?? 0) + btcILS;
      const newProtected  = (prev.protectedILS ?? 0) + protILS;
      const newTotal      = newGrowing + newProtected;
      const tx = {
        id:          `dep-${Date.now()}`,
        type:        'receive',
        amountILS,
        description: 'הפקדה',
        date,
        time,
        status:      'confirmed',
        txId:        `dep${Date.now().toString(36)}`,
        note,
      };
      const next = {
        ...prev,
        totalILS:    newTotal,
        growingILS:  newGrowing,
        protectedILS: newProtected,
        btcAmount:   +(newGrowing / btcRate).toFixed(6),
        transactions: [tx, ...(prev.transactions ?? [])],
      };
      WalletService.saveWalletState(next);
      return next;
    });
  }, []);

  // Simulate receiving a payment (mock — for demo purposes)
  const receivePayment = useCallback((amountILS, senderName = 'תשלום נכנס') => {
    setWallet((prev) => {
      if (!prev) return prev;
      const { date, time } = now();
      const btcRate       = prev.btcRateILS ?? 56500;
      const protLevel     = prev.protection?.level ?? 1;
      // protection levels: 0=dynamic(50%), 1=balanced(70%), 2=stable(90%)
      const protPcts      = [0.5, 0.7, 0.9];
      const protFrac      = protPcts[protLevel] ?? 0.7;
      const btcILS        = Math.round(amountILS * (1 - protFrac));
      const protILS       = amountILS - btcILS;
      const newGrowing    = (prev.growingILS   ?? 0) + btcILS;
      const newProtected  = (prev.protectedILS ?? 0) + protILS;
      const newTotal      = newGrowing + newProtected;
      const tx = {
        id:          `rx-${Date.now()}`,
        type:        'receive',
        amountILS,
        description: `מ${senderName}`,
        date,
        time,
        status:      'confirmed',
        txId:        `lnbc${Math.round(amountILS * 100)}n1rx${Date.now().toString(36)}`,
        note:        '',
      };
      const next = {
        ...prev,
        totalILS:    newTotal,
        growingILS:  newGrowing,
        protectedILS: newProtected,
        btcAmount:   +(newGrowing / btcRate).toFixed(6),
        transactions: [tx, ...(prev.transactions ?? [])],
      };
      WalletService.saveWalletState(next);
      return next;
    });
  }, []);

  return (
    <WalletContext.Provider value={{
      user, wallet, ready,
      signIn, signOut, updateWallet, updateBtcRate,
      sendPayment, depositPayment, receivePayment,
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
