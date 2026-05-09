import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { CARS as MOCK_CARS, TYPES as FALLBACK_TYPES } from '../data/cars';
import { buildWhatsapp, fmtShort } from '../lib/utils';
import { ATLogo } from '../components/ATLogo';
import { CarCard } from '../components/CarCard';
import { SectionHeader } from '../components/SectionHeader';
import {
  IconSearch, IconCar, IconCheck, IconWhatsapp, IconChevron,
  IconLocation, IconShield, IconHandshake,
} from '../components/Icons';

const chipBtn = {
  padding: '8px 14px', borderRadius: 999,
  background: 'var(--at-surface)',
  border: '1px solid var(--at-border)',
  fontSize: 12, fontWeight: 500, color: 'var(--at-ink)',
  cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit',
};

function CategoryIcon({ type }) {
  if (type === 'Auto') return <IconCar size={20} sw={1.6} />;
  if (type === 'Camioneta') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 16h11l2-3h4v3M3 16v3h2m11-3v3h2"/>
      <circle cx="7" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/>
      <path d="M5 13h9V8H8z"/>
    </svg>
  );
  if (type === 'SUV') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 17h18l-1-5a2 2 0 0 0-2-1.5h-4l-2-3H8L6 11H5a2 2 0 0 0-2 2z"/>
      <circle cx="7" cy="18" r="1.5"/><circle cx="17" cy="18" r="1.5"/>
    </svg>
  );
  if (type === 'Utilitario') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18V7h11v11M14 12h5l2 3v3h-7"/>
      <circle cx="7" cy="18.5" r="1.5"/><circle cx="17" cy="18.5" r="1.5"/>
    </svg>
  );
  return <IconCar size={20} sw={1.6} />;
}

export default function Home({ favs, onFav, recents, cars = MOCK_CARS }) {
  const navigate = useNavigate();
  const [heroSearch, setHeroSearch] = useState('');
  const types = [...new Set(cars.map(c => c.type).filter(Boolean))];
  const availableTypes = types.length ? types : FALLBACK_TYPES;
  const featured = cars.filter(c => c.badges.includes('destacado')).slice(0, 6);
  const fresh = cars.slice(0, 6);
  const recentCars = recents.map(id => cars.find(c => c.id === id)).filter(Boolean).slice(0, 6);
  const heroCar = featured[0] || cars[0] || MOCK_CARS[0];

  return (
    <div className="pb-[88px] md:pb-0">
      {/* HERO */}
      <section style={{ position: 'relative', background: 'var(--at-ink)', color: '#fff', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `linear-gradient(180deg, rgba(15,23,42,.6) 0%, rgba(15,23,42,.88) 75%, var(--at-ink) 100%), url(${heroCar.thumbUrl.replace('w=800', 'w=1400')})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
        }} />

        {/* Mobile-only hero header (desktop uses DesktopNav) */}
        <div className="md:hidden" style={{
          position: 'relative', zIndex: 10,
          padding: '14px 16px 0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          minHeight: 52,
        }}>
          <ATLogo size={22} dark />
          <button
            onClick={() => navigate('/vender')}
            style={{
              padding: '7px 14px', borderRadius: 999,
              background: 'rgba(255,255,255,.15)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,.25)',
              color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'inherit',
            }}>
            Vender mi auto
          </button>
        </div>

        {/* Hero content — 1 col mobile, 2 col desktop */}
        <div style={{ position: 'relative', maxWidth: '80rem', margin: '0 auto' }}>
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center lg:py-16 lg:px-8"
            style={{ padding: '24px 20px 26px' }}>

            {/* Left: text + search + stats */}
            <div>
              <div style={{
                fontFamily: 'var(--at-mono)',
                fontSize: 10.5, letterSpacing: '.18em', textTransform: 'uppercase',
                color: 'var(--at-accent-soft-fg)', opacity: .85, marginBottom: 14,
              }}>
                <span style={{
                  display: 'inline-block', width: 18, height: 1,
                  background: 'currentColor', verticalAlign: 'middle',
                  marginRight: 8, opacity: .6,
                }}/>
                Tandil · Buenos Aires
              </div>
              <h1 style={{
                fontFamily: 'var(--at-display)', fontWeight: 500,
                fontSize: 'clamp(34px, 4vw, 52px)', lineHeight: 0.96,
                letterSpacing: '-.035em', color: '#fff', margin: 0, textWrap: 'balance',
              }}>
                Compra, venta<br/>y consignación<br/>
                <span style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--at-accent-soft-fg)' }}>en Tandil.</span>
              </h1>
              <p style={{
                marginTop: 16, marginBottom: 0,
                fontSize: 14, lineHeight: 1.55,
                color: 'rgba(255,255,255,.78)', maxWidth: 360,
              }}>
                Una agencia automotor con stock seleccionado. Encontrá tu próximo auto o vendé el tuyo por consignación, todo gestionado por AutosTandil.
              </p>

              {/* SEARCH */}
              <form
                onSubmit={event => {
                  event.preventDefault();
                  navigate('/catalogo', { state: heroSearch.trim() ? { q: heroSearch.trim() } : {} });
                }}
                style={{
                  marginTop: 22, display: 'flex', alignItems: 'center', gap: 10,
                  background: '#fff', color: 'var(--at-ink)',
                  padding: '13px 16px', borderRadius: 999,
                  boxShadow: '0 12px 30px -10px rgba(0,0,0,.35)',
                }}>
                <IconSearch size={18} sw={1.8} stroke="var(--at-ink-2)" />
                <input
                  value={heroSearch}
                  onChange={event => setHeroSearch(event.target.value)}
                  placeholder="Buscar marca, modelo o año"
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    fontSize: 13.5,
                    color: 'var(--at-ink)',
                    minWidth: 0,
                  }}
                />
                <button type="submit" style={{
                  padding: '5px 12px', borderRadius: 999,
                  background: 'var(--at-accent)', color: '#fff',
                  fontSize: 11.5, fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}>Buscar</button>
              </form>

              {/* stats */}
              <div style={{
                marginTop: 22, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                borderTop: '1px solid rgba(255,255,255,.16)', paddingTop: 16,
              }}>
                {[
                  { v: cars.length + '+', l: 'autos' },
                  { v: '24/7', l: 'WhatsApp' },
                  { v: '100%', l: 'Tandil' },
                ].map((s, i) => (
                  <div key={i} style={{ borderLeft: i ? '1px solid rgba(255,255,255,.14)' : 'none', paddingLeft: i ? 14 : 0 }}>
                    <div style={{ fontFamily: 'var(--at-display)', fontSize: 22, fontWeight: 600, letterSpacing: '-.02em' }}>{s.v}</div>
                    <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,.6)', textTransform: 'uppercase', letterSpacing: '.1em', marginTop: 2 }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: featured car image (desktop only) */}
            {featured[0] && (
              <div className="hidden lg:block">
                <div onClick={() => navigate(`/auto/${featured[0].id}`)}
                  style={{
                    borderRadius: 18, overflow: 'hidden',
                    cursor: 'pointer', position: 'relative',
                    boxShadow: '0 24px 60px -16px rgba(0,0,0,.5)',
                  }}>
                  <img
                    src={featured[0].photoUrls[0]}
                    alt={`${featured[0].brand} ${featured[0].model}`}
                    style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }}
                  />
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    padding: '32px 20px 16px',
                    background: 'linear-gradient(transparent, rgba(15,23,42,.75))',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
                  }}>
                    <div>
                      <div style={{ fontFamily: 'var(--at-display)', fontSize: 17, fontWeight: 600, color: '#fff', letterSpacing: '-.01em' }}>
                        {featured[0].brand} {featured[0].model}
                      </div>
                      <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,.7)', marginTop: 2 }}>
                        {featured[0].year} · {featured[0].version}
                      </div>
                    </div>
                    <div style={{
                      fontFamily: 'var(--at-display)', fontSize: 16, fontWeight: 700,
                      color: '#fff', letterSpacing: '-.02em',
                    }}>{fmtShort(featured[0].price)}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section style={{ padding: '28px 0 8px' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 20px' }}>
          <SectionHeader eyebrow="Categorías" title="Buscá por tipo" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 14 }}>
            {availableTypes.map(t => (
              <button key={t} onClick={() => navigate('/catalogo', { state: { type: t } })}
                style={{
                  background: 'var(--at-surface)', border: '1px solid var(--at-border)',
                  borderRadius: 12, padding: '12px 6px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  cursor: 'pointer', color: 'var(--at-ink)', fontFamily: 'inherit',
                }}>
                <span style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'var(--at-bg-2)',
                  display: 'grid', placeItems: 'center',
                }}>
                  <CategoryIcon type={t} />
                </span>
                <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '-.005em' }}>{t}s</span>
                <span style={{ fontSize: 9.5, color: 'var(--at-ink-3)' }}>
                  {cars.filter(c => c.type === t).length}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED */}
      <section style={{ padding: '28px 0 8px' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 20px' }}>
          <SectionHeader eyebrow="Destacados" title="Selección de la semana"
            action={{ label: 'Ver todos', onClick: () => navigate('/catalogo', { state: { badge: 'destacado' } }) }} />
        </div>
        {/* Mobile: horizontal scroll */}
        <div className="lg:hidden" style={{
          display: 'flex', gap: 12, padding: '14px 20px 4px',
          overflowX: 'auto', scrollSnapType: 'x mandatory',
        }} >
          {featured.map(c => (
            <div key={c.id} style={{ flex: '0 0 240px', scrollSnapAlign: 'start' }}>
              <CarCard car={c} onOpen={() => navigate(`/auto/${c.id}`)}
                onFav={onFav} isFav={favs.includes(c.id)} />
            </div>
          ))}
        </div>
        {/* Desktop: grid */}
        <div className="hidden lg:grid lg:grid-cols-3" style={{
          gap: 16, maxWidth: '80rem', margin: '14px auto 0', padding: '0 20px',
        }}>
          {featured.slice(0, 3).map(c => (
            <CarCard key={c.id} car={c} onOpen={() => navigate(`/auto/${c.id}`)}
              onFav={onFav} isFav={favs.includes(c.id)} />
          ))}
        </div>
      </section>

      {/* QUICK FILTERS */}
      <section style={{ padding: '24px 0 8px' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 20px' }}>
          <SectionHeader eyebrow="Filtros rápidos" title="Atajos populares" />
          <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
            {[
              { l: 'Hasta $20M', state: { maxPrice: 20000000 } },
              { l: 'Automáticas', state: { trans: 'Automática' } },
              { l: 'Diésel', state: { fuel: 'Diésel' } },
              { l: 'Nuevo ingreso', state: { badge: 'nuevo' } },
              { l: 'Con financiación', state: { badge: 'financia' } },
              { l: 'Acepta permuta', state: { badge: 'permuta' } },
            ].map(q => (
              <button key={q.l} onClick={() => navigate('/catalogo', { state: q.state })} style={chipBtn}>
                {q.l}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* RECENTS */}
      {recentCars.length > 0 && (
        <section style={{ padding: '28px 0 8px' }}>
          <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 20px' }}>
            <SectionHeader eyebrow="Tu actividad" title="Vistos recientemente" />
          </div>
          <div style={{
            display: 'flex', gap: 10, padding: '14px 20px 4px',
            overflowX: 'auto', scrollSnapType: 'x mandatory',
          }} className="hide-scroll">
            {recentCars.map(c => (
              <div key={c.id} onClick={() => navigate(`/auto/${c.id}`)}
                style={{
                  flex: '0 0 150px', scrollSnapAlign: 'start',
                  background: 'var(--at-surface)', borderRadius: 10,
                  border: '1px solid var(--at-border)',
                  overflow: 'hidden', cursor: 'pointer',
                }}>
                <div style={{ aspectRatio: '4/3', overflow: 'hidden' }}>
                  <img src={c.thumbUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '8px 10px 10px' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, fontFamily: 'var(--at-display)' }}>{c.brand} {c.model}</div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--at-ink)', marginTop: 2 }}>{fmtShort(c.price)}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* LATEST */}
      <section style={{ padding: '28px 0 8px' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 20px' }}>
          <SectionHeader eyebrow="Último ingreso" title="Recién publicados"
            action={{ label: 'Ver todos', onClick: () => navigate('/catalogo') }} />
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3" style={{ marginTop: 14 }}>
            {fresh.map(c => (
              <CarCard key={c.id} car={c} onOpen={() => navigate(`/auto/${c.id}`)}
                onFav={onFav} isFav={favs.includes(c.id)} />
            ))}
          </div>
        </div>
      </section>

      {/* VENDER */}
      <section style={{ padding: '32px 0 8px' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 20px' }}>
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-start">
            <div>
              <SectionHeader eyebrow="¿Tenés un auto?" title="Vendé con AutosTandil" />
              <div style={{
                marginTop: 14, background: 'var(--at-surface)',
                border: '1px solid var(--at-border)', borderRadius: 18, overflow: 'hidden',
              }}>
                <div style={{ padding: '20px 20px 4px', background: 'linear-gradient(180deg, var(--at-bg-2), transparent)' }}>
                  <div style={{
                    fontFamily: 'var(--at-mono)', fontSize: 10, letterSpacing: '.16em',
                    textTransform: 'uppercase', color: 'var(--at-accent)', fontWeight: 600,
                  }}>Consignación</div>
                  <h3 style={{
                    margin: '6px 0 10px', fontFamily: 'var(--at-display)',
                    fontSize: 20, fontWeight: 600, letterSpacing: '-.02em', lineHeight: 1.15,
                  }}>
                    Te ayudamos a vender<br/>sin perder tiempo.
                  </h3>
                </div>
                <ul style={{ margin: 0, padding: '0 20px 4px', listStyle: 'none' }}>
                  {[
                    'Publicamos tu auto con presentación profesional',
                    'Recibimos y filtramos consultas',
                    'Coordinamos visitas con interesados',
                    'Todo se gestiona desde AutosTandil',
                  ].map((t, i) => (
                    <li key={i} style={{
                      display: 'flex', gap: 10, alignItems: 'flex-start',
                      padding: '9px 0', fontSize: 13, color: 'var(--at-ink-2)',
                      borderBottom: i < 3 ? '1px solid var(--at-border)' : 'none',
                    }}>
                      <span style={{
                        flexShrink: 0, width: 18, height: 18, borderRadius: 999,
                        background: 'var(--at-accent)', color: '#fff',
                        display: 'grid', placeItems: 'center', marginTop: 1,
                      }}><IconCheck size={11} sw={2.4} stroke="#fff"/></span>
                      {t}
                    </li>
                  ))}
                </ul>
                <div style={{ padding: '14px 20px 20px' }}>
                  <a href={buildWhatsapp(null, 'sell')} target="_blank" rel="noopener noreferrer"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      padding: '13px 18px', borderRadius: 12,
                      background: 'var(--at-ink)', color: '#fff',
                      fontWeight: 600, fontSize: 14, textDecoration: 'none',
                      letterSpacing: '-.005em',
                    }}>
                    <IconWhatsapp size={17} fill="#fff"/>Quiero vender mi auto
                  </a>
                </div>
              </div>
            </div>

            {/* BENEFITS */}
            <div>
              <SectionHeader eyebrow="Por qué AutosTandil" title="Una mejor forma de comprar" />
              <div style={{ display: 'grid', gap: 1, marginTop: 14, background: 'var(--at-border)', borderRadius: 14, overflow: 'hidden', border: '1px solid var(--at-border)' }}>
                {[
                  { i: <IconLocation size={18} sw={1.6} />, t: 'Stock 100% local', d: 'Solo autos que están en Tandil.' },
                  { i: <IconWhatsapp size={18} fill="currentColor" />, t: 'Consulta directa', d: 'Atendemos por WhatsApp en un toque.' },
                  { i: <IconShield size={18} sw={1.6} />, t: 'Unidades seleccionadas', d: 'Cada auto pasa por nuestra revisión.' },
                  { i: <IconHandshake size={18} sw={1.6} />, t: 'Vendemos por consignación', d: 'Te acompañamos hasta cerrar la venta.' },
                ].map((b, i) => (
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
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '32px 0 8px' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 20px' }}>
          <div style={{
            background: 'var(--at-ink)', color: '#fff', borderRadius: 18, padding: '32px 28px',
            backgroundImage: 'radial-gradient(120% 80% at 100% 0%, rgba(255,255,255,.08), transparent 60%)',
          }}>
            <div style={{
              fontFamily: 'var(--at-mono)', fontSize: 10, letterSpacing: '.18em',
              textTransform: 'uppercase', color: 'var(--at-accent-soft-fg)', opacity: .9,
            }}>¿Listo para empezar?</div>
            <h3 style={{
              margin: '8px 0 0', fontFamily: 'var(--at-display)',
              fontSize: 28, fontWeight: 500, letterSpacing: '-.025em', lineHeight: 1.05,
            }}>
              Encontrá tu próximo<br/>auto en Tandil.
            </h3>
            <button onClick={() => navigate('/catalogo')}
              style={{
                marginTop: 16, padding: '12px 18px',
                background: '#fff', color: 'var(--at-ink)',
                border: 'none', borderRadius: 999,
                fontWeight: 600, fontSize: 13.5, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 8,
                fontFamily: 'inherit',
              }}>
              Ver el catálogo <IconChevron size={14} sw={2.2} />
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '36px 20px 32px', textAlign: 'center' }}>
        <ATLogo size={20} color="var(--at-ink)" />
        <div style={{ marginTop: 10, fontSize: 11, color: 'var(--at-ink-3)', lineHeight: 1.6 }}>
          AutosTandil · Compra, venta y consignación de autos en Tandil<br/>
          © 2026 · Todos los derechos reservados
        </div>
      </footer>
    </div>
  );
}
