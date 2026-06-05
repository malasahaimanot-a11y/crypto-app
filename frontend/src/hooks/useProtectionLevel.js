import { useWallet } from '../contexts/WalletContext.jsx';
import { PROTECTION_LEVELS } from '../services/storage.js';

export function useProtectionLevel() {
  const { wallet, updateProtectionLevel } = useWallet();
  const levelIndex = wallet?.protection?.level ?? 1;
  const level = PROTECTION_LEVELS[levelIndex] ?? PROTECTION_LEVELS[1];
  return { level, levelIndex, updateProtectionLevel };
}
