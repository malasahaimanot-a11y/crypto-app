// Mock authentication service.
// Production replacement: password derives a key via PBKDF2/Argon2 that
// encrypts/decrypts the HD wallet seed stored encrypted on device.

const USERS_KEY = 'sp_users';
const SESSION_KEY = 'sp_session';

const MOCK_RECOVERY_WORDS = [
  'תפוח', 'שמש', 'ים', 'הר', 'כוכב', 'ירח',
  'עץ', 'ענן', 'נהר', 'אבן', 'רוח', 'אש',
];

export function signup(username, password) {
  if (!username || username.trim().length < 3) {
    throw new Error('שם משתמש חייב להכיל לפחות 3 תווים');
  }
  if (/\s/.test(username)) {
    throw new Error('שם משתמש לא יכול להכיל רווחים');
  }
  if (!password || password.length < 6) {
    throw new Error('הסיסמה חייבת להכיל לפחות 6 תווים');
  }

  const users = _getUsers();
  const lower = username.toLowerCase();
  if (users[lower]) {
    throw new Error('שם המשתמש כבר תפוס — נסה אחר');
  }

  const user = {
    username: lower,
    displayName: username,
    lightningAddress: `${lower}@satoshipay.co`,
    mockAddress: `bc1q${lower.slice(0, 8).padEnd(8, '0')}xk2fd7grs4qqzge`,
    recoveryWords: MOCK_RECOVERY_WORDS,
    createdAt: Date.now(),
  };

  users[lower] = user;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  _setSession(lower);
  return user;
}

export function login(username, password) {
  const users = _getUsers();
  const lower = username.toLowerCase();
  if (!users[lower]) {
    throw new Error('שם משתמש או סיסמה שגויים');
  }
  // Mock: accept any password (real: password decrypts wallet key)
  _setSession(lower);
  return users[lower];
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
  } catch {
    return null;
  }
}

export function getUser(username) {
  return _getUsers()[username?.toLowerCase()] || null;
}

function _getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
  } catch {
    return {};
  }
}

function _setSession(username) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ username }));
}
