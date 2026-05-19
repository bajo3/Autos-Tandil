import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getAuthRedirectTo } from '../lib/authRedirect';

const overlay = {
  position: 'fixed', inset: 0, zIndex: 80,
  background: 'rgba(15,23,42,.55)', backdropFilter: 'blur(6px)',
  display: 'grid', placeItems: 'center', padding: 16,
};

const card = {
  width: '100%', maxWidth: 430, background: 'var(--at-surface)',
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
  if (msg.includes('Auth session missing')) return 'Abrí el link de recuperación desde el email para cambiar la contraseña.';
  return msg;
}

function titleFor(mode) {
  if (mode === 'signup') return 'Crear cuenta';
  if (mode === 'forgot') return 'Recuperar cuenta';
  if (mode === 'reset') return 'Nueva contraseña';
  return 'Ingresar';
}

function copyFor(mode) {
  if (mode === 'signup') return 'Creá tu cuenta con tus datos reales para participar y seguir tus señas desde el panel.';
  if (mode === 'forgot') return 'Te enviamos un link seguro para volver al panel y definir una contraseña nueva.';
  if (mode === 'reset') return 'Elegí una contraseña nueva para recuperar el acceso a tu cuenta.';
  return 'Ingresá con tu email y contraseña para ver y participar de las subastas.';
}

export function AuthModal({ open, onClose, mode: initialMode = 'signin' }) {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [dni, setDni] = useState('');
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [info, setInfo] = useState('');

  useEffect(() => {
    if (!open) return;
    Promise.resolve().then(() => {
      setMode(initialMode);
      setErr('');
      setInfo('');
      setConfirmPassword('');
    });
  }, [open, initialMode]);

  const switchMode = (next) => {
    setMode(next);
    setErr('');
    setInfo('');
    setPassword('');
    setConfirmPassword('');
  };

  if (!open) return null;

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true); setErr(''); setInfo('');
    try {
      if (mode === 'signup') {
        if (!fullName.trim() || !dni.trim() || !phone.trim()) {
          throw new Error('Completá nombre, documento y teléfono para crear tu cuenta.');
        }
        const emailRedirectTo = getAuthRedirectTo('/subastas/panel');
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            ...(emailRedirectTo ? { emailRedirectTo } : {}),
            data: {
              full_name: fullName.trim(),
              dni: dni.trim(),
              phone: phone.trim(),
            },
          },
        });
        if (error) throw error;
        if (data?.session?.user) {
          await supabase.from('profiles').upsert({
            user_id: data.session.user.id,
            full_name: fullName.trim(),
            dni: dni.trim(),
            phone: phone.trim(),
          });
        }
        setInfo('Cuenta creada. Revisá tu email y confirmá la cuenta para volver al panel.');
      } else if (mode === 'forgot') {
        const redirectTo = getAuthRedirectTo('/subastas/panel?reset=1');
        const { error } = await supabase.auth.resetPasswordForEmail(email, redirectTo ? { redirectTo } : undefined);
        if (error) throw error;
        setInfo('Te mandamos un email para recuperar la cuenta. Abrilo y vas a volver al panel.');
      } else if (mode === 'reset') {
        if (password !== confirmPassword) throw new Error('Las contraseñas no coinciden.');
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        setInfo('Contraseña actualizada. Ya podés seguir usando tu panel.');
        setTimeout(() => onClose?.(), 900);
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

  const needsPassword = mode !== 'forgot';

  return (
    <div style={overlay}>
      <form style={card} onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <div style={{ fontFamily: 'var(--at-mono)', fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--at-accent)', fontWeight: 900 }}>
          AutosTandil · Subastas
        </div>
        <h2 style={{ margin: '8px 0 4px', fontFamily: 'var(--at-display)', fontSize: 24, fontWeight: 800, letterSpacing: '-.02em', color: 'var(--at-ink)' }}>
          {titleFor(mode)}
        </h2>
        <p style={{ margin: '0 0 18px', fontSize: 13, color: 'var(--at-ink-2)', lineHeight: 1.5 }}>
          {copyFor(mode)}
        </p>

        {mode !== 'reset' && (
          <div style={{ marginBottom: 12 }}>
            <span style={label}>Email</span>
            <input style={input} type="email" autoComplete="email" required
              value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        )}

        {mode === 'signup' && (
          <>
            <div style={{ marginBottom: 12 }}>
              <span style={label}>Nombre y apellido</span>
              <input style={input} autoComplete="name" required
                value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
              <div>
                <span style={label}>Documento</span>
                <input style={input} inputMode="numeric" autoComplete="off" required
                  value={dni} onChange={(e) => setDni(e.target.value)} />
              </div>
              <div>
                <span style={label}>Teléfono</span>
                <input style={input} inputMode="tel" autoComplete="tel" required
                  value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>
          </>
        )}

        {needsPassword && (
          <div style={{ marginBottom: mode === 'reset' ? 12 : 16 }}>
            <span style={label}>Contraseña</span>
            <input style={input} type="password" autoComplete={mode === 'signup' || mode === 'reset' ? 'new-password' : 'current-password'}
              required minLength={6}
              value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
        )}

        {mode === 'reset' && (
          <div style={{ marginBottom: 16 }}>
            <span style={label}>Repetir contraseña</span>
            <input style={input} type="password" autoComplete="new-password" required minLength={6}
              value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>
        )}

        {err && <div style={{ marginBottom: 12, padding: 10, borderRadius: 10, background: '#fee2e2', color: '#991b1b', fontSize: 12 }}>{err}</div>}
        {info && <div style={{ marginBottom: 12, padding: 10, borderRadius: 10, background: '#dcfce7', color: '#166534', fontSize: 12 }}>{info}</div>}

        <button type="submit" style={{ ...btn, opacity: busy ? .6 : 1 }} disabled={busy}>
          {busy ? 'Procesando...' : titleFor(mode)}
        </button>

        {mode === 'signin' && (
          <div style={{ marginTop: 12, textAlign: 'center' }}>
            <button type="button" style={linkBtn} onClick={() => switchMode('forgot')}>
              Olvidé mi contraseña
            </button>
          </div>
        )}

        <div style={{ marginTop: 14, fontSize: 13, color: 'var(--at-ink-2)', textAlign: 'center' }}>
          {mode === 'signup' ? '¿Ya tenés cuenta?' : mode === 'signin' ? '¿Sos nuevo?' : '¿Ya recuperaste el acceso?'}{' '}
          <button type="button" style={linkBtn}
            onClick={() => switchMode(mode === 'signup' ? 'signin' : mode === 'signin' ? 'signup' : 'signin')}>
            {mode === 'signup' ? 'Ingresar' : mode === 'signin' ? 'Crear cuenta' : 'Ingresar'}
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
