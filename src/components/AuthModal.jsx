import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const overlay = {
  position: 'fixed', inset: 0, zIndex: 80,
  background: 'rgba(15,23,42,.55)', backdropFilter: 'blur(6px)',
  display: 'grid', placeItems: 'center', padding: 16,
};

const card = {
  width: '100%', maxWidth: 420, background: 'var(--at-surface)',
  border: '1px solid var(--at-border)', borderRadius: 22,
  padding: 24, boxShadow: '0 30px 80px rgba(15,23,42,.28)',
};

const input = {
  width: '100%', border: '1px solid var(--at-border)', borderRadius: 12,
  padding: '12px 14px', fontSize: 14, fontFamily: 'inherit', background: 'var(--at-bg)',
  color: 'var(--at-ink)', outline: 'none', boxSizing: 'border-box',
};

const label = {
  display: 'block', fontSize: 11, color: 'var(--at-ink-3)',
  fontFamily: 'var(--at-mono)', letterSpacing: '.1em', textTransform: 'uppercase',
  marginBottom: 6,
};

const btn = {
  width: '100%', padding: '13px', borderRadius: 12, border: 'none',
  background: 'var(--at-ink)', color: '#fff', fontWeight: 900, fontSize: 14,
  cursor: 'pointer', fontFamily: 'inherit',
};

const linkBtn = {
  background: 'none', border: 'none', color: 'var(--at-accent)',
  fontWeight: 800, cursor: 'pointer', padding: 0, fontFamily: 'inherit',
};

function translate(error) {
  const msg = error?.message || String(error);
  if (msg.includes('Invalid login')) return 'Email o contraseña incorrectos.';
  if (msg.includes('already registered')) return 'Ese email ya está registrado. Probá ingresar.';
  if (msg.includes('Password should be')) return 'La contraseña debe tener al menos 6 caracteres.';
  return msg;
}

export function AuthModal({ open, onClose, mode: initialMode = 'signin' }) {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [info, setInfo] = useState('');

  useEffect(() => {
    if (!open) return;
    Promise.resolve().then(() => { setMode(initialMode); setErr(''); setInfo(''); });
  }, [open, initialMode]);

  if (!open) return null;

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true); setErr(''); setInfo('');
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setInfo('Cuenta creada. Si te pide confirmar, revisá tu email y volvé.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onClose?.();
      }
    } catch (e) {
      setErr(translate(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={overlay} onClick={onClose}>
      <form style={card} onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <div style={{ fontFamily: 'var(--at-mono)', fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--at-accent)', fontWeight: 900 }}>
          AutosTandil · Subastas
        </div>
        <h2 style={{ margin: '8px 0 4px', fontFamily: 'var(--at-display)', fontSize: 24, fontWeight: 800, letterSpacing: '-.02em', color: 'var(--at-ink)' }}>
          {mode === 'signup' ? 'Crear cuenta' : 'Ingresar'}
        </h2>
        <p style={{ margin: '0 0 18px', fontSize: 13, color: 'var(--at-ink-2)', lineHeight: 1.5 }}>
          {mode === 'signup'
            ? 'Necesitás una cuenta para participar en subastas. Después te pedimos algunos datos más.'
            : 'Ingresá con tu email y contraseña para ver y participar de las subastas.'}
        </p>

        <div style={{ marginBottom: 12 }}>
          <span style={label}>Email</span>
          <input style={input} type="email" autoComplete="email" required
            value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <span style={label}>Contraseña</span>
          <input style={input} type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            required minLength={6}
            value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        {err && <div style={{ marginBottom: 12, padding: 10, borderRadius: 10, background: '#fee2e2', color: '#991b1b', fontSize: 12 }}>{err}</div>}
        {info && <div style={{ marginBottom: 12, padding: 10, borderRadius: 10, background: '#dcfce7', color: '#166534', fontSize: 12 }}>{info}</div>}

        <button type="submit" style={{ ...btn, opacity: busy ? .6 : 1 }} disabled={busy}>
          {busy ? 'Procesando…' : (mode === 'signup' ? 'Crear cuenta' : 'Ingresar')}
        </button>

        <div style={{ marginTop: 14, fontSize: 13, color: 'var(--at-ink-2)', textAlign: 'center' }}>
          {mode === 'signup' ? '¿Ya tenés cuenta?' : '¿Sos nuevo?'}{' '}
          <button type="button" style={linkBtn}
            onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setErr(''); setInfo(''); }}>
            {mode === 'signup' ? 'Ingresar' : 'Crear cuenta'}
          </button>
        </div>

        <button type="button" onClick={onClose}
          style={{ marginTop: 12, width: '100%', background: 'none', border: 'none', color: 'var(--at-ink-3)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
          Cerrar
        </button>
      </form>
    </div>
  );
}
