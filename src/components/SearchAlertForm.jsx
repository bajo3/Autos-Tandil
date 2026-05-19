import { useState } from 'react';
import { fmtShort } from '../lib/utils';
import { saveBuyerAlert } from '../services/leadService';
import { trackEvent } from '../services/analyticsService';
import { IconCheck, IconWhatsapp } from './Icons';

const inputStyle = {
  width: '100%',
  border: '1px solid var(--at-border)',
  background: 'var(--at-surface)',
  color: 'var(--at-ink)',
  borderRadius: 10,
  padding: '11px 12px',
  fontSize: 13,
  outline: 'none',
};

const labelStyle = {
  display: 'grid',
  gap: 6,
  fontSize: 10,
  color: 'var(--at-ink-3)',
  fontFamily: 'var(--at-mono)',
  letterSpacing: '.12em',
  textTransform: 'uppercase',
};

export function SearchAlertForm({ filters = {}, query = '', source = 'catalog', compact = false }) {
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    query,
    budget_max: filters.maxPrice || '',
    brand: filters.brand || '',
    type: filters.type || '',
    year_min: filters.minYear || '',
  });
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const patch = (key, value) => setForm(current => ({ ...current, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setStatus('saving');
    setError('');
    try {
      await saveBuyerAlert({ ...form, source });
      trackEvent('buyer_alert_created', { source, metadata: form });
      setStatus('done');
    } catch (e) {
      setError(e?.message || 'No se pudo crear la alerta.');
      setStatus('idle');
    }
  };

  if (status === 'done') {
    return (
      <div style={{
        border: '1px solid #bbf7d0',
        background: '#f0fdf4',
        color: '#166534',
        borderRadius: 14,
        padding: 16,
        display: 'flex',
        gap: 10,
        alignItems: 'flex-start',
      }}>
        <span style={{ width: 24, height: 24, borderRadius: 999, background: '#22c55e', color: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
          <IconCheck size={14} sw={2.5} stroke="#fff" />
        </span>
        <div>
          <strong style={{ display: 'block', color: '#14532d' }}>Alerta creada</strong>
          <span style={{ display: 'block', marginTop: 3, fontSize: 13, lineHeight: 1.45 }}>
            Te contactamos cuando aparezca una unidad que encaje con tu búsqueda.
          </span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} style={{
      background: compact ? 'transparent' : 'var(--at-surface)',
      border: compact ? 'none' : '1px solid var(--at-border)',
      borderRadius: compact ? 0 : 16,
      padding: compact ? 0 : 16,
      display: 'grid',
      gap: 12,
    }}>
      {!compact && (
        <div>
          <div style={{ fontFamily: 'var(--at-display)', fontSize: 20, fontWeight: 650, color: 'var(--at-ink)', letterSpacing: '-.02em' }}>
            Creá una alerta de búsqueda
          </div>
          <p style={{ margin: '5px 0 0', color: 'var(--at-ink-2)', fontSize: 13, lineHeight: 1.5 }}>
            Si hoy no está tu auto ideal, lo convertimos en oportunidad de venta.
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-2" style={{ gap: 10 }}>
        <label style={labelStyle}>Nombre
          <input style={inputStyle} value={form.full_name} onChange={e => patch('full_name', e.target.value)} placeholder="Tu nombre" />
        </label>
        <label style={labelStyle}>WhatsApp
          <input style={inputStyle} required value={form.phone} onChange={e => patch('phone', e.target.value)} placeholder="249..." />
        </label>
      </div>
      <div className="grid md:grid-cols-3" style={{ gap: 10 }}>
        <label style={labelStyle}>Búsqueda
          <input style={inputStyle} value={form.query} onChange={e => patch('query', e.target.value)} placeholder="Marca, modelo..." />
        </label>
        <label style={labelStyle}>Presupuesto máximo
          <input style={inputStyle} type="number" value={form.budget_max} onChange={e => patch('budget_max', e.target.value)} placeholder="25000000" />
        </label>
        <label style={labelStyle}>Año desde
          <input style={inputStyle} type="number" value={form.year_min} onChange={e => patch('year_min', e.target.value)} placeholder="2020" />
        </label>
      </div>

      {(form.brand || form.type || form.budget_max) && (
        <div style={{ fontSize: 12, color: 'var(--at-ink-2)' }}>
          Buscamos {form.type || 'auto'} {form.brand ? `marca ${form.brand}` : ''} {form.budget_max ? `hasta ${fmtShort(Number(form.budget_max))}` : ''}.
        </div>
      )}
      {error && <div style={{ color: '#991b1b', fontSize: 12 }}>{error}</div>}
      <button disabled={status === 'saving'} style={{
        border: 'none',
        borderRadius: 999,
        padding: '12px 16px',
        background: 'var(--at-ink)',
        color: '#fff',
        fontWeight: 900,
        fontSize: 13,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        opacity: status === 'saving' ? .65 : 1,
      }}>
        <IconWhatsapp size={16} fill="#fff" />
        {status === 'saving' ? 'Creando alerta...' : 'Avisarme por WhatsApp'}
      </button>
    </form>
  );
}
