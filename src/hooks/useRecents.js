import { useState, useEffect, useCallback } from 'react';

export function useRecents() {
  const [recents, setRecents] = useState(() => {
    try { return JSON.parse(localStorage.getItem('at_recents') || '[]'); } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('at_recents', JSON.stringify(recents));
  }, [recents]);

  const push = useCallback((id) => {
    setRecents(prev => [id, ...prev.filter(x => x !== id)].slice(0, 8));
  }, []);

  return { recents, push };
}
