import { createContext, useContext, useReducer, useEffect } from 'react';

const AppContext = createContext(null);

const initial = {
  currency: 'usd',
  lang: 'he',
  fontSize: 'normal', // normal | large | xlarge
  highContrast: false,
  userId: 'demo-user',
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_CURRENCY':      return { ...state, currency: action.payload };
    case 'SET_LANG':          return { ...state, lang: action.payload };
    case 'SET_FONT_SIZE':     return { ...state, fontSize: action.payload };
    case 'TOGGLE_CONTRAST':   return { ...state, highContrast: !state.highContrast };
    default: return state;
  }
}

const FONT_SCALES = { normal: '18px', large: '21px', xlarge: '24px' };

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initial, () => {
    try {
      const saved = JSON.parse(localStorage.getItem('appSettings') || '{}');
      return { ...initial, ...saved };
    } catch { return initial; }
  });

  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(state));
    document.documentElement.style.fontSize = FONT_SCALES[state.fontSize];
    document.documentElement.lang = state.lang;
    document.documentElement.dir = state.lang === 'he' ? 'rtl' : 'ltr';
    if (state.highContrast) {
      document.documentElement.setAttribute('data-contrast', 'high');
    } else {
      document.documentElement.removeAttribute('data-contrast');
    }
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
