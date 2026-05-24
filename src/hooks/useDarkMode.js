import { createContext, useContext, useEffect, useState } from 'react';

const KEY = 'at-theme';

function getInitial() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) return saved === 'dark';
  } catch {}
  return typeof window !== 'undefined'
    && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export const DarkModeContext = createContext({ dark: false, toggle: () => {} });

export function DarkModeProvider({ children }) {
  const [dark, setDark] = useState(getInitial);

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : '';
    try { localStorage.setItem(KEY, dark ? 'dark' : 'light'); } catch {}
  }, [dark]);

  return (
    <DarkModeContext.Provider value={{ dark, toggle: () => setDark(d => !d) }}>
      {children}
    </DarkModeContext.Provider>
  );
}

export const useDarkMode = () => useContext(DarkModeContext);
