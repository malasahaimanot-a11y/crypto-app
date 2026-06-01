import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as AuthService from '../services/mock/auth.js';
import * as WalletService from '../services/mock/wallet.js';

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [wallet, setWallet] = useState(null);
  const [ready, setReady]   = useState(false);

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

  // Called after successful signup or login
  const signIn = useCallback((userData) => {
    setUser(userData);
    setWallet(WalletService.getWalletState());
  }, []);

  const signOut = useCallback(() => {
    AuthService.logout();
    setUser(null);
    setWallet(null);
  }, []);

  // Persist any wallet mutation (protection change, new tx, simulation, etc.)
  const updateWallet = useCallback((newWallet) => {
    setWallet(newWallet);
    WalletService.saveWalletState(newWallet);
  }, []);

  // Add a send transaction and deduct from balance
  const sendPayment = useCallback((amountILS, description, note = '') => {
    setWallet((prev) => {
      if (!prev) return prev;
      const growFrac = prev.growingILS / prev.totalILS;
      const newTotal    = Math.max(0, prev.totalILS    - amountILS);
      const newGrowing  = Math.max(0, prev.growingILS  - Math.round(amountILS * growFrac));
      const newProtected = Math.max(0, newTotal - newGrowing);
      const tx = {
        id: `tx-${Date.now()}`,
        type: 'send',
        amountILS,
        description,
        date: 'היום',
        time: new Date().toTimeString().slice(0, 5),
        status: 'confirmed',
        txId: `lnbc${amountILS * 100}n1pjq...${Date.now().toString(36)}`,
        note,
      };
      const next = {
        ...prev,
        totalILS: newTotal,
        growingILS: newGrowing,
        protectedILS: newProtected,
        btcAmount: +(newGrowing / prev.btcRateILS).toFixed(6),
        transactions: [tx, ...prev.transactions],
      };
      WalletService.saveWalletState(next);
      return next;
    });
  }, []);

  return (
    <WalletContext.Provider value={{ user, wallet, ready, signIn, signOut, updateWallet, sendPayment }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
