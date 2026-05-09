/* eslint-disable react-hooks/static-components */
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CARS as MOCK_CARS } from '../data/cars';
import { buildWhatsapp, fmtPrice, fmtKm } from '../lib/utils';
import { hdrBtn } from '../components/AppHeader';
import { Badge } from '../components/Badge';
import { CarCard } from '../components/CarCard';
import { FinanceCalc } from '../components/FinanceCalc';
import { SectionHeader } from '../components/SectionHeader';
import { ImageLightbox } from '../components/ImageLightbox';
import {
  IconHeart, IconWhatsapp, IconBack,
  IconGauge, IconCalendar, IconFuel, IconGear, IconCalc, IconLocation,
} from '../components/Icons';
import { trackCarView, trackWhatsappClick } from '../services/analyticsService';

export default function Detalle({ favs, onFav, cars = MOCK_CARS }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const car = cars.find(c => c.id === id);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [showCalc, setShowCalc] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const [touchStart, setTouchStart] = useState(null);
  const [brokenPhotos, setBrokenPhotos] = useState(() => new Set());

  useEffect(() => {
    if (car) trackCarView(car);
  }, [car]);

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
  const currentPhotoBroken = brokenPhotos.has(photoIdx);
  const markPhotoBroken = (index) => setBrokenPhotos(current => new Set(current).add(index));

  const Gallery = () => (
    <div style={{ background: 'var(--at-bg-2)', position: 'relative' }}>
      {/* floating controls */}
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

      <button
        type="button"
        data-testid="detail-main-image"
        onClick={() => setLightboxIdx(photoIdx)}
        onTouchStart={event => setTouchStart(event.touches[0].clientX)}
        onTouchEnd={event => {
          if (touchStart === null) return;
          const delta = event.changedTouches[0].clientX - touchStart;
          setTouchStart(null);
          if (Math.abs(delta) < 42) return;
          setPhotoIdx(current => {
            if (delta < 0) return Math.min(car.photoUrls.length - 1, current + 1);
            return Math.max(0, current - 1);
          });
        }}
        style={{ aspectRatio: '4/3', overflow: 'hidden', border: 'none', padding: 0, width: '100%', background: 'transparent', cursor: 'zoom-in', display: 'block', touchAction: 'pan-y' }}
      >
        {currentPhotoBroken ? (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'grid',
            placeItems: 'center',
            background: 'linear-gradient(135deg, var(--at-bg-2), var(--at-surface))',
            color: 'var(--at-ink-2)',
            padding: 24,
            textAlign: 'center',
          }}>
            <div>
              <div style={{ fontFamily: 'var(--at-display)', fontSize: 28, fontWeight: 800, color: 'var(--at-ink)', letterSpacing: '-.02em' }}>
                {car.brand} {car.model}
              </div>
              <div style={{ marginTop: 6, fontSize: 13, color: 'var(--at-ink-3)' }}>
                Foto no disponible
              </div>
            </div>
          </div>
        ) : (
          <img
            src={car.photoUrls[photoIdx]}
            alt={`${car.brand} ${car.model}`}
            onError={() => markPhotoBroken(photoIdx)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        )}
      </button>

      <div style={{
        position: 'absolute',
        right: 14,
        bottom: car.photoUrls.length > 1 ? 66 : 14,
        zIndex: 8,
        padding: '7px 10px',
        borderRadius: 999,
        background: 'rgba(15,23,42,.76)',
        color: '#fff',
        fontSize: 11,
        fontWeight: 800,
        backdropFilter: 'blur(10px)',
        pointerEvents: 'none',
      }}>
        Tocar para ampliar · {photoIdx + 1}/{car.photoUrls.length}
      </div>

      {car.photoUrls.length > 1 && (
        <div style={{ display: 'flex', gap: 6, padding: '8px 14px', overflowX: 'auto' }} className="hide-scroll">
          {car.photoUrls.map((url, i) => (
            <button key={i} onClick={() => setPhotoIdx(i)}
              style={{
                flex: '0 0 64px', height: 48, borderRadius: 8,
                overflow: 'hidden', border: '2px solid',
                borderColor: i === photoIdx ? 'var(--at-accent)' : 'transparent',
                padding: 0, cursor: 'pointer',
              }}>
              {brokenPhotos.has(i) ? (
                <span style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', background: 'var(--at-bg-2)', color: 'var(--at-ink-3)', fontSize: 10, fontWeight: 800 }}>
                  Sin foto
                </span>
              ) : (
                <img src={url} alt="" onError={() => markPhotoBroken(i)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const InfoPanel = ({ desktop = false }) => (
    <div>
      {/* badges + meta */}
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
          fontSize: desktop ? 32 : 28, fontWeight: 500, letterSpacing: '-.025em',
          lineHeight: 1.05, color: 'var(--at-ink)',
        }}>
          {car.brand} {car.model}
        </h1>
        <div style={{ fontSize: 13, color: 'var(--at-ink-2)' }}>{car.version}</div>
        <div style={{ marginTop: 14 }}>
          <div style={{
            fontFamily: 'var(--at-display)', fontSize: 32, fontWeight: 600,
            letterSpacing: '-.025em', color: 'var(--at-ink)',
          }}>{fmtPrice(car.price)}</div>
          {car.badges.includes('financia') && (
            <button onClick={() => setShowCalc(true)} style={{
              width: '100%', marginTop: 12, padding: '13px 14px',
              borderRadius: 14,
              border: '2px solid var(--at-accent)',
              background: 'var(--at-accent-soft)',
              cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: 12,
              textAlign: 'left',
            }}>
              <span style={{
                width: 40, height: 40, borderRadius: 10,
                background: 'var(--at-accent)',
                display: 'grid', placeItems: 'center', flexShrink: 0,
              }}>
                <IconCalc size={17} stroke="#fff" sw={1.6} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--at-accent)', letterSpacing: '-.01em' }}>
                  Ver opciones de financiación
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--at-ink-2)', marginTop: 2 }}>
                  Elegí anticipo, compará cuotas y consultá fácil.
                </div>
              </div>
              <span style={{ fontSize: 12, color: 'var(--at-accent)', fontWeight: 900, flexShrink: 0 }}>Ver cuotas</span>
            </button>
          )}
        </div>
      </div>

      {/* quick specs */}
      <div style={{ padding: desktop ? '8px 0 4px' : '8px 20px 4px' }}>
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
              <span style={{ color: 'var(--at-ink-3)' }}>{s.i}</span>
              <div>
                <div style={{ fontSize: 9.5, color: 'var(--at-ink-3)', textTransform: 'uppercase', letterSpacing: '.1em' }}>{s.l}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--at-ink)', marginTop: 1 }}>{s.v}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* description */}
      <div style={{ padding: desktop ? '16px 0 4px' : '20px 20px 4px' }}>
        <SectionHeader eyebrow="Descripción" title="Sobre este auto" />
        <p style={{ margin: '12px 0 0', fontSize: 14, lineHeight: 1.6, color: 'var(--at-ink-2)' }}>
          {car.desc}
        </p>
      </div>

      {/* tech sheet */}
      <div style={{ padding: desktop ? '16px 0 4px' : '20px 20px 4px' }}>
        <SectionHeader eyebrow="Ficha técnica" title="Detalles" />
        <dl style={{ margin: '12px 0 0', padding: 0 }}>
          {[
            ['Marca', car.brand], ['Modelo', car.model], ['Versión', car.version],
            ['Año', car.year], ['Kilómetros', fmtKm(car.km)],
            ['Combustible', car.fuel], ['Transmisión', car.trans],
            ['Motor', car.engine], ['Color', car.color],
            ['Tipo', car.type], ['Carrocería', car.body],
          ].map(([k, v]) => (
            <div key={k} style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '11px 0', borderBottom: '1px solid var(--at-border)',
              fontSize: 13,
            }}>
              <dt style={{ color: 'var(--at-ink-3)', margin: 0 }}>{k}</dt>
              <dd style={{ color: 'var(--at-ink)', fontWeight: 500, margin: 0 }}>{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* AutosTandil block */}
      <div style={{ padding: desktop ? '16px 0 4px' : '20px 20px 4px' }}>
        <SectionHeader eyebrow="Gestionado por" title="AutosTandil" />
        <div style={{
          marginTop: 12, background: 'var(--at-surface)',
          border: '1px solid var(--at-border)', borderRadius: 14, padding: 14,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{
            width: 48, height: 48, borderRadius: 10,
            background: '#fff', border: '1px solid var(--at-border)',
            display: 'grid', placeItems: 'center', flexShrink: 0, padding: 6,
          }}>
            <img src="/logo-autostandil-mark.png" alt=""
              style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--at-display)', fontWeight: 600, fontSize: 14, letterSpacing: '-.01em' }}>
              Unidad consignada
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--at-ink-3)', display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <IconLocation size={11} sw={1.8}/>Disponible en Tandil · Coordinamos visita
            </div>
          </div>
        </div>
      </div>

      {/* Desktop CTA */}
      {desktop && (
        <div style={{ padding: '20px 0 0', display: 'flex', gap: 8 }}>
          <button onClick={() => onFav(car.id)} aria-label="Favorito" style={{
            width: 52, height: 52, borderRadius: 12,
            background: 'var(--at-bg-2)', border: '1px solid var(--at-border)',
            display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0,
          }}>
            <IconHeart size={20} sw={1.8} filled={isFav} stroke={isFav ? '#e11d48' : 'var(--at-ink)'} />
          </button>
          <a data-testid="whatsapp-cta" href={buildWhatsapp(car)} onClick={() => trackWhatsappClick(car, 'detail_desktop')} target="_blank" rel="noopener noreferrer"
            style={{
              flex: 1, height: 52, borderRadius: 12,
              background: '#25D366', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontWeight: 600, fontSize: 15, textDecoration: 'none',
              letterSpacing: '-.005em',
              boxShadow: '0 6px 18px -6px rgba(37,211,102,.6)',
            }}>
            <IconWhatsapp size={20} fill="#fff"/>Consultar por WhatsApp
          </a>
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
                <div key={c.id} style={{ flex: '0 0 220px' }}>
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
          padding: '12px 14px calc(env(safe-area-inset-bottom, 0px) + 12px)',
          background: 'rgba(255,255,255,.92)',
          backdropFilter: 'blur(20px) saturate(160%)',
          WebkitBackdropFilter: 'blur(20px) saturate(160%)',
          borderTop: '1px solid var(--at-border)',
          display: 'flex', gap: 8, zIndex: 30,
        }}>
          <button onClick={() => onFav(car.id)} aria-label="Favorito" style={{
            width: 48, height: 48, borderRadius: 12,
            background: 'var(--at-bg-2)', border: '1px solid var(--at-border)',
            display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0,
          }}>
            <IconHeart size={20} sw={1.8} filled={isFav} stroke={isFav ? '#e11d48' : 'var(--at-ink)'} />
          </button>
          <a data-testid="whatsapp-cta" href={buildWhatsapp(car)} onClick={() => trackWhatsappClick(car, 'detail_mobile')} target="_blank" rel="noopener noreferrer"
            style={{
              flex: 1, height: 48, borderRadius: 12,
              background: '#25D366', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontWeight: 600, fontSize: 14.5, textDecoration: 'none',
              letterSpacing: '-.005em',
              boxShadow: '0 6px 18px -6px rgba(37,211,102,.6)',
            }}>
            <IconWhatsapp size={20} fill="#fff"/>Consultar por WhatsApp
          </a>
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
            }}>
            <IconBack size={14} stroke="currentColor" />
            Volver al catálogo
          </button>
        </div>

        {/* 2-column grid */}
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '20px 32px 48px', display: 'flex', gap: 48, alignItems: 'flex-start' }}>
          {/* Left: gallery + similar */}
          <div style={{ flex: '0 0 56%', minWidth: 0 }}>
            <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid var(--at-border)' }}>
              <Gallery />
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
          <div style={{ flex: 1, minWidth: 0, position: 'sticky', top: 80 }}>
            <InfoPanel desktop />
          </div>
        </div>
      </div>

      {showCalc && <FinanceCalc car={car} onClose={() => setShowCalc(false)} />}
      {lightboxIdx !== null && (
        <ImageLightbox
          images={car.photoUrls}
          index={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
          onIndex={setLightboxIdx}
        />
      )}
    </div>
  );
}
