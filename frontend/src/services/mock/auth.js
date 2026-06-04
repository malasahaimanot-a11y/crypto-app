// Auth service — thin wrapper over storage.js
// Production: swap storage calls with encrypted key derivation.

import * as storage from '../storage.js';

export function signup(name, email, password, protectionLevel) {
  if (!name || name.trim().length < 2)
    throw new Error('השם חייב להכיל לפחות 2 תווים');
  if (!email || !email.includes('@'))
    throw new Error('נא להזין כתובת מייל תקינה');
  if (!password || password.length < 8)
    throw new Error('הסיסמה חייבת להכיל לפחות 8 תווים');

  const user = storage.createUserProfile({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    protectionLevel,
  });
  storage.saveUser(user);
  storage.initWallet(user.protectionLevelIndex); // seed wallet with chosen level
  storage.saveSession(user.email);
  return user;
}

export function login(email, password) {
  const user = storage.getStoredUser();
  if (!user || user.email !== email.trim().toLowerCase())
    throw new Error('המייל או הסיסמה שגויים');
  // Mock: any password accepted (real: decrypt wallet key)
  storage.saveSession(user.email);
  return user;
}

export function logout()     { storage.clearSession(); }
export function getSession() { return storage.getStoredSession(); }
export function getUser()    { return storage.getStoredUser(); }
