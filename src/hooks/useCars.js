import { useCallback, useEffect, useMemo, useState } from 'react';
import { CARS as MOCK_CARS } from '../data/cars';
import { hasSupabaseConfig, supabase } from '../lib/supabase';
import { normalizeCar } from '../lib/carMapper';

export function useCars({ includeDrafts = false } = {}) {
  const [remoteCars, setRemoteCars] = useState([]);
  const [loading, setLoading] = useState(hasSupabaseConfig);
  const [source, setSource] = useState(hasSupabaseConfig ? 'supabase' : 'mock');
  const [error, setError] = useState(null);

  const loadCars = useCallback(async () => {
    if (!hasSupabaseConfig) {
      setRemoteCars([]);
      setSource('mock');
      setLoading(false);
      return;
    }

    setLoading(true);
    let query = supabase
      .from('autos')
      .select('*')
      .order('created_at', { ascending: false });

    if (!includeDrafts) query = query.eq('status', 'published');

    const { data, error: queryError } = await query;

    if (queryError) {
      console.warn('Supabase autos fallback:', queryError.message);
      setRemoteCars([]);
      setSource('mock');
      setError(queryError.message);
    } else {
      setRemoteCars((data || []).map(normalizeCar));
      setSource('supabase');
      setError(null);
    }

    setLoading(false);
  }, [includeDrafts]);

  useEffect(() => {
    Promise.resolve().then(loadCars);
  }, [loadCars]);

  const cars = useMemo(() => {
    if (source === 'supabase') return remoteCars;
    return MOCK_CARS;
  }, [remoteCars, source]);

  return { cars, loading, source, error, reload: loadCars, configured: hasSupabaseConfig };
}
