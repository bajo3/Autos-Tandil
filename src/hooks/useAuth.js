import { useEffect, useState, useCallback } from 'react';
import { supabase, hasSupabaseConfig } from '../lib/supabase';
import { getAuthRedirectTo } from '../lib/authRedirect';

export function useAuth() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasSupabaseConfig) {
      Promise.resolve().then(() => setLoading(false));
      return;
    }
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => { active = false; sub.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!session?.user) {
      Promise.resolve().then(() => setProfile(null));
      return;
    }
    let active = true;
    supabase.from('profiles').select('*').eq('user_id', session.user.id).maybeSingle()
      .then(({ data }) => { if (active) setProfile(data); });
    return () => { active = false; };
  }, [session]);

  const signIn = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signUp = useCallback(async (email, password, redirectPath = '/subastas') => {
    const emailRedirectTo = getAuthRedirectTo(redirectPath);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: emailRedirectTo ? { emailRedirectTo } : undefined,
    });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const updateProfile = useCallback(async (patch) => {
    if (!session?.user) throw new Error('NOT_AUTHENTICATED');
    // upsert en vez de update: crea la fila si el usuario no tiene perfil todavía
    const { data, error } = await supabase.from('profiles')
      .upsert({ user_id: session.user.id, ...patch }, { onConflict: 'user_id' })
      .select().single();
    if (error) throw error;
    setProfile(data);
    return data;
  }, [session]);

  return { session, user: session?.user || null, profile, loading, signIn, signUp, signOut, updateProfile };
}
