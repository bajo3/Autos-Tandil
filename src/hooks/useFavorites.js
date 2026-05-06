import { useState, useEffect, useCallback } from 'react';

export function useFavorites() {
  const [favs, setFavs] = useState(() => {
    try { return JSON.parse(localStorage.getItem('at_favs') || '[]'); } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('at_favs', JSON.stringify(favs));
  }, [favs]);

  const toggle = useCallback((id) => {
    setFavs(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }, []);

  return { favs, toggle };
}
