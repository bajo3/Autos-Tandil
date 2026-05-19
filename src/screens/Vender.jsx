import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildWhatsapp } from '../lib/utils';
import { saveSalesLead } from '../services/leadService';
import { trackEvent } from '../services/analyticsService';
import { AppHeader } from '../components/AppHeader';
import { ATLogo } from '../components/ATLogo';
import {
  IconWhatsapp, IconCheck, IconLocation, IconShield,
  IconHandshake, IconClock,
} from '../components/Icons';

const steps = [
  { n: '01', title: 'Nos contactás', desc: 'Mandanos un WhatsApp con los datos de tu auto. Año, kilometraje, versión y fotos si tenés.' },
  { n: '02', title: 'Evaluamos tu auto', desc: 'Te damos una estimación de precio justa según el mercado actual en Tandil.' },
  { n: '03', title: 'Lo publicamos por vos', desc: 'Armamos la ficha técnica y lo publicamos con fotos profesionales bajo la marca AutosTandil.' },
  { n: '04', title: 'Gestionamos las consultas', desc: 'Recibimos, filtramos y coordinamos las visitas. Vos no tenés que atender a nadie.' },
  { n: '05', title: 'Cerramos la venta', desc: 'Te notificamos cuando haya un interesado serio y coordinamos la transferencia final.' },
];

const benefits = [
  { i: <IconClock size={20} sw={1.6} />, t: 'Sin perder tiempo', d: 'Nos ocupamos de todo el proceso de venta.' },
  { i: <IconShield size={20} sw={1.6} />, t: 'Precio justo', d: 'Te asesoramos con el valor real del mercado.' },
  { i: <IconLocation size={20} sw={1.6} />, t: 'Local en Tandil', d: 'Compradores reales, coordinamos visitas presenciales.' },
  { i: <IconHandshake size={20} sw={1.6} />, t: 'Sin costo inicial', d: 'Solo cobramos comisión cuando se vende.' },
];

export default function Vender() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    vehicle_brand: '',
    vehicle_model: '',
    vehicle_year: '',
    vehicle_km: '',
    notes: '',
  });
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const patch = (key, value) => setForm(current => ({ ...current, [key]: value }));

  const submitLead = async (event) => {
    event.preventDefault();
    setStatus('saving');
    setError('');
    try {
      await saveSalesLead({ ...form, lead_type: 'seller', source: 'sell_page' });
      trackEvent('seller_lead_created', { source: 'sell_page', metadata: { brand: form.vehicle_brand, year: form.vehicle_year } });
      setStatus('done');
    } catch (e) {
      setError(e?.message || 'No se pudo guardar la consulta.');
      setStatus('idle');
    }
  };

  return (
    <div className="pb-[100px] md:pb-0">
      <AppHeader onBack={() => navigate('/')} title="Vender mi auto" />

      {/* HERO */}
      <section style={{
        background: 'var(--at-ink)', color: '#fff',
        padding: '28px 22px 32px',
        backgroundImage: 'radial-gradient(140% 90% at 110% -10%, rgba(0,68,255,.25), transparent 55%)',
      }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
          <div style={{
            fontFamily: 'var(--at-mono)', fontSize: 10, letterSpacing: '.18em',
            textTransform: 'uppercase', color: 'var(--at-accent-soft-fg)', opacity: .9, marginBottom: 12,
          }}>Consignación · AutosTandil</div>
          <h1 style={{
            margin: '0 0 14px', fontFamily: 'var(--at-display)',
            fontSize: 'clamp(28px, 3.5vw, 48px)', fontWeight: 500, letterSpacing: '-.03em',
            lineHeight: 1.05, color: '#fff',
          }}>
            Vendé tu auto<br/>
            <span style={{ fontStyle: 'italic', color: 'var(--at-accent-soft-fg)' }}>sin complicaciones.</span>
          </h1>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: 'rgba(255,255,255,.75)', maxWidth: 360 }}>
            Te ayudamos a vender tu auto con presentación profesional, sin que tengas que lidiar con consultas ni coordinaciones.
          </p>
          <a href={buildWhatsapp(null, 'sell')} target="_blank" rel="noopener noreferrer"
            style={{
              marginTop: 22, display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '13px 20px', borderRadius: 999,
              background: '#25D366', color: '#fff',
              fontWeight: 600, fontSize: 14, textDecoration: 'none',
              boxShadow: '0 8px 24px -8px rgba(37,211,102,.5)',
            }}>
            <IconWhatsapp size={18} fill="#fff" />Quiero vender mi auto
          </a>
        </div>
      </section>

      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 20px' }}>
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-start">
          {/* CÓMO FUNCIONA */}
          <section style={{ padding: '28px 0 8px' }}>
            <div style={{
              fontFamily: 'var(--at-mono)', fontSize: 10, letterSpacing: '.18em',
              textTransform: 'uppercase', color: 'var(--at-ink-3)', marginBottom: 6,
            }}>El proceso</div>
            <h2 style={{
              margin: '0 0 20px', fontFamily: 'var(--at-display)',
              fontSize: 22, fontWeight: 500, letterSpacing: '-.025em', lineHeight: 1.1,
              color: 'var(--at-ink)',
            }}>Cómo funciona</h2>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {steps.map((step, i) => (
                <div key={step.n} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{
                      width: 36, height: 36, borderRadius: 999,
                      background: 'var(--at-ink)', color: '#fff',
                      display: 'grid', placeItems: 'center', flexShrink: 0,
                      fontFamily: 'var(--at-mono)', fontSize: 11, fontWeight: 700,
                    }}>{step.n}</span>
                    {i < steps.length - 1 && (
                      <div style={{ width: 1, flex: 1, minHeight: 24, background: 'var(--at-border)', margin: '4px 0' }} />
                    )}
                  </div>
                  <div style={{ paddingBottom: i < steps.length - 1 ? 20 : 0, paddingTop: 6 }}>
                    <div style={{ fontFamily: 'var(--at-display)', fontWeight: 600, fontSize: 15, letterSpacing: '-.01em', color: 'var(--at-ink)' }}>
                      {step.title}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--at-ink-2)', marginTop: 4, lineHeight: 1.5 }}>
                      {step.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div>
            {/* BENEFICIOS */}
            <section style={{ padding: '28px 0 8px' }}>
              <div style={{
                fontFamily: 'var(--at-mono)', fontSize: 10, letterSpacing: '.18em',
                textTransform: 'uppercase', color: 'var(--at-ink-3)', marginBottom: 6,
              }}>Por qué elegirnos</div>
              <h2 style={{
                margin: '0 0 16px', fontFamily: 'var(--at-display)',
                fontSize: 22, fontWeight: 500, letterSpacing: '-.025em', lineHeight: 1.1, color: 'var(--at-ink)',
              }}>Beneficios de consignar</h2>
              <div style={{ display: 'grid', gap: 1, background: 'var(--at-border)', borderRadius: 14, overflow: 'hidden', border: '1px solid var(--at-border)' }}>
                {benefits.map((b, i) => (
                  <div key={i} style={{
                    background: 'var(--at-surface)', padding: '16px',
                    display: 'flex', gap: 14, alignItems: 'flex-start',
                  }}>
                    <span style={{ color: 'var(--at-accent)', flexShrink: 0, marginTop: 2 }}>{b.i}</span>
                    <div>
                      <div style={{ fontFamily: 'var(--at-display)', fontWeight: 600, fontSize: 14, letterSpacing: '-.01em' }}>{b.t}</div>
                      <div style={{ fontSize: 12, color: 'var(--at-ink-2)', marginTop: 2, lineHeight: 1.4 }}>{b.d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section style={{ padding: '28px 0 8px' }}>
              <h2 style={{
                margin: '0 0 16px', fontFamily: 'var(--at-display)',
                fontSize: 22, fontWeight: 500, letterSpacing: '-.025em', lineHeight: 1.1, color: 'var(--at-ink)',
              }}>Pedí una evaluación</h2>
              <form onSubmit={submitLead} style={{
                background: 'var(--at-surface)', border: '1px solid var(--at-border)',
                borderRadius: 14, padding: 16, display: 'grid', gap: 10,
              }}>
                <div className="grid md:grid-cols-2" style={{ gap: 10 }}>
                  <label style={formLabel}>Nombre<input style={formInput} value={form.full_name} onChange={e => patch('full_name', e.target.value)} placeholder="Tu nombre" /></label>
                  <label style={formLabel}>WhatsApp<input required style={formInput} value={form.phone} onChange={e => patch('phone', e.target.value)} placeholder="249..." /></label>
                </div>
                <div className="grid md:grid-cols-2" style={{ gap: 10 }}>
                  <label style={formLabel}>Marca<input required style={formInput} value={form.vehicle_brand} onChange={e => patch('vehicle_brand', e.target.value)} placeholder="Toyota" /></label>
                  <label style={formLabel}>Modelo<input required style={formInput} value={form.vehicle_model} onChange={e => patch('vehicle_model', e.target.value)} placeholder="Corolla" /></label>
                </div>
                <div className="grid md:grid-cols-2" style={{ gap: 10 }}>
                  <label style={formLabel}>Año<input style={formInput} type="number" value={form.vehicle_year} onChange={e => patch('vehicle_year', e.target.value)} placeholder="2021" /></label>
                  <label style={formLabel}>Km<input style={formInput} type="number" value={form.vehicle_km} onChange={e => patch('vehicle_km', e.target.value)} placeholder="60000" /></label>
                </div>
                <label style={formLabel}>Comentarios<textarea style={{ ...formInput, minHeight: 78, resize: 'vertical' }} value={form.notes} onChange={e => patch('notes', e.target.value)} placeholder="Estado, versión, detalles..." /></label>
                {status === 'done' && <div style={{ color: '#166534', fontSize: 13, fontWeight: 800 }}>Listo. Quedó guardado y te contactamos para avanzar.</div>}
                {error && <div style={{ color: '#991b1b', fontSize: 12 }}>{error}</div>}
                <button disabled={status === 'saving'} style={{
                  border: 'none', borderRadius: 999, padding: '13px 18px',
                  background: 'var(--at-ink)', color: '#fff',
                  fontWeight: 900, cursor: 'pointer', opacity: status === 'saving' ? .65 : 1,
                }}>
                  {status === 'saving' ? 'Enviando...' : 'Quiero que lo evalúen'}
                </button>
              </form>
            </section>

            {/* QUÉ NECESITÁS */}
            <section style={{ padding: '28px 0 8px' }}>
              <h2 style={{
                margin: '0 0 16px', fontFamily: 'var(--at-display)',
                fontSize: 20, fontWeight: 500, letterSpacing: '-.02em', color: 'var(--at-ink)',
              }}>¿Qué necesitás para empezar?</h2>
              <div style={{
                background: 'var(--at-surface)', border: '1px solid var(--at-border)',
                borderRadius: 14, overflow: 'hidden',
              }}>
                <ul style={{ margin: 0, padding: '4px 20px 4px', listStyle: 'none' }}>
                  {[
                    'Datos del auto (marca, modelo, año, km, versión)',
                    'Fotos del exterior e interior (si tenés)',
                    'Documentación al día (título y cédula)',
                    '¡Eso es todo! Nosotros hacemos el resto',
                  ].map((t, i) => (
                    <li key={i} style={{
                      display: 'flex', gap: 10, alignItems: 'flex-start',
                      padding: '11px 0', fontSize: 13.5, color: 'var(--at-ink-2)',
                      borderBottom: i < 3 ? '1px solid var(--at-border)' : 'none',
                    }}>
                      <span style={{
                        flexShrink: 0, width: 20, height: 20, borderRadius: 999,
                        background: i === 3 ? 'var(--at-accent)' : 'var(--at-bg-2)',
                        color: i === 3 ? '#fff' : 'var(--at-ink)',
                        display: 'grid', placeItems: 'center', marginTop: 1,
                      }}><IconCheck size={12} sw={2.4} stroke={i === 3 ? '#fff' : 'var(--at-ink-2)'}/></span>
                      <span style={{ color: i === 3 ? 'var(--at-ink)' : 'var(--at-ink-2)', fontWeight: i === 3 ? 600 : 400 }}>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </div>
        </div>

        {/* CTA FINAL */}
        <section style={{ padding: '28px 0 8px' }}>
          <div style={{
            background: 'var(--at-ink)', color: '#fff', borderRadius: 18, padding: '28px 24px',
            backgroundImage: 'radial-gradient(120% 80% at 100% 0%, rgba(255,255,255,.08), transparent 60%)',
          }}>
            <div style={{
              fontFamily: 'var(--at-mono)', fontSize: 10, letterSpacing: '.18em',
              textTransform: 'uppercase', color: 'var(--at-accent-soft-fg)', opacity: .9,
            }}>¿Listo para vender?</div>
            <h3 style={{
              margin: '8px 0 16px', fontFamily: 'var(--at-display)',
              fontSize: 24, fontWeight: 500, letterSpacing: '-.025em', lineHeight: 1.1,
            }}>
              Contactanos por WhatsApp<br/>y empezamos hoy.
            </h3>
            <a href={buildWhatsapp(null, 'sell')} target="_blank" rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '13px 20px', borderRadius: 999,
                background: '#25D366', color: '#fff',
                fontWeight: 600, fontSize: 14, textDecoration: 'none',
                boxShadow: '0 8px 24px -8px rgba(37,211,102,.5)',
              }}>
              <IconWhatsapp size={18} fill="#fff" />Quiero vender mi auto
            </a>
          </div>
        </section>

        {/* Footer branding */}
        <div style={{ padding: '28px 0 32px', textAlign: 'center' }}>
          <ATLogo size={20} color="var(--at-ink)" />
          <div style={{ marginTop: 8, fontSize: 11, color: 'var(--at-ink-3)', lineHeight: 1.5 }}>
            Unidades en consignación · Tandil, Buenos Aires
          </div>
        </div>
      </div>
    </div>
  );
}

const formInput = {
  width: '100%',
  border: '1px solid var(--at-border)',
  background: 'var(--at-bg)',
  color: 'var(--at-ink)',
  borderRadius: 10,
  padding: '11px 12px',
  fontSize: 13,
  outline: 'none',
};

const formLabel = {
  display: 'grid',
  gap: 6,
  fontSize: 10,
  color: 'var(--at-ink-3)',
  fontFamily: 'var(--at-mono)',
  letterSpacing: '.12em',
  textTransform: 'uppercase',
};
