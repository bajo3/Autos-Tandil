/* eslint-disable react-hooks/static-components */
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CARS as MOCK_CARS } from '../data/cars';
import { buildWhatsapp, fmtPrice, fmtKm } from '../lib/utils';
import { hdrBtn } from '../components/AppHeader';
import { Badge } from '../components/Badge';
import { CarCard } from '../components/CarCard';
import { FinanceCalc } from '../components/FinanceCalc';
import { SectionHeader } from '../components/SectionHeader';
import {
  IconHeart, IconWhatsapp, IconBack,
  IconGauge, IconCalendar, IconFuel, IconGear, IconCalc, IconLocation,
  IconShield, IconCheck,
} from '../components/Icons';

const TrustPill = ({ icon, label }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 5,
    padding: '5px 10px', borderRadius: 999,
    background: 'var(--at-bg-2)', border: '1px solid var(--at-border)',
    fontSize: 11, fontWeight: 500, color: 'var(--at-ink-2)',
    whiteSpace: 'nowrap',
  }}>
    {icon}
    {label}
  </span>
);

export default function Detalle({ favs, onFav, cars = MOCK_CARS }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const car = cars.find(c => c.id === id);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [showCalc, setShowCalc] = useState(false);

  if (!car) {
    return (
      <div style={{ padding: 40, textAlign: 'center', fontFamily: 'var(--at-display)', color: 'var(--at-ink-2)' }}>
        Auto no encontrado
        <br />
        <button onClick={() => navigate('/catalogo')}
          style={{ marginTop: 16, padding: '10px 20px', borderRadius: 999, background: 'var(--at-ink)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
          Ver catálogo
        </button>
      </div>
    );
  }

  const isFav = favs.includes(car.id);
  const otherCars = cars.filter(c => c.type === car.type && c.id !== car.id).slice(0, 4);
  const photoCount = car.photoUrls.length;

  const Gallery = ({ desktop = false }) => (
    <div style={{ background: 'var(--at-bg-2)', position: 'relative' }}>
      {/* floating controls — mobile only */}
      {!desktop && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
          padding: '52px 14px 8px',
          display: 'flex', justifyContent: 'space-between', pointerEvents: 'none',
        }}>
          <button onClick={() => navigate(-1)} aria-label="Volver"
            style={{ ...hdrBtn(true), pointerEvents: 'auto' }}>
            <IconBack size={18} stroke="var(--at-ink)" />
          </button>
          <button onClick={() => onFav(car.id)} aria-label="Favorito"
            style={{ ...hdrBtn(true), pointerEvents: 'auto', color: isFav ? '#e11d48' : 'var(--at-ink)' }}>
            <IconHeart size={18} sw={1.8} filled={isFav} stroke={isFav ? '#e11d48' : 'currentColor'} />
          </button>
        </div>
      )}

      {/* Main image */}
      <div style={{ aspectRatio: desktop ? '16/10' : '4/3', overflow: 'hidden', position: 'relative' }}>
        <img
          src={car.photoUrls[photoIdx]}
          alt={`${car.brand} ${car.model}`}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'opacity .2s' }}
        />
        {/* Photo counter */}
        {photoCount > 1 && (
          <div style={{
            position: 'absolute', bottom: 10, right: 10,
            padding: '4px 9px', borderRadius: 6,
            background: 'rgba(15,23,42,.72)', color: '#fff',
            fontSize: 11, fontWeight: 600, letterSpacing: '.04em',
            backdropFilter: 'blur(8px)',
          }}>
            {photoIdx + 1} / {photoCount}
          </div>
        )}
        {/* Arrow buttons — desktop */}
        {desktop && photoCount > 1 && (
          <>
            <button
              onClick={() => setPhotoIdx(i => (i - 1 + photoCount) % photoCount)}
              aria-label="Foto anterior"
              style={{
                position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
                width: 36, height: 36, borderRadius: 999, border: 'none',
                background: 'rgba(255,255,255,.88)', backdropFilter: 'blur(8px)',
                display: 'grid', placeItems: 'center', cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,.12)',
              }}>
              <IconBack size={14} stroke="var(--at-ink)" />
            </button>
            <button
              onClick={() => setPhotoIdx(i => (i + 1) % photoCount)}
              aria-label="Foto siguiente"
              style={{
                position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                width: 36, height: 36, borderRadius: 999, border: 'none',
                background: 'rgba(255,255,255,.88)', backdropFilter: 'blur(8px)',
                display: 'grid', placeItems: 'center', cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,.12)',
              }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--at-ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {photoCount > 1 && (
        <div style={{ display: 'flex', gap: 6, padding: '8px 12px 10px', overflowX: 'auto' }} className="hide-scroll">
          {car.photoUrls.map((url, i) => (
            <button key={i} onClick={() => setPhotoIdx(i)}
              style={{
                flex: `0 0 ${desktop ? 72 : 60}px`,
                height: desktop ? 52 : 44,
                borderRadius: 9, overflow: 'hidden',
                border: '2px solid',
                borderColor: i === photoIdx ? 'var(--at-accent)' : 'transparent',
                outline: i === photoIdx ? '0' : 'none',
                padding: 0, cursor: 'pointer',
                opacity: i === photoIdx ? 1 : 0.65,
                transition: 'opacity .15s, border-color .15s',
              }}>
              <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const InfoPanel = ({ desktop = false }) => (
    <div>
      {/* Badges + meta */}
      <div style={{ padding: desktop ? '0 0 4px' : '20px 20px 4px' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
          {car.badges.map(b => <Badge key={b} kind={b} />)}
        </div>
        <div style={{
          fontFamily: 'var(--at-mono)', fontSize: 10, letterSpacing: '.14em',
          textTransform: 'uppercase', color: 'var(--at-ink-3)',
        }}>{car.year} · {car.type} · {car.body}</div>
        <h1 style={{
          margin: '6px 0 4px', fontFamily: 'var(--at-display)',
          fontSize: desktop ? 30 : 26, fontWeight: 500, letterSpacing: '-.025em',
          lineHeight: 1.05, color: 'var(--at-ink)',
        }}>
          {car.brand} {car.model}
        </h1>
        <div style={{ fontSize: 13, color: 'var(--at-ink-2)', marginTop: 2 }}>{car.version}</div>

        {/* Price */}
        <div style={{ marginTop: 16, paddingBottom: 14, borderBottom: '1px solid var(--at-border)' }}>
          <div style={{
            fontFamily: 'var(--at-display)', fontSize: desktop ? 34 : 30, fontWeight: 700,
            letterSpacing: '-.03em', color: 'var(--at-ink)', lineHeight: 1,
          }}>{fmtPrice(car.price)}</div>
          {car.badges.includes('financia') && (
            <button onClick={() => setShowCalc(true)} style={{
              marginTop: 8, padding: '5px 10px', borderRadius: 999,
              border: '1px solid var(--at-border)',
              background: 'var(--at-surface)', fontSize: 11, fontWeight: 600,
              color: 'var(--at-ink)', cursor: 'pointer', display: 'inline-flex',
              alignItems: 'center', gap: 4, fontFamily: 'inherit',
            }}>
              <IconCalc size={11} sw={1.8}/>Calcular cuotas
            </button>
          )}
        </div>

        {/* Trust pills */}
        <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <TrustPill icon={<IconShield size={10} sw={2}/>} label="Unidad verificada" />
          <TrustPill icon={<IconLocation size={10} sw={2}/>} label="Disponible en Tandil" />
          <TrustPill icon={<IconCheck size={10} sw={2.5}/>} label="Sin cargo de gestión" />
        </div>
      </div>

      {/* Quick specs */}
      <div style={{ padding: desktop ? '12px 0 4px' : '12px 20px 4px' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1,
          background: 'var(--at-border)', borderRadius: 12, overflow: 'hidden',
          border: '1px solid var(--at-border)',
        }}>
          {[
            { i: <IconGauge size={16} sw={1.8}/>, l: 'Kilómetros', v: fmtKm(car.km) },
            { i: <IconCalendar size={16} sw={1.8}/>, l: 'Año', v: car.year },
            { i: <IconFuel size={16} sw={1.8}/>, l: 'Combustible', v: car.fuel },
            { i: <IconGear size={16} sw={1.8}/>, l: 'Transmisión', v: car.trans },
          ].map((s, i) => (
            <div key={i} style={{
              background: 'var(--at-surface)', padding: '12px 14px',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ color: 'var(--at-ink-3)', flexShrink: 0 }}>{s.i}</span>
              <div>
                <div style={{ fontSize: 9.5, color: 'var(--at-ink-3)', textTransform: 'uppercase', letterSpacing: '.1em' }}>{s.l}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--at-ink)', marginTop: 1 }}>{s.v}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Description */}
      {car.desc && (
        <div style={{ padding: desktop ? '16px 0 4px' : '20px 20px 4px' }}>
          <SectionHeader eyebrow="Descripción" title="Sobre este auto" />
          <p style={{ margin: '12px 0 0', fontSize: 14, lineHeight: 1.65, color: 'var(--at-ink-2)' }}>
            {car.desc}
          </p>
        </div>
      )}

      {/* Tech sheet */}
      <div style={{ padding: desktop ? '16px 0 4px' : '20px 20px 4px' }}>
        <SectionHeader eyebrow="Ficha técnica" title="Detalles" />
        <dl style={{ margin: '12px 0 0', padding: 0 }}>
          {[
            ['Marca', car.brand], ['Modelo', car.model], ['Versión', car.version],
            ['Año', car.year], ['Kilómetros', fmtKm(car.km)],
            ['Combustible', car.fuel], ['Transmisión', car.trans],
            ['Motor', car.engine], ['Color', car.color],
            ['Tipo', car.type], ['Carrocería', car.body],
          ].filter(([, v]) => v).map(([k, v]) => (
            <div key={k} style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '10px 0', borderBottom: '1px solid var(--at-border)',
              fontSize: 13,
            }}>
              <dt style={{ color: 'var(--at-ink-3)', margin: 0 }}>{k}</dt>
              <dd style={{ color: 'var(--at-ink)', fontWeight: 500, margin: 0, textAlign: 'right', maxWidth: '60%' }}>{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* AutosTandil trust block */}
      <div style={{ padding: desktop ? '16px 0 4px' : '20px 20px 4px' }}>
        <div style={{
          background: 'var(--at-surface)', border: '1px solid var(--at-border)',
          borderRadius: 14, padding: '14px 16px',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12,
          }}>
            <span style={{
              width: 42, height: 42, borderRadius: 10,
              background: '#fff', border: '1px solid var(--at-border)',
              display: 'grid', placeItems: 'center', flexShrink: 0, padding: 5,
            }}>
              <img src="/logo-autostandil-mark.png" alt="AutosTandil"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </span>
            <div>
              <div style={{ fontFamily: 'var(--at-display)', fontWeight: 600, fontSize: 13.5, letterSpacing: '-.01em', lineHeight: 1.2 }}>
                Gestionado por AutosTandil
              </div>
              <div style={{ fontSize: 11, color: 'var(--at-ink-3)', marginTop: 2 }}>
                Consulta centralizada · Tandil, Buenos Aires
              </div>
            </div>
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              'Te pasamos más fotos si necesitás',
              'Coordinamos visita a la unidad',
              'Te asesoramos con financiación',
            ].map((t, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--at-ink-2)' }}>
                <span style={{
                  width: 16, height: 16, borderRadius: 999,
                  background: 'var(--at-accent-soft)', flexShrink: 0,
                  display: 'grid', placeItems: 'center',
                }}>
                  <IconCheck size={9} sw={2.5} stroke="var(--at-accent)" />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Desktop CTA */}
      {desktop && (
        <div style={{ padding: '18px 0 0' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <button onClick={() => onFav(car.id)} aria-label="Favorito" style={{
              width: 52, height: 52, borderRadius: 12,
              background: 'var(--at-bg-2)', border: '1px solid var(--at-border)',
              display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0,
              transition: 'background .15s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--at-border)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--at-bg-2)'}>
              <IconHeart size={20} sw={1.8} filled={isFav} stroke={isFav ? '#e11d48' : 'var(--at-ink)'} />
            </button>
            <a data-testid="whatsapp-cta" href={buildWhatsapp(car)} target="_blank" rel="noopener noreferrer"
              style={{
                flex: 1, height: 52, borderRadius: 12,
                background: '#25D366', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontWeight: 700, fontSize: 15, textDecoration: 'none',
                letterSpacing: '-.01em',
                boxShadow: '0 6px 20px -6px rgba(37,211,102,.55)',
                transition: 'opacity .15s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '.88'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
              <IconWhatsapp size={20} fill="#fff"/>Consultar por WhatsApp
            </a>
          </div>
          <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--at-ink-3)' }}>
            Respondemos por WhatsApp · Atención personalizada
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="pb-[110px] lg:pb-0" style={{ background: 'var(--at-bg)' }}>

      {/* ── MOBILE layout (single column) ── */}
      <div className="lg:hidden">
        <Gallery />
        <InfoPanel />

        {/* Similar cars */}
        {otherCars.length > 0 && (
          <div style={{ padding: '24px 0 4px' }}>
            <div style={{ padding: '0 20px' }}>
              <SectionHeader eyebrow="Similares" title="Te puede interesar" />
            </div>
            <div style={{ display: 'flex', gap: 12, padding: '14px 20px 4px', overflowX: 'auto' }} className="hide-scroll">
              {otherCars.map(c => (
                <div key={c.id} style={{ flex: '0 0 230px' }}>
                  <CarCard car={c} onOpen={() => navigate(`/auto/${c.id}`)}
                    onFav={onFav} isFav={favs.includes(c.id)} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mobile sticky CTA */}
        <div style={{
          position: 'fixed', left: 0, right: 0, bottom: 0,
          padding: '10px 14px calc(env(safe-area-inset-bottom, 0px) + 10px)',
          background: 'rgba(250,250,247,.95)',
          backdropFilter: 'blur(20px) saturate(160%)',
          WebkitBackdropFilter: 'blur(20px) saturate(160%)',
          borderTop: '1px solid var(--at-border)',
          display: 'flex', flexDirection: 'column', gap: 6, zIndex: 30,
        }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => onFav(car.id)} aria-label="Favorito" style={{
              width: 48, height: 48, borderRadius: 12,
              background: 'var(--at-bg-2)', border: '1px solid var(--at-border)',
              display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0,
            }}>
              <IconHeart size={20} sw={1.8} filled={isFav} stroke={isFav ? '#e11d48' : 'var(--at-ink)'} />
            </button>
            <a data-testid="whatsapp-cta" href={buildWhatsapp(car)} target="_blank" rel="noopener noreferrer"
              style={{
                flex: 1, height: 48, borderRadius: 12,
                background: '#25D366', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontWeight: 700, fontSize: 14.5, textDecoration: 'none',
                boxShadow: '0 4px 14px -4px rgba(37,211,102,.55)',
              }}>
              <IconWhatsapp size={20} fill="#fff"/>Consultar por WhatsApp
            </a>
          </div>
          <div style={{ textAlign: 'center', fontSize: 10.5, color: 'var(--at-ink-3)' }}>
            Respondemos por WhatsApp · Coordinamos visita en Tandil
          </div>
        </div>
      </div>

      {/* ── DESKTOP layout (2 columns) ── */}
      <div className="hidden lg:block">
        {/* Back link */}
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '20px 32px 0' }}>
          <button onClick={() => navigate(-1)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'transparent', border: 'none', cursor: 'pointer',
              fontSize: 13, color: 'var(--at-ink-2)', fontWeight: 500,
              fontFamily: 'inherit', padding: 0,
              transition: 'color .15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--at-ink)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--at-ink-2)'}>
            <IconBack size={14} stroke="currentColor" />
            Volver al catálogo
          </button>
        </div>

        {/* 2-column grid */}
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '20px 32px 48px', display: 'flex', gap: 48, alignItems: 'flex-start' }}>
          {/* Left: gallery + similar */}
          <div style={{ flex: '0 0 56%', minWidth: 0 }}>
            <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid var(--at-border)', boxShadow: '0 2px 8px rgba(15,23,42,.06)' }}>
              <Gallery desktop />
            </div>

            {/* Similar cars */}
            {otherCars.length > 0 && (
              <div style={{ marginTop: 36 }}>
                <SectionHeader eyebrow="Similares" title="Te puede interesar" />
                <div className="grid grid-cols-2" style={{ gap: 12, marginTop: 14 }}>
                  {otherCars.slice(0, 2).map(c => (
                    <CarCard key={c.id} car={c} onOpen={() => navigate(`/auto/${c.id}`)}
                      onFav={onFav} isFav={favs.includes(c.id)} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: info panel (sticky) */}
          <div style={{ flex: 1, minWidth: 0, position: 'sticky', top: 84 }}>
            <InfoPanel desktop />
          </div>
        </div>
      </div>

      {showCalc && <FinanceCalc car={car} onClose={() => setShowCalc(false)} />}
    </div>
  );
}
