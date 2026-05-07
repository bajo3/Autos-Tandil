import { useNavigate } from 'react-router-dom';
import { CARS as MOCK_CARS, TYPES as FALLBACK_TYPES } from '../data/cars';
import { buildWhatsapp, fmtShort } from '../lib/utils';
import { ATLogo } from '../components/ATLogo';
import { CarCard } from '../components/CarCard';
import { SectionHeader } from '../components/SectionHeader';
import {
  IconSearch, IconCar, IconCheck, IconWhatsapp,
  IconLocation, IconShield, IconHandshake, IconArrowRight,
} from '../components/Icons';

const chipBtn = {
  padding: '8px 16px', borderRadius: 999,
  background: 'var(--at-surface)',
  border: '1px solid var(--at-border)',
  fontSize: 12.5, fontWeight: 500, color: 'var(--at-ink)',
  cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit',
  transition: 'border-color .15s, background .15s',
};

function CategoryIcon({ type }) {
  if (type === 'Auto') return <IconCar size={22} sw={1.6} />;
  if (type === 'Camioneta') return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 16h11l2-3h4v3M3 16v3h2m11-3v3h2"/>
      <circle cx="7" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/>
      <path d="M5 13h9V8H8z"/>
    </svg>
  );
  if (type === 'SUV') return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 17h18l-1-5a2 2 0 0 0-2-1.5h-4l-2-3H8L6 11H5a2 2 0 0 0-2 2z"/>
      <circle cx="7" cy="18" r="1.5"/><circle cx="17" cy="18" r="1.5"/>
    </svg>
  );
  if (type === 'Utilitario') return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18V7h11v11M14 12h5l2 3v3h-7"/>
      <circle cx="7" cy="18.5" r="1.5"/><circle cx="17" cy="18.5" r="1.5"/>
    </svg>
  );
  return <IconCar size={22} sw={1.6} />;
}

export default function Home({ favs, onFav, recents, cars = MOCK_CARS }) {
  const navigate = useNavigate();
  const types = [...new Set(cars.map(c => c.type).filter(Boolean))];
  const availableTypes = types.length ? types : FALLBACK_TYPES;
  const featured = cars.filter(c => c.badges.includes('destacado')).slice(0, 6);
  const fresh = cars.slice(0, 6);
  const recentCars = recents.map(id => cars.find(c => c.id === id)).filter(Boolean).slice(0, 6);
  const heroCar = featured[0] || cars[0] || MOCK_CARS[0];

  return (
    <div className="pb-[88px] md:pb-0">

      {/* ─── HERO ─── */}
      <section style={{ position: 'relative', background: 'var(--at-ink)', color: '#fff', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `linear-gradient(160deg, rgba(15,23,42,.72) 0%, rgba(15,23,42,.9) 60%, rgba(15,23,42,.98) 100%), url(${heroCar.thumbUrl.replace('w=800', 'w=1400')})`,
          backgroundSize: 'cover', backgroundPosition: 'center 40%',
        }} />

        {/* Mobile header (inside hero) */}
        <div className="flex md:hidden" style={{
          position: 'relative', zIndex: 10,
          padding: '14px 18px 0',
          alignItems: 'center', justifyContent: 'space-between',
        }}>
          <ATLogo size={22} dark />
          <button onClick={() => navigate('/vender')} style={{
            padding: '7px 14px', borderRadius: 999,
            background: 'rgba(255,255,255,.12)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,.2)',
            color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          }}>
            Vender mi auto
          </button>
        </div>

        {/* Hero content */}
        <div style={{ position: 'relative', maxWidth: '80rem', margin: '0 auto' }}>
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center lg:py-20 lg:px-8"
            style={{ padding: '28px 20px 32px' }}>

            {/* Left: text + search + stats */}
            <div>
              <div style={{
                fontFamily: 'var(--at-mono)', fontSize: 10, letterSpacing: '.2em',
                textTransform: 'uppercase', color: 'var(--at-accent-soft-fg)',
                marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{ display: 'inline-block', width: 24, height: 1, background: 'currentColor', opacity: .5 }}/>
                Tandil · Buenos Aires · Argentina
              </div>

              <h1 style={{
                fontFamily: 'var(--at-display)', fontWeight: 500,
                fontSize: 'clamp(36px, 4.5vw, 58px)', lineHeight: 0.95,
                letterSpacing: '-.04em', color: '#fff', margin: 0,
              }}>
                Autos seleccionados<br/>
                <span style={{ fontStyle: 'italic', fontWeight: 400 }}>en Tandil.</span>
              </h1>

              <p style={{
                marginTop: 18, fontSize: 14.5, lineHeight: 1.6,
                color: 'rgba(255,255,255,.72)', maxWidth: 400,
              }}>
                Comprá o vendé tu auto con AutosTandil. Unidades en consignación gestionadas con atención local y asesoramiento real.
              </p>

              {/* Search bar */}
              <div onClick={() => navigate('/catalogo')} style={{
                marginTop: 24, display: 'flex', alignItems: 'center', gap: 10,
                background: '#fff', color: 'var(--at-ink)',
                padding: '14px 18px', borderRadius: 999,
                boxShadow: '0 16px 40px -12px rgba(0,0,0,.4)', cursor: 'pointer',
                transition: 'box-shadow .2s',
              }}>
                <IconSearch size={18} sw={1.8} stroke="var(--at-ink-3)" />
                <span style={{ flex: 1, fontSize: 14, color: 'var(--at-ink-3)' }}>
                  Buscá marca, modelo, año…
                </span>
                <span style={{
                  padding: '7px 16px', borderRadius: 999,
                  background: 'var(--at-accent)', color: '#fff',
                  fontSize: 12, fontWeight: 700, letterSpacing: '.02em',
                }}>Buscar</span>
              </div>

              {/* Quick links */}
              <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[
                  { l: 'Automáticas', state: { trans: 'Automática' } },
                  { l: 'Hasta $20M', state: { maxPrice: 20000000 } },
                  { l: 'Nuevo ingreso', state: { badge: 'nuevo' } },
                ].map(q => (
                  <button key={q.l}
                    onClick={() => navigate('/catalogo', { state: q.state })}
                    style={{
                      padding: '6px 13px', borderRadius: 999,
                      background: 'rgba(255,255,255,.1)', backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255,255,255,.18)',
                      color: 'rgba(255,255,255,.85)', fontSize: 12, fontWeight: 500,
                      cursor: 'pointer', fontFamily: 'inherit',
                    }}>
                    {q.l}
                  </button>
                ))}
              </div>

              {/* Stats */}
              <div style={{
                marginTop: 28, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                borderTop: '1px solid rgba(255,255,255,.12)', paddingTop: 20,
              }}>
                {[
                  { v: cars.length + '+', l: 'Autos en stock' },
                  { v: '24h', l: 'Respuesta WA' },
                  { v: '100%', l: 'Local Tandil' },
                ].map((s, i) => (
                  <div key={i} style={{ borderLeft: i ? '1px solid rgba(255,255,255,.1)' : 'none', paddingLeft: i ? 16 : 0 }}>
                    <div style={{ fontFamily: 'var(--at-display)', fontSize: 26, fontWeight: 600, letterSpacing: '-.03em', lineHeight: 1 }}>{s.v}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: '.1em', marginTop: 4 }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: featured car card (desktop only) */}
            {featured[0] && (
              <div className="hidden lg:block">
                <div onClick={() => navigate(`/auto/${featured[0].id}`)} style={{
                  borderRadius: 20, overflow: 'hidden', cursor: 'pointer', position: 'relative',
                  boxShadow: '0 32px 80px -20px rgba(0,0,0,.6)',
                  border: '1px solid rgba(255,255,255,.1)',
                }}>
                  <img
                    src={featured[0].photoUrls[0]}
                    alt={`${featured[0].brand} ${featured[0].model}`}
                    style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }}
                  />
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    padding: '40px 20px 18px',
                    background: 'linear-gradient(transparent, rgba(15,23,42,.85))',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
                  }}>
                    <div>
                      <div style={{ fontFamily: 'var(--at-display)', fontSize: 18, fontWeight: 600, color: '#fff', letterSpacing: '-.02em' }}>
                        {featured[0].brand} {featured[0].model}
                      </div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,.65)', marginTop: 2 }}>
                        {featured[0].year} · {featured[0].version}
                      </div>
                    </div>
                    <div style={{
                      fontFamily: 'var(--at-display)', fontSize: 18, fontWeight: 700,
                      color: '#fff', letterSpacing: '-.02em',
                    }}>{fmtShort(featured[0].price)}</div>
                  </div>
                  <div style={{
                    position: 'absolute', top: 14, left: 14,
                    padding: '4px 10px', borderRadius: 999,
                    background: 'rgba(0,68,255,.85)', backdropFilter: 'blur(8px)',
                    fontSize: 10.5, fontWeight: 700, color: '#fff', letterSpacing: '.06em', textTransform: 'uppercase',
                  }}>Destacado</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── CATEGORIES ─── */}
      <section style={{ padding: '32px 0 8px' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 20px' }}>
          <SectionHeader eyebrow="Categorías" title="Buscá por tipo" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 16 }}>
            {availableTypes.map(t => (
              <button key={t}
                onClick={() => navigate('/catalogo', { state: { type: t } })}
                style={{
                  background: 'var(--at-surface)', border: '1px solid var(--at-border)',
                  borderRadius: 14, padding: '16px 8px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  cursor: 'pointer', color: 'var(--at-ink)', fontFamily: 'inherit',
                  transition: 'border-color .15s, box-shadow .15s, transform .15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--at-accent)';
                  e.currentTarget.style.boxShadow = '0 4px 16px -6px rgba(0,68,255,.2)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--at-border)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'none';
                }}>
                <span style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: 'var(--at-accent-soft)',
                  color: 'var(--at-accent)',
                  display: 'grid', placeItems: 'center',
                }}>
                  <CategoryIcon type={t} />
                </span>
                <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '-.01em' }}>{t === 'Auto' ? 'Autos' : t === 'SUV' ? 'SUVs' : t === 'Camioneta' ? 'Camionetas' : t === 'Utilitario' ? 'Utilitarios' : t}</span>
                <span style={{ fontSize: 10, color: 'var(--at-ink-3)', fontFamily: 'var(--at-mono)' }}>
                  {cars.filter(c => c.type === t).length} {cars.filter(c => c.type === t).length === 1 ? 'unidad' : 'unidades'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURED ─── */}
      <section style={{ padding: '32px 0 8px' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 20px' }}>
          <SectionHeader eyebrow="Destacados" title="Selección de la semana"
            action={{ label: 'Ver todos', onClick: () => navigate('/catalogo', { state: { badge: 'destacado' } }) }} />
        </div>
        {/* Mobile: horizontal scroll */}
        <div className="flex lg:hidden hide-scroll" style={{
          gap: 12, padding: '16px 20px 6px',
          overflowX: 'auto', scrollSnapType: 'x mandatory',
        }}>
          {featured.map(c => (
            <div key={c.id} style={{ flex: '0 0 260px', scrollSnapAlign: 'start' }}>
              <CarCard car={c} onOpen={() => navigate(`/auto/${c.id}`)} onFav={onFav} isFav={favs.includes(c.id)} />
            </div>
          ))}
        </div>
        {/* Desktop: grid */}
        <div className="hidden lg:grid lg:grid-cols-3" style={{
          gap: 18, maxWidth: '80rem', margin: '16px auto 0', padding: '0 20px',
        }}>
          {featured.slice(0, 3).map(c => (
            <CarCard key={c.id} car={c} onOpen={() => navigate(`/auto/${c.id}`)} onFav={onFav} isFav={favs.includes(c.id)} />
          ))}
        </div>
      </section>

      {/* ─── QUICK FILTERS ─── */}
      <section style={{ padding: '28px 0 8px' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 20px' }}>
          <SectionHeader eyebrow="Filtros rápidos" title="Atajos populares" />
          <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
            {[
              { l: 'Hasta $20M', state: { maxPrice: 20000000 } },
              { l: 'Automáticas', state: { trans: 'Automática' } },
              { l: 'Diésel', state: { fuel: 'Diésel' } },
              { l: 'Nuevo ingreso', state: { badge: 'nuevo' } },
              { l: 'Con financiación', state: { badge: 'financia' } },
              { l: 'Acepta permuta', state: { badge: 'permuta' } },
            ].map(q => (
              <button key={q.l}
                onClick={() => navigate('/catalogo', { state: q.state })}
                style={chipBtn}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--at-border-strong)'; e.currentTarget.style.background = 'var(--at-bg-2)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--at-border)'; e.currentTarget.style.background = 'var(--at-surface)'; }}>
                {q.l}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── RECENTS ─── */}
      {recentCars.length > 0 && (
        <section style={{ padding: '32px 0 8px' }}>
          <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 20px' }}>
            <SectionHeader eyebrow="Tu actividad" title="Vistos recientemente" />
          </div>
          <div className="hide-scroll" style={{
            display: 'flex', gap: 10, padding: '16px 20px 6px',
            overflowX: 'auto', scrollSnapType: 'x mandatory',
          }}>
            {recentCars.map(c => (
              <div key={c.id} onClick={() => navigate(`/auto/${c.id}`)} style={{
                flex: '0 0 160px', scrollSnapAlign: 'start',
                background: 'var(--at-surface)', borderRadius: 12,
                border: '1px solid var(--at-border)',
                overflow: 'hidden', cursor: 'pointer',
                transition: 'border-color .15s',
              }}>
                <div style={{ aspectRatio: '4/3', overflow: 'hidden' }}>
                  <img src={c.thumbUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '9px 11px 11px' }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, fontFamily: 'var(--at-display)', letterSpacing: '-.01em' }}>{c.brand} {c.model}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--at-ink)', marginTop: 3 }}>{fmtShort(c.price)}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─── LATEST ─── */}
      <section style={{ padding: '32px 0 8px' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 20px' }}>
          <SectionHeader eyebrow="Último ingreso" title="Recién publicados"
            action={{ label: 'Ver todos', onClick: () => navigate('/catalogo') }} />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" style={{ marginTop: 16 }}>
            {fresh.map(c => (
              <CarCard key={c.id} car={c} onOpen={() => navigate(`/auto/${c.id}`)} onFav={onFav} isFav={favs.includes(c.id)} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── VENDER + BENEFITS ─── */}
      <section style={{ padding: '40px 0 8px' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 20px' }}>
          <div className="lg:grid lg:grid-cols-2 lg:gap-14 lg:items-start">

            {/* Vender card */}
            <div>
              <SectionHeader eyebrow="¿Tenés un auto?" title="Vendé con AutosTandil" />
              <div style={{
                marginTop: 16, background: 'var(--at-surface)',
                border: '1px solid var(--at-border)', borderRadius: 20, overflow: 'hidden',
                boxShadow: '0 4px 20px -8px rgba(15,23,42,.08)',
              }}>
                <div style={{
                  padding: '22px 22px 6px',
                  background: 'linear-gradient(180deg, var(--at-bg-2) 0%, transparent 100%)',
                  borderBottom: '1px solid var(--at-border)',
                }}>
                  <div style={{
                    fontFamily: 'var(--at-mono)', fontSize: 10, letterSpacing: '.18em',
                    textTransform: 'uppercase', color: 'var(--at-accent)', fontWeight: 600, marginBottom: 6,
                  }}>Consignación · Sin costo inicial</div>
                  <h3 style={{
                    margin: '0 0 14px', fontFamily: 'var(--at-display)',
                    fontSize: 22, fontWeight: 600, letterSpacing: '-.025em', lineHeight: 1.1, color: 'var(--at-ink)',
                  }}>
                    Te ayudamos a vender<br/>sin perder tiempo.
                  </h3>
                </div>
                <ul style={{ margin: 0, padding: '0 22px', listStyle: 'none' }}>
                  {[
                    'Publicamos con presentación profesional',
                    'Recibimos y filtramos todas las consultas',
                    'Coordinamos visitas con interesados reales',
                    'Vos cerrás la venta, nosotros el proceso',
                  ].map((t, i) => (
                    <li key={i} style={{
                      display: 'flex', gap: 12, alignItems: 'flex-start',
                      padding: '11px 0', fontSize: 13.5, color: 'var(--at-ink-2)',
                      borderBottom: i < 3 ? '1px solid var(--at-border)' : 'none',
                    }}>
                      <span style={{
                        flexShrink: 0, width: 20, height: 20, borderRadius: 999,
                        background: 'var(--at-accent)', color: '#fff',
                        display: 'grid', placeItems: 'center', marginTop: 1,
                      }}><IconCheck size={11} sw={2.5} stroke="#fff"/></span>
                      {t}
                    </li>
                  ))}
                </ul>
                <div style={{ padding: '16px 22px 22px' }}>
                  <a href={buildWhatsapp(null, 'sell')} target="_blank" rel="noopener noreferrer"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                      padding: '14px 20px', borderRadius: 12,
                      background: '#25D366', color: '#fff',
                      fontWeight: 700, fontSize: 14.5, textDecoration: 'none',
                      boxShadow: '0 6px 20px -6px rgba(37,211,102,.5)',
                      letterSpacing: '-.01em',
                    }}>
                    <IconWhatsapp size={18} fill="#fff"/>Quiero vender mi auto
                  </a>
                  <div style={{ marginTop: 10, textAlign: 'center', fontSize: 11.5, color: 'var(--at-ink-3)' }}>
                    Sin costo inicial · Comisión solo al vender
                  </div>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div>
              <SectionHeader eyebrow="Por qué AutosTandil" title="Una mejor forma de comprar" />
              <div style={{ display: 'grid', gap: 1, marginTop: 16, background: 'var(--at-border)', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--at-border)' }}>
                {[
                  { i: <IconLocation size={20} sw={1.6} />, t: 'Stock 100% local', d: 'Solo autos disponibles en Tandil, sin intermediarios.' },
                  { i: <IconWhatsapp size={20} fill="currentColor" />, t: 'Consulta directa por WhatsApp', d: 'Respondemos rápido y sin formularios complicados.' },
                  { i: <IconShield size={20} sw={1.6} />, t: 'Unidades seleccionadas', d: 'Cada auto pasa por nuestra revisión antes de publicarse.' },
                  { i: <IconHandshake size={20} sw={1.6} />, t: 'Vendemos por consignación', d: 'Te acompañamos en todo el proceso hasta cerrar la venta.' },
                ].map((b, i) => (
                  <div key={i} style={{
                    background: 'var(--at-surface)', padding: '18px 18px',
                    display: 'flex', gap: 14, alignItems: 'flex-start',
                  }}>
                    <span style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: 'var(--at-accent-soft)', color: 'var(--at-accent)',
                      display: 'grid', placeItems: 'center', flexShrink: 0,
                    }}>{b.i}</span>
                    <div>
                      <div style={{ fontFamily: 'var(--at-display)', fontWeight: 600, fontSize: 14.5, letterSpacing: '-.01em', color: 'var(--at-ink)' }}>{b.t}</div>
                      <div style={{ fontSize: 12.5, color: 'var(--at-ink-2)', marginTop: 3, lineHeight: 1.45 }}>{b.d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ─── */}
      <section style={{ padding: '40px 0 12px' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 20px' }}>
          <div style={{
            background: 'var(--at-ink)', color: '#fff', borderRadius: 20, padding: '36px 32px',
            backgroundImage: 'radial-gradient(140% 90% at 110% -10%, rgba(0,68,255,.3), transparent 55%)',
            display: 'flex', flexDirection: 'column', gap: 0,
          }}>
            <div style={{
              fontFamily: 'var(--at-mono)', fontSize: 10, letterSpacing: '.2em',
              textTransform: 'uppercase', color: 'var(--at-accent-soft-fg)', opacity: .85,
            }}>¿Listo para empezar?</div>
            <h3 style={{
              margin: '10px 0 0', fontFamily: 'var(--at-display)',
              fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 500, letterSpacing: '-.03em', lineHeight: 1.05,
            }}>
              Encontrá tu próximo auto<br/>
              <span style={{ fontStyle: 'italic', fontWeight: 400 }}>sin vueltas, en Tandil.</span>
            </h3>
            <div style={{ marginTop: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/catalogo')} style={{
                padding: '13px 22px',
                background: '#fff', color: 'var(--at-ink)',
                border: 'none', borderRadius: 999,
                fontWeight: 700, fontSize: 14, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'inherit',
                letterSpacing: '-.01em',
              }}>
                Ver el catálogo <IconArrowRight size={15} sw={2.2} />
              </button>
              <a href={buildWhatsapp(null, 'contact')} target="_blank" rel="noopener noreferrer" style={{
                padding: '13px 22px', borderRadius: 999,
                background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)',
                color: '#fff', fontWeight: 600, fontSize: 14, textDecoration: 'none',
                display: 'inline-flex', alignItems: 'center', gap: 8,
                backdropFilter: 'blur(8px)',
                letterSpacing: '-.01em',
              }}>
                <IconWhatsapp size={16} fill="#fff" />Consultar por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{ padding: '40px 20px 36px', textAlign: 'center', borderTop: '1px solid var(--at-border)', marginTop: 12 }}>
        <ATLogo size={22} color="var(--at-ink)" />
        <div style={{ marginTop: 12, fontSize: 11.5, color: 'var(--at-ink-3)', lineHeight: 1.7 }}>
          AutosTandil · Compra, venta y consignación de autos en Tandil, Buenos Aires<br/>
          © 2026 · Todos los derechos reservados
        </div>
      </footer>
    </div>
  );
}
