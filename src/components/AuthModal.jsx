import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getAuthRedirectTo } from '../lib/authRedirect';
import { IconCheck, IconClose, IconGavel, IconShield } from './Icons';

// ----------------------------- styles -----------------------------
const overlay = {
  position: 'fixed', inset: 0, zIndex: 80,
  background: 'rgba(8, 12, 24, 0.62)', backdropFilter: 'blur(10px)',
  display: 'grid', placeItems: 'center', padding: 16,
  animation: 'at-fade-in .18s ease-out',
};

const shell = {
  width: '100%', maxWidth: 880, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)',
  background: 'var(--at-surface)', border: '1px solid var(--at-border)',
  borderRadius: 24, overflow: 'hidden',
  boxShadow: '0 40px 120px rgba(8,12,24,.45)',
  animation: 'at-pop-in .22s cubic-bezier(.2,.9,.3,1.2)',
  position: 'relative',
};

const brandPanel = {
  background: 'linear-gradient(140deg, #0b1220 0%, #1d2a4d 60%, #283b73 100%)',
  color: '#fff', padding: '36px 30px', position: 'relative', overflow: 'hidden',
  display: 'none',
};

const formPanel = {
  padding: '28px 28px 24px', background: 'var(--at-surface)',
};

const closeBtn = {
  position: 'absolute', top: 14, right: 14, zIndex: 2,
  width: 36, height: 36, borderRadius: 999, border: 'none', cursor: 'pointer',
  background: 'rgba(15,23,42,.06)', color: 'var(--at-ink)',
  display: 'grid', placeItems: 'center',
  transition: 'background .15s ease',
};

const inputWrap = {
  display: 'flex', alignItems: 'center', gap: 10,
  border: '1px solid var(--at-border)', borderRadius: 12,
  padding: '12px 14px', background: 'var(--at-bg)',
  transition: 'border-color .15s ease, box-shadow .15s ease',
};

const input = {
  flex: 1, border: 'none', outline: 'none', background: 'transparent',
  fontSize: 14, fontFamily: 'inherit', color: 'var(--at-ink)', minWidth: 0,
};

const label = {
  display: 'block', fontSize: 11, color: 'var(--at-ink-3)',
  fontFamily: 'var(--at-mono)', letterSpacing: '.1em', textTransform: 'uppercase',
  marginBottom: 7, fontWeight: 700,
};

const btn = {
  width: '100%', padding: '14px', borderRadius: 12, border: 'none',
  background: 'var(--at-ink)', color: '#fff', fontWeight: 900, fontSize: 14,
  cursor: 'pointer', fontFamily: 'inherit',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  transition: 'transform .08s ease, opacity .15s ease',
};

const linkBtn = {
  background: 'none', border: 'none', color: 'var(--at-accent)',
  fontWeight: 800, cursor: 'pointer', padding: 0, fontFamily: 'inherit',
  fontSize: 13,
};

const tabsWrap = {
  display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 4,
  padding: 4, background: 'var(--at-bg-2)', borderRadius: 12, marginBottom: 20,
};

const tabBtn = (active) => ({
  border: 'none', cursor: 'pointer', fontFamily: 'inherit',
  padding: '9px 12px', borderRadius: 9, fontSize: 13, fontWeight: 800,
  background: active ? 'var(--at-surface)' : 'transparent',
  color: active ? 'var(--at-ink)' : 'var(--at-ink-2)',
  boxShadow: active ? '0 2px 8px rgba(15,23,42,.08)' : 'none',
  transition: 'all .15s ease',
});

// ----------------------------- helpers -----------------------------
function translate(error) {
  const msg = error?.message || String(error);
  if (msg.includes('Invalid login')) return 'Email o contraseña incorrectos.';
  if (msg.includes('already registered')) return 'Ese email ya está registrado. Probá ingresar.';
  if (msg.includes('Password should be')) return 'La contraseña debe tener al menos 6 caracteres.';
  if (msg.includes('Auth session missing')) return 'Abrí el link de recuperación desde el email para cambiar la contraseña.';
  return msg;
}

const ctxFor = {
  signin:  { title: 'Bienvenido de vuelta',  copy: 'Ingresá para ver tus subastas activas, señas y ofertas en tiempo real.',                  cta: 'Ingresar' },
  signup:  { title: 'Creá tu cuenta',         copy: 'Validamos tu identidad una sola vez. Después podés ofertar en todas las subastas.',     cta: 'Crear cuenta' },
  forgot:  { title: 'Recuperar cuenta',       copy: 'Te enviamos un link seguro a tu email para volver a entrar.',                            cta: 'Recuperar cuenta' },
  reset:   { title: 'Nueva contraseña',       copy: 'Definí una contraseña nueva para recuperar el acceso a tu cuenta.',                      cta: 'Guardar contraseña' },
};

// Simple inline icons (avoiding pulling unused icons from the icon set)
const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" />
  </svg>
);
const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="11" width="16" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);
const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
  </svg>
);
const PhoneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z" />
  </svg>
);
const IdIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="12" r="2" /><path d="M14 10h4M14 14h4M5 17c1-1.5 2.5-2 4-2s3 .5 4 2" />
  </svg>
);
const EyeIcon = ({ shown }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {shown ? (
      <>
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <>
        <path d="M9.88 5.08A10.6 10.6 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.06 4.07M6.61 6.61A17 17 0 0 0 2 12s3.5 7 10 7a10.43 10.43 0 0 0 5.39-1.61" /><line x1="3" y1="3" x2="21" y2="21" /><path d="M10.59 10.59a2 2 0 1 0 2.82 2.82" />
      </>
    )}
  </svg>
);

// ----------------------------- input atoms -----------------------------
function Field({ icon, error, children }) {
  const [focused, setFocused] = useState(false);
  return (
    <div
      style={{
        ...inputWrap,
        borderColor: error ? '#dc2626' : focused ? 'var(--at-accent)' : 'var(--at-border)',
        boxShadow: focused ? '0 0 0 4px rgba(0,68,255,.10)' : 'none',
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      <span style={{ color: 'var(--at-ink-3)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>{icon}</span>
      {children}
    </div>
  );
}

function PasswordField({ value, onChange, autoComplete = 'current-password' }) {
  const [show, setShow] = useState(false);
  return (
    <Field icon={<LockIcon />}>
      <input
        style={input} type={show ? 'text' : 'password'} required minLength={6}
        autoComplete={autoComplete}
        value={value} onChange={(e) => onChange(e.target.value)}
        placeholder="Mínimo 6 caracteres"
      />
      <button
        type="button" onClick={() => setShow(s => !s)}
        aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--at-ink-3)', display: 'grid', placeItems: 'center', padding: 0 }}
      >
        <EyeIcon shown={show} />
      </button>
    </Field>
  );
}

// ----------------------------- main -----------------------------
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
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    Promise.resolve().then(() => {
      setMode(initialMode);
      setErr(''); setInfo(''); setConfirmPassword('');
    });
  }, [open, initialMode]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const switchMode = (next) => {
    setMode(next);
    setErr(''); setInfo('');
    setPassword(''); setConfirmPassword('');
  };

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
          email, password,
          options: {
            ...(emailRedirectTo ? { emailRedirectTo } : {}),
            data: { full_name: fullName.trim(), dni: dni.trim(), phone: phone.trim() },
          },
        });
        if (error) throw error;
        if (data?.session?.user) {
          await supabase.from('profiles').upsert({
            user_id: data.session.user.id,
            full_name: fullName.trim(), dni: dni.trim(), phone: phone.trim(),
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

  const ctx = ctxFor[mode];
  const needsPassword = mode !== 'forgot';
  const showTabs = mode === 'signin' || mode === 'signup';

  return (
    <div
      ref={overlayRef}
      style={overlay}
      onMouseDown={(e) => { if (e.target === overlayRef.current) onClose?.(); }}
    >
      <div className="at-auth-shell" style={shell} onClick={(e) => e.stopPropagation()}>
        {/* Brand panel (desktop only via CSS class) */}
        <aside className="at-auth-brand" style={brandPanel}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(600px 240px at 0% 100%, rgba(0,68,255,.45), transparent 60%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', gap: 24 }}>
            <div>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'rgba(255,255,255,.12)',
                display: 'grid', placeItems: 'center', color: '#fff',
                border: '1px solid rgba(255,255,255,.18)',
              }}>
                <IconGavel size={22} sw={2} />
              </div>
              <div style={{ marginTop: 22, fontFamily: 'var(--at-mono)', fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase', color: '#9db8ff', fontWeight: 800 }}>
                AutosTandil · Subastas
              </div>
              <div style={{
                margin: '12px 0 0', fontFamily: 'var(--at-display)',
                fontSize: 'clamp(28px, 3vw, 38px)', lineHeight: 1.02,
                letterSpacing: '-.03em', fontWeight: 600,
              }}>
                Subastas en vivo.
              </div>
              <div style={{ margin: '14px 0 0', color: 'rgba(255,255,255,.74)', fontSize: 14, lineHeight: 1.6, maxWidth: 320 }}>
                Autos curados por AutosTandil. Identidad verificada, seña reembolsable y cierre coordinado.
              </div>
            </div>

            <div style={{ display: 'grid', gap: 10 }}>
              {[
                { icon: <IconShield size={14} sw={2.2} />, label: 'Identidad verificada' },
                { icon: <IconCheck size={14} sw={2.4} />,   label: 'Seña reembolsable' },
                { icon: <IconGavel size={14} sw={2} />,     label: 'Ofertas en tiempo real' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,.86)', fontSize: 12.5, fontWeight: 700 }}>
                  <span style={{ width: 22, height: 22, borderRadius: 999, background: 'rgba(255,255,255,.14)', display: 'grid', placeItems: 'center' }}>
                    {item.icon}
                  </span>
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </aside>

        <button type="button" onClick={onClose} aria-label="Cerrar" style={closeBtn}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(15,23,42,.12)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(15,23,42,.06)'; }}
        >
          <IconClose size={16} sw={2.2} stroke="currentColor" />
        </button>

        <form style={formPanel} onSubmit={submit}>
          {showTabs && (
            <div aria-label="Tipo de acceso" style={tabsWrap}>
              <button type="button" aria-pressed={mode === 'signin'}
                onClick={() => switchMode('signin')} style={tabBtn(mode === 'signin')}>
                Ingresar
              </button>
              <button type="button" aria-pressed={mode === 'signup'}
                onClick={() => switchMode('signup')} style={tabBtn(mode === 'signup')}>
                Crear cuenta
              </button>
            </div>
          )}

          {!showTabs && (
            <div style={{ marginBottom: 18 }}>
              <h3 style={{ margin: 0, fontFamily: 'var(--at-display)', fontSize: 22, fontWeight: 800, letterSpacing: '-.02em', color: 'var(--at-ink)' }}>
                {ctx.title}
              </h3>
              <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--at-ink-2)', lineHeight: 1.5 }}>
                {ctx.copy}
              </p>
            </div>
          )}

          {mode !== 'reset' && (
            <div style={{ marginBottom: 14 }}>
              <span style={label}>Email</span>
              <Field icon={<MailIcon />}>
                <input style={input} type="email" autoComplete="email" required
                  placeholder="tu@email.com"
                  value={email} onChange={(e) => setEmail(e.target.value)} />
              </Field>
            </div>
          )}

          {mode === 'signup' && (
            <>
              <div style={{ marginBottom: 14 }}>
                <span style={label}>Nombre y apellido</span>
                <Field icon={<UserIcon />}>
                  <input style={input} autoComplete="name" required
                    placeholder="Como figura en tu DNI"
                    value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </Field>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 10, marginBottom: 14 }}>
                <div>
                  <span style={label}>Documento</span>
                  <Field icon={<IdIcon />}>
                    <input style={input} inputMode="numeric" autoComplete="off" required
                      placeholder="DNI"
                      value={dni} onChange={(e) => setDni(e.target.value)} />
                  </Field>
                </div>
                <div>
                  <span style={label}>Teléfono</span>
                  <Field icon={<PhoneIcon />}>
                    <input style={input} inputMode="tel" autoComplete="tel" required
                      placeholder="+54 9 ..."
                      value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </Field>
                </div>
              </div>
            </>
          )}

          {needsPassword && (
            <div style={{ marginBottom: mode === 'reset' ? 14 : 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={label}>Contraseña</span>
                {mode === 'signin' && (
                  <button type="button" style={{ ...linkBtn, fontSize: 11, marginBottom: 6 }} onClick={() => switchMode('forgot')}>
                    Olvidé mi contraseña
                  </button>
                )}
              </div>
              <PasswordField
                value={password} onChange={setPassword}
                autoComplete={mode === 'signup' || mode === 'reset' ? 'new-password' : 'current-password'}
              />
            </div>
          )}

          {mode === 'reset' && (
            <div style={{ marginBottom: 16 }}>
              <span style={label}>Repetir contraseña</span>
              <PasswordField value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" />
            </div>
          )}

          {err && (
            <div role="alert" style={{
              marginBottom: 12, padding: '11px 12px', borderRadius: 10,
              background: '#fef2f2', color: '#991b1b', fontSize: 12.5, lineHeight: 1.45,
              border: '1px solid #fecaca',
            }}>
              {err}
            </div>
          )}
          {info && (
            <div style={{
              marginBottom: 12, padding: '11px 12px', borderRadius: 10,
              background: '#ecfdf5', color: '#065f46', fontSize: 12.5, lineHeight: 1.45,
              border: '1px solid #a7f3d0',
            }}>
              {info}
            </div>
          )}

          <button type="submit" style={{ ...btn, opacity: busy ? .6 : 1 }} disabled={busy}>
            {busy ? (
              <>
                <span style={{ width: 14, height: 14, borderRadius: 999, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', animation: 'at-spin .7s linear infinite' }} />
                Procesando…
              </>
            ) : (
              <>{ctx.cta}</>
            )}
          </button>

          {(mode === 'forgot' || mode === 'reset') && (
            <div style={{ marginTop: 14, textAlign: 'center', fontSize: 13, color: 'var(--at-ink-2)' }}>
              <button type="button" style={linkBtn} onClick={() => switchMode('signin')}>
                Volver al inicio de sesión
              </button>
            </div>
          )}

          {showTabs && (
            <p style={{ margin: '16px 0 0', fontSize: 11.5, color: 'var(--at-ink-3)', lineHeight: 1.5, textAlign: 'center' }}>
              Al continuar aceptás las reglas de subasta de AutosTandil.
              La seña es reembolsable si no resultás ganador.
            </p>
          )}
        </form>
      </div>

      <style>{`
        @keyframes at-fade-in { from { opacity: 0 } to { opacity: 1 } }
        @keyframes at-pop-in {
          from { opacity: 0; transform: translateY(8px) scale(.97) }
          to   { opacity: 1; transform: translateY(0) scale(1) }
        }
        @keyframes at-spin { to { transform: rotate(360deg) } }
        @media (min-width: 720px) {
          .at-auth-shell { grid-template-columns: minmax(280px, 360px) minmax(0, 1fr) !important; max-width: 880px !important; }
          .at-auth-brand { display: block !important; }
        }
      `}</style>
    </div>
  );
}
