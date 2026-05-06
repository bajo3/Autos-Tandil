import { useNavigate } from 'react-router-dom';
import { buildWhatsapp } from '../lib/utils';
import { AppHeader } from '../components/AppHeader';
import { IconWhatsapp } from '../components/Icons';

export default function Subastas() {
  const navigate = useNavigate();

  return (
    <div className="pb-[88px] md:pb-0">
      <AppHeader onBack={() => navigate('/')} title="Subastas" />

      {/* Desktop page title */}
      <div className="hidden md:block" style={{ borderBottom: '1px solid var(--at-border)', padding: '28px 0 20px' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 32px' }}>
          <div style={{
            fontFamily: 'var(--at-mono)', fontSize: 10, letterSpacing: '.18em',
            textTransform: 'uppercase', color: 'var(--at-ink-3)', marginBottom: 6,
          }}>Próximamente</div>
          <h1 style={{
            margin: 0, fontFamily: 'var(--at-display)',
            fontSize: 36, fontWeight: 500, letterSpacing: '-.03em', color: 'var(--at-ink)',
          }}>Subastas en AutosTandil.</h1>
        </div>
      </div>

      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 20px' }}>
        {/* Mobile eyebrow (hidden on desktop since it's in the title above) */}
        <div className="md:hidden" style={{ padding: '14px 0 0' }}>
          <div style={{
            fontFamily: 'var(--at-mono)', fontSize: 10, letterSpacing: '.18em',
            textTransform: 'uppercase', color: 'var(--at-ink-3)',
          }}>Próximamente</div>
          <h2 style={{
            margin: '6px 0 0', fontFamily: 'var(--at-display)',
            fontSize: 28, fontWeight: 500, letterSpacing: '-.025em', lineHeight: 1.1,
          }}>
            Subastas en<br/>AutosTandil.
          </h2>
        </div>

        <p style={{ marginTop: 14, fontSize: 14, lineHeight: 1.55, color: 'var(--at-ink-2)' }}>
          Estamos preparando un nuevo formato para que puedas ofertar por unidades seleccionadas, en vivo y desde tu celular.
        </p>

        <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-start">
          {/* Notify card */}
          <div style={{ padding: '24px 0 8px' }}>
            <div style={{
              background: 'var(--at-ink)', color: '#fff',
              borderRadius: 18, padding: '28px 22px',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: -40, right: -40,
                width: 180, height: 180, borderRadius: 999,
                background: 'radial-gradient(circle, var(--at-accent), transparent 70%)',
                opacity: .35,
              }} />
              <div style={{ position: 'relative' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '4px 10px', borderRadius: 999,
                  background: 'rgba(255,255,255,.12)', color: '#fff',
                  fontSize: 10.5, fontWeight: 600, letterSpacing: '.08em',
                  textTransform: 'uppercase',
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--at-accent)' }}/>
                  En desarrollo
                </span>
                <div style={{
                  marginTop: 14, fontFamily: 'var(--at-display)',
                  fontSize: 22, fontWeight: 500, letterSpacing: '-.025em', lineHeight: 1.15,
                }}>
                  Avisame cuando<br/>lance subastas.
                </div>
                <p style={{ marginTop: 8, fontSize: 12.5, color: 'rgba(255,255,255,.7)', lineHeight: 1.5 }}>
                  Te escribimos por WhatsApp en cuanto esté disponible.
                </p>
                <a href={buildWhatsapp(null, 'auctions')} target="_blank" rel="noopener noreferrer"
                  style={{
                    marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '11px 16px', borderRadius: 999,
                    background: '#fff', color: 'var(--at-ink)',
                    fontWeight: 600, fontSize: 13, textDecoration: 'none',
                  }}>
                  <IconWhatsapp size={16} fill="currentColor"/>Avisame
                </a>
              </div>
            </div>
          </div>

          {/* How it works */}
          <div style={{ padding: '24px 0 4px' }}>
            <div style={{
              fontFamily: 'var(--at-mono)', fontSize: 10, letterSpacing: '.18em',
              textTransform: 'uppercase', color: 'var(--at-ink-3)', marginBottom: 4,
            }}>Mientras tanto</div>
            <h3 style={{ margin: '0 0 14px', fontFamily: 'var(--at-display)', fontSize: 20, fontWeight: 500, letterSpacing: '-.02em', color: 'var(--at-ink)' }}>
              Cómo va a funcionar
            </h3>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              {[
                { t: 'Unidades curadas', d: 'Solo autos seleccionados por AutosTandil entran a subasta.' },
                { t: 'Ofertas en vivo', d: 'Pujá desde tu celular durante una ventana acotada.' },
                { t: 'Cierre transparente', d: 'Te avisamos al instante si ganaste y coordinamos retiro.' },
              ].map((b, i) => (
                <li key={i} style={{
                  padding: '14px 0', borderBottom: i < 2 ? '1px solid var(--at-border)' : 'none',
                  display: 'flex', gap: 14, alignItems: 'flex-start',
                }}>
                  <span style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: 'var(--at-bg-2)', color: 'var(--at-accent)',
                    display: 'grid', placeItems: 'center', flexShrink: 0,
                    fontFamily: 'var(--at-mono)', fontSize: 11, fontWeight: 700,
                  }}>0{i+1}</span>
                  <div>
                    <div style={{ fontFamily: 'var(--at-display)', fontWeight: 600, fontSize: 14, letterSpacing: '-.01em' }}>{b.t}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--at-ink-2)', marginTop: 2, lineHeight: 1.45 }}>{b.d}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
