import { useNavigate } from 'react-router-dom';
import { buildWhatsapp } from '../lib/utils';
import { AppHeader } from '../components/AppHeader';
import { ATLogo } from '../components/ATLogo';
import {
  IconWhatsapp, IconCheck, IconLocation, IconShield,
  IconHandshake, IconClock,
} from '../components/Icons';

const steps = [
  {
    n: '01', title: 'Nos contactás',
    desc: 'Mandanos un WhatsApp con los datos básicos: marca, modelo, año, km y fotos si tenés.',
  },
  {
    n: '02', title: 'Evaluamos tu auto',
    desc: 'Te damos una estimación de precio justa según el mercado actual en Tandil.',
  },
  {
    n: '03', title: 'Lo publicamos por vos',
    desc: 'Armamos la ficha técnica y lo publicamos con fotos profesionales bajo la marca AutosTandil.',
  },
  {
    n: '04', title: 'Gestionamos las consultas',
    desc: 'Recibimos, filtramos y coordinamos las visitas. Vos no tenés que atender a nadie.',
  },
  {
    n: '05', title: 'Cerramos la venta',
    desc: 'Te avisamos cuando haya un comprador serio y coordinamos la transferencia final.',
  },
];

const benefits = [
  { i: <IconClock size={20} sw={1.6} />, t: 'Sin perder tiempo', d: 'Nos ocupamos de todo el proceso de venta, de principio a fin.' },
  { i: <IconShield size={20} sw={1.6} />, t: 'Precio justo', d: 'Te asesoramos con el valor real del mercado actual en Tandil.' },
  { i: <IconLocation size={20} sw={1.6} />, t: 'Local en Tandil', d: 'Compradores reales de la zona. Coordinamos visitas presenciales.' },
  { i: <IconHandshake size={20} sw={1.6} />, t: 'Sin costo inicial', d: 'Solo cobramos comisión cuando el auto se vende. Sin riesgo.' },
];

export default function Vender() {
  const navigate = useNavigate();

  return (
    <div className="pb-[100px] md:pb-0">
      <AppHeader onBack={() => navigate('/')} title="Vender mi auto" />

      {/* HERO */}
      <section style={{
        background: 'var(--at-ink)', color: '#fff',
        padding: '32px 22px 36px',
        backgroundImage: 'radial-gradient(140% 90% at 110% -10%, rgba(0,68,255,.28), transparent 55%)',
      }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontFamily: 'var(--at-mono)', fontSize: 10, letterSpacing: '.18em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,.6)', marginBottom: 14,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: 999, background: '#25D366' }} />
            Consignación · AutosTandil
          </div>
          <h1 style={{
            margin: '0 0 14px', fontFamily: 'var(--at-display)',
            fontSize: 'clamp(28px, 3.5vw, 48px)', fontWeight: 500, letterSpacing: '-.03em',
            lineHeight: 1.05, color: '#fff',
          }}>
            Vendé tu auto<br/>
            <span style={{ fontStyle: 'italic', color: 'rgba(255,255,255,.7)' }}>sin complicaciones.</span>
          </h1>
          <p style={{ margin: '0 0 24px', fontSize: 14, lineHeight: 1.6, color: 'rgba(255,255,255,.7)', maxWidth: 380 }}>
            Te ayudamos a vender con presentación profesional. Sin atender consultas ni coordinar visitas — nosotros lo hacemos por vos.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
            <a href={buildWhatsapp(null, 'sell')} target="_blank" rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '13px 22px', borderRadius: 999,
                background: '#25D366', color: '#fff',
                fontWeight: 700, fontSize: 14, textDecoration: 'none',
                boxShadow: '0 8px 24px -8px rgba(37,211,102,.6)',
                transition: 'opacity .15s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '.88'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
              <IconWhatsapp size={18} fill="#fff" />Quiero vender mi auto
            </a>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,.5)' }}>Sin costo inicial · Comisión al vender</span>
          </div>
        </div>
      </section>

      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 20px' }}>
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-start">

          {/* CÓMO FUNCIONA */}
          <section style={{ padding: '32px 0 8px' }}>
            <div style={{
              fontFamily: 'var(--at-mono)', fontSize: 10, letterSpacing: '.18em',
              textTransform: 'uppercase', color: 'var(--at-ink-3)', marginBottom: 6,
            }}>El proceso</div>
            <h2 style={{
              margin: '0 0 20px', fontFamily: 'var(--at-display)',
              fontSize: 22, fontWeight: 500, letterSpacing: '-.025em', lineHeight: 1.1,
              color: 'var(--at-ink)',
            }}>Cómo funciona</h2>

            {/* Steps as connected cards */}
            <div style={{ position: 'relative' }}>
              {/* Vertical connector line */}
              <div style={{
                position: 'absolute', left: 17, top: 36, bottom: 36,
                width: 1, background: 'var(--at-border)',
              }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {steps.map((step, i) => (
                  <div key={step.n} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', padding: '2px 0' }}>
                    {/* Number bubble */}
                    <span style={{
                      width: 36, height: 36, borderRadius: 999, flexShrink: 0,
                      background: i === 0 ? 'var(--at-ink)' : 'var(--at-surface)',
                      color: i === 0 ? '#fff' : 'var(--at-ink-2)',
                      border: i === 0 ? 'none' : '1px solid var(--at-border)',
                      display: 'grid', placeItems: 'center',
                      fontFamily: 'var(--at-mono)', fontSize: 11, fontWeight: 700,
                      zIndex: 1, position: 'relative',
                      boxShadow: i === 0 ? 'none' : '0 0 0 3px var(--at-bg)',
                      transition: 'background .15s',
                    }}>{step.n}</span>
                    <div style={{ paddingTop: 7, paddingBottom: i < steps.length - 1 ? 16 : 0 }}>
                      <div style={{ fontFamily: 'var(--at-display)', fontWeight: 600, fontSize: 15, letterSpacing: '-.01em', color: 'var(--at-ink)', lineHeight: 1.2 }}>
                        {step.title}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--at-ink-2)', marginTop: 4, lineHeight: 1.55 }}>
                        {step.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div>
            {/* BENEFICIOS */}
            <section style={{ padding: '32px 0 8px' }}>
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
                    transition: 'background .15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--at-bg-2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--at-surface)'}>
                    <span style={{
                      width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                      background: 'var(--at-accent-soft)', display: 'grid', placeItems: 'center',
                      color: 'var(--at-accent)',
                    }}>{b.i}</span>
                    <div>
                      <div style={{ fontFamily: 'var(--at-display)', fontWeight: 600, fontSize: 14, letterSpacing: '-.01em', color: 'var(--at-ink)' }}>{b.t}</div>
                      <div style={{ fontSize: 12.5, color: 'var(--at-ink-2)', marginTop: 3, lineHeight: 1.5 }}>{b.d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* QUÉ NECESITÁS */}
            <section style={{ padding: '20px 0 8px' }}>
              <h2 style={{
                margin: '0 0 14px', fontFamily: 'var(--at-display)',
                fontSize: 20, fontWeight: 500, letterSpacing: '-.02em', color: 'var(--at-ink)',
              }}>¿Qué necesitás para empezar?</h2>
              <div style={{
                background: 'var(--at-surface)', border: '1px solid var(--at-border)',
                borderRadius: 14, overflow: 'hidden',
              }}>
                <ul style={{ margin: 0, padding: '4px 18px 4px', listStyle: 'none' }}>
                  {[
                    'Datos del auto (marca, modelo, año, km, versión)',
                    'Fotos del exterior e interior (si tenés)',
                    'Documentación al día (título y cédula)',
                    '¡Eso es todo! Nosotros hacemos el resto',
                  ].map((t, i) => (
                    <li key={i} style={{
                      display: 'flex', gap: 10, alignItems: 'flex-start',
                      padding: '12px 0', fontSize: 13.5,
                      borderBottom: i < 3 ? '1px solid var(--at-border)' : 'none',
                    }}>
                      <span style={{
                        flexShrink: 0, width: 20, height: 20, borderRadius: 999,
                        background: i === 3 ? 'var(--at-accent)' : 'var(--at-bg-2)',
                        border: i === 3 ? 'none' : '1px solid var(--at-border)',
                        display: 'grid', placeItems: 'center', marginTop: 1,
                      }}>
                        <IconCheck size={11} sw={2.5} stroke={i === 3 ? '#fff' : 'var(--at-ink-2)'}/>
                      </span>
                      <span style={{ color: i === 3 ? 'var(--at-ink)' : 'var(--at-ink-2)', fontWeight: i === 3 ? 600 : 400, lineHeight: 1.5 }}>{t}</span>
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
            background: 'var(--at-ink)', color: '#fff', borderRadius: 18, padding: '32px 28px',
            backgroundImage: 'radial-gradient(120% 80% at 100% 0%, rgba(0,68,255,.2), transparent 60%)',
          }}>
            <div style={{
              fontFamily: 'var(--at-mono)', fontSize: 10, letterSpacing: '.18em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,.55)', marginBottom: 10,
            }}>¿Listo para vender?</div>
            <h3 style={{
              margin: '0 0 6px', fontFamily: 'var(--at-display)',
              fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 500, letterSpacing: '-.025em', lineHeight: 1.1,
            }}>
              Contactanos por WhatsApp<br/>
              <span style={{ fontStyle: 'italic', color: 'rgba(255,255,255,.65)' }}>y empezamos hoy.</span>
            </h3>
            <p style={{ margin: '0 0 22px', fontSize: 13, color: 'rgba(255,255,255,.55)', lineHeight: 1.5 }}>
              Respondemos rápido. Sin compromiso.
            </p>
            <a href={buildWhatsapp(null, 'sell')} target="_blank" rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '13px 22px', borderRadius: 999,
                background: '#25D366', color: '#fff',
                fontWeight: 700, fontSize: 14, textDecoration: 'none',
                boxShadow: '0 8px 24px -8px rgba(37,211,102,.6)',
                transition: 'opacity .15s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '.88'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
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
