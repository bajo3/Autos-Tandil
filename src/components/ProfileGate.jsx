import { useState } from 'react';

const card = {
  background: 'var(--at-surface)', border: '1px solid var(--at-border)',
  borderRadius: 18, padding: 18,
};
const input = {
  width: '100%', border: '1px solid var(--at-border)', borderRadius: 12,
  padding: '11px 13px', fontSize: 14, fontFamily: 'inherit', background: 'var(--at-bg)',
  color: 'var(--at-ink)', outline: 'none', boxSizing: 'border-box',
};
const label = {
  display: 'block', fontSize: 11, color: 'var(--at-ink-3)',
  fontFamily: 'var(--at-mono)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6,
};

export function ProfileGate({ profile, onSave }) {
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [dni, setDni] = useState(profile?.dni || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [city, setCity] = useState(profile?.city || '');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true); setErr('');
    try {
      await onSave({ full_name: fullName.trim(), dni: dni.trim(), phone: phone.trim(), city: city.trim() });
    } catch (e) {
      setErr(e?.message || 'No se pudo guardar.');
    } finally { setBusy(false); }
  };

  return (
    <form style={card} onSubmit={submit}>
      <div style={{ fontFamily: 'var(--at-mono)', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--at-accent)', fontWeight: 900 }}>
        Validación
      </div>
      <h3 style={{ margin: '6px 0 4px', fontFamily: 'var(--at-display)', fontSize: 20, fontWeight: 800, color: 'var(--at-ink)' }}>
        Completá tus datos
      </h3>
      <p style={{ margin: '0 0 14px', fontSize: 12.5, color: 'var(--at-ink-2)', lineHeight: 1.5 }}>
        Necesitamos verificar tu identidad antes de habilitarte para ofertar. Tus datos quedan privados.
      </p>

      <div style={{ display: 'grid', gap: 10 }}>
        <div>
          <span style={label}>Nombre y apellido</span>
          <input style={input} required value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <span style={label}>DNI</span>
            <input style={input} required inputMode="numeric" value={dni} onChange={(e) => setDni(e.target.value)} />
          </div>
          <div>
            <span style={label}>Teléfono</span>
            <input style={input} required inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
        </div>
        <div>
          <span style={label}>Ciudad</span>
          <input style={input} value={city} onChange={(e) => setCity(e.target.value)} />
        </div>
      </div>

      {err && <div style={{ marginTop: 12, padding: 10, borderRadius: 10, background: '#fee2e2', color: '#991b1b', fontSize: 12 }}>{err}</div>}

      <button type="submit" disabled={busy}
        style={{ marginTop: 14, width: '100%', padding: '12px', borderRadius: 12, border: 'none', background: 'var(--at-ink)', color: '#fff', fontWeight: 900, cursor: 'pointer', fontFamily: 'inherit', opacity: busy ? .6 : 1 }}>
        {busy ? 'Guardando…' : 'Guardar y continuar'}
      </button>
    </form>
  );
}
