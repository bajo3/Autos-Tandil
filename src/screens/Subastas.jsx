import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CARS as MOCK_CARS } from '../data/cars';
import { buildWhatsapp, fmtKm, fmtPrice, fmtShort } from '../lib/utils';
import { AppHeader } from '../components/AppHeader';
import { SectionHeader } from '../components/SectionHeader';
import {
  IconWhatsapp, IconCheck, IconClock, IconShield, IconGavel,
  IconCar, IconGauge, IconCalendar, IconLocation, IconArrowRight,
} from '../components/Icons';

const pageWrap = {
  maxWidth: '80rem',
  margin: '0 auto',
  padding: '0 20px',
};

const AUCTION_NUMBER = '5492494621182';

const lotMeta = [
  { status: 'En vivo', endsIn: '02:18:44', bids: 14, increment: 250000, reserve: 'Reserva alcanzada', score: 'Verificado' },
  { status: 'Próxima', endsIn: 'Mañana 19:30', bids: 8, increment: 200000, reserve: 'Sin reserva', score: 'Ingreso aprobado' },
  { status: 'Últimas horas', endsIn: '00:47:12', bids: 21, increment: 300000, reserve: 'Reserva cerca', score: 'Informe completo' },
];

function buildLots(cars) {
  const source = cars.length ? cars : MOCK_CARS;
  return source.slice(0, 3).map((car, index) => {
    const meta = lotMeta[index] || lotMeta[0];
    const base = Math.max(1000000, Math.round(car.price * (index === 1 ? 0.72 : 0.78) / 100000) * 100000);
    const current = base + (meta.bids * meta.increment);
    return {
      ...car,
      auctionStatus: meta.status,
      endsIn: meta.endsIn,
      bidCount: meta.bids,
      increment: meta.increment,
      reserve: meta.reserve,
      score: meta.score,
      currentBid: current,
      nextBid: current + meta.increment,
    };
  });
}

function parseMoney(value, fallback) {
  const onlyDigits = String(value || '').replace(/[^\d]/g, '');
  return Number(onlyDigits) || fallback;
}

function TrustPill({ icon, children }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 7,
      padding: '8px 10px',
      borderRadius: 999,
      background: 'rgba(255,255,255,.1)',
      border: '1px solid rgba(255,255,255,.14)',
      color: 'rgba(255,255,255,.88)',
      fontSize: 12,
      fontWeight: 800,
      whiteSpace: 'nowrap',
    }}>
      {icon}
      {children}
    </span>
  );
}

function MiniSpec({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', minWidth: 0 }}>
      <span style={{ color: 'var(--at-ink-3)', flexShrink: 0 }}>{icon}</span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 9.5, color: 'var(--at-ink-3)', letterSpacing: '.1em', textTransform: 'uppercase', fontFamily: 'var(--at-mono)' }}>{label}</div>
        <div style={{ fontSize: 12.5, color: 'var(--at-ink)', fontWeight: 800, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</div>
      </div>
    </div>
  );
}

function LotImage({ lot, large = false }) {
  const [broken, setBroken] = useState(false);

  return (
    <div style={{
      position: 'relative',
      aspectRatio: large ? '16/10' : '4/3',
      overflow: 'hidden',
      background: large ? '#111827' : 'var(--at-bg-2)',
    }}>
      {broken ? (
        <div style={{
          width: '100%',
          height: '100%',
          display: 'grid',
          placeItems: 'center',
          textAlign: 'center',
          background: 'linear-gradient(135deg, var(--at-bg-2), var(--at-surface))',
          color: 'var(--at-ink-2)',
          padding: 20,
        }}>
          <div>
            <div style={{ fontFamily: 'var(--at-display)', fontSize: large ? 30 : 18, fontWeight: 800, color: 'var(--at-ink)' }}>
              {lot.brand} {lot.model}
            </div>
            <div style={{ marginTop: 6, fontSize: 12, color: 'var(--at-ink-3)' }}>Foto no disponible</div>
          </div>
        </div>
      ) : (
        <img
          src={lot.photoUrls?.[0] || lot.thumbUrl}
          alt={`${lot.brand} ${lot.model}`}
          onError={() => setBroken(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      )}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: large ? 'linear-gradient(180deg, rgba(15,23,42,0) 40%, rgba(15,23,42,.72) 100%)' : 'none',
        pointerEvents: 'none',
      }} />
      <span style={{
        position: 'absolute',
        top: 12,
        left: 12,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 10px',
        borderRadius: 999,
        background: lot.auctionStatus === 'En vivo' ? '#16a34a' : 'rgba(15,23,42,.78)',
        color: '#fff',
        fontSize: 11,
        fontWeight: 900,
        boxShadow: '0 10px 26px rgba(15,23,42,.18)',
      }}>
        <span style={{ width: 6, height: 6, borderRadius: 999, background: '#fff', opacity: .9 }} />
        {lot.auctionStatus}
      </span>
    </div>
  );
}

function LotCard({ lot, active, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      style={{
        width: '100%',
        border: `1px solid ${active ? 'var(--at-accent)' : 'var(--at-border)'}`,
        borderRadius: 16,
        overflow: 'hidden',
        background: active ? 'var(--at-accent-soft)' : 'var(--at-surface)',
        padding: 0,
        cursor: 'pointer',
        textAlign: 'left',
        fontFamily: 'inherit',
        boxShadow: active ? '0 18px 40px rgba(0,68,255,.12)' : '0 1px 2px rgba(15,23,42,.04)',
      }}
    >
      <LotImage lot={lot} />
      <div style={{ padding: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div style={{ fontFamily: 'var(--at-display)', fontSize: 18, fontWeight: 800, color: 'var(--at-ink)', letterSpacing: '-.02em' }}>
              {lot.brand} {lot.model}
            </div>
            <div style={{ fontSize: 12, color: 'var(--at-ink-2)', marginTop: 2 }}>{lot.version}</div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 10, color: 'var(--at-ink-3)', fontFamily: 'var(--at-mono)', letterSpacing: '.1em', textTransform: 'uppercase' }}>Oferta</div>
            <div style={{ fontSize: 16, color: 'var(--at-ink)', fontWeight: 900, marginTop: 2 }}>{fmtShort(lot.currentBid)}</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 13 }}>
          <MiniSpec icon={<IconClock size={13} sw={1.8} />} label="Cierre" value={lot.endsIn} />
          <MiniSpec icon={<IconGavel size={13} sw={1.8} />} label="Pujas" value={lot.bidCount} />
        </div>
      </div>
    </button>
  );
}

function ProcessStep({ number, title, desc }) {
  return (
    <div style={{
      background: 'var(--at-surface)',
      border: '1px solid var(--at-border)',
      borderRadius: 16,
      padding: 16,
    }}>
      <div style={{ width: 34, height: 34, borderRadius: 11, background: 'var(--at-ink)', color: '#fff', display: 'grid', placeItems: 'center', fontFamily: 'var(--at-mono)', fontWeight: 900, fontSize: 12 }}>
        {number}
      </div>
      <div style={{ marginTop: 12, fontFamily: 'var(--at-display)', fontSize: 17, fontWeight: 800, color: 'var(--at-ink)' }}>{title}</div>
      <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--at-ink-2)', lineHeight: 1.55 }}>{desc}</p>
    </div>
  );
}

export default function Subastas({ cars = MOCK_CARS }) {
  const navigate = useNavigate();
  const lots = useMemo(() => buildLots(cars), [cars]);
  const [selectedId, setSelectedId] = useState(lots[0]?.id);
  const selected = lots.find(lot => lot.id === selectedId) || lots[0];
  const [bid, setBid] = useState(selected?.nextBid || 0);

  const selectLot = (lot) => {
    setSelectedId(lot.id);
    setBid(lot.nextBid);
  };

  const bidHref = (() => {
    if (!selected) return buildWhatsapp(null, 'auctions');
    const msg = `Hola! Quiero participar en la subasta del ${selected.brand} ${selected.model} ${selected.version || ''}. Mi oferta inicial es ${fmtPrice(bid)}. Me explican como validar mi participacion?`;
    return `https://wa.me/${AUCTION_NUMBER}?text=${encodeURIComponent(msg)}`;
  })();

  if (!selected) return null;

  return (
    <div className="pb-[118px] md:pb-0">
      <AppHeader onBack={() => navigate('/')} title="Subastas" />

      <section style={{ background: 'var(--at-ink)', color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(90deg, rgba(15,23,42,.96) 0%, rgba(15,23,42,.82) 48%, rgba(15,23,42,.72) 100%), url(${selected.photoUrls?.[0] || selected.thumbUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'saturate(.95)',
        }} />
        <div style={{ ...pageWrap, position: 'relative', paddingTop: 34, paddingBottom: 34 }}>
          <div className="lg:grid lg:grid-cols-[1fr_460px] lg:gap-12 lg:items-center">
            <div>
              <div style={{ fontFamily: 'var(--at-mono)', fontSize: 10.5, letterSpacing: '.18em', textTransform: 'uppercase', color: '#9db8ff', fontWeight: 800 }}>
                Subastas asistidas por AutosTandil
              </div>
              <h1 style={{
                margin: '10px 0 0',
                fontFamily: 'var(--at-display)',
                fontSize: 'clamp(34px, 5vw, 64px)',
                lineHeight: .96,
                letterSpacing: '-.045em',
                fontWeight: 600,
                maxWidth: 720,
              }}>
                Ofertá por autos seleccionados con reglas claras.
              </h1>
              <p style={{ margin: '18px 0 0', maxWidth: 560, fontSize: 15, lineHeight: 1.65, color: 'rgba(255,255,255,.76)' }}>
                Una experiencia de subasta local, cuidada y verificable: unidades revisadas, participantes validados y cierre coordinado por AutosTandil.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 20 }}>
                <TrustPill icon={<IconShield size={14} sw={2} />}>Participantes validados</TrustPill>
                <TrustPill icon={<IconCar size={14} sw={2} />}>Autos curados</TrustPill>
                <TrustPill icon={<IconLocation size={14} sw={2} />}>Cierre local en Tandil</TrustPill>
              </div>
            </div>

            <div style={{
              marginTop: 24,
              background: 'rgba(255,255,255,.1)',
              border: '1px solid rgba(255,255,255,.16)',
              borderRadius: 22,
              padding: 14,
              boxShadow: '0 28px 80px rgba(0,0,0,.28)',
              backdropFilter: 'blur(18px)',
            }}>
              <div style={{ borderRadius: 16, overflow: 'hidden' }}>
                <LotImage lot={selected} large />
              </div>
              <div style={{ padding: '15px 4px 2px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'start' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--at-display)', fontSize: 24, fontWeight: 800, letterSpacing: '-.025em' }}>
                      {selected.brand} {selected.model}
                    </div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,.72)', marginTop: 3 }}>{selected.version}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--at-mono)', fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.5)' }}>Cierra</div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', marginTop: 2 }}>{selected.endsIn}</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16 }}>
                  <div style={{ background: 'rgba(255,255,255,.1)', borderRadius: 14, padding: 12 }}>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,.55)', fontFamily: 'var(--at-mono)', letterSpacing: '.1em', textTransform: 'uppercase' }}>Oferta actual</div>
                    <div style={{ marginTop: 4, fontFamily: 'var(--at-display)', fontSize: 24, fontWeight: 900 }}>{fmtPrice(selected.currentBid)}</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,.1)', borderRadius: 14, padding: 12 }}>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,.55)', fontFamily: 'var(--at-mono)', letterSpacing: '.1em', textTransform: 'uppercase' }}>Siguiente mínima</div>
                    <div style={{ marginTop: 4, fontFamily: 'var(--at-display)', fontSize: 24, fontWeight: 900, color: '#9db8ff' }}>{fmtPrice(selected.nextBid)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main style={pageWrap}>
        <section className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-8 lg:items-start" style={{ padding: '28px 0 8px' }}>
          <div>
            <SectionHeader eyebrow="Lotes activos" title="Subastas curadas" />
            <div className="lg:grid lg:grid-cols-3" style={{ display: 'grid', gap: 14, marginTop: 16 }}>
              {lots.map(lot => (
                <LotCard key={lot.id} lot={lot} active={lot.id === selected.id} onSelect={() => selectLot(lot)} />
              ))}
            </div>
          </div>

          <aside style={{
            marginTop: 24,
            position: 'sticky',
            top: 84,
            background: 'var(--at-surface)',
            border: '1px solid var(--at-border)',
            borderRadius: 18,
            padding: 18,
            boxShadow: '0 18px 46px rgba(15,23,42,.08)',
          }}>
            <div style={{ fontFamily: 'var(--at-mono)', fontSize: 10, color: 'var(--at-accent)', letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 900 }}>
              Hacer una oferta
            </div>
            <h2 style={{ margin: '7px 0 0', fontFamily: 'var(--at-display)', fontSize: 24, fontWeight: 850, letterSpacing: '-.025em', color: 'var(--at-ink)' }}>
              {selected.brand} {selected.model}
            </h2>
            <p style={{ margin: '8px 0 0', fontSize: 13, lineHeight: 1.55, color: 'var(--at-ink-2)' }}>
              Tu oferta se confirma por WhatsApp con un asesor. Antes de pujar, validamos identidad y condiciones para evitar ofertas falsas.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16 }}>
              <MiniSpec icon={<IconGauge size={14} sw={1.8} />} label="Km" value={fmtKm(selected.km)} />
              <MiniSpec icon={<IconCalendar size={14} sw={1.8} />} label="Año" value={selected.year} />
            </div>

            <label style={{ display: 'block', marginTop: 18 }}>
              <span style={{ display: 'block', fontSize: 11, color: 'var(--at-ink-3)', fontFamily: 'var(--at-mono)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6 }}>
                Tu oferta
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={fmtPrice(bid)}
                onChange={event => setBid(parseMoney(event.target.value, selected.nextBid))}
                style={{
                  width: '100%',
                  border: '1px solid var(--at-border)',
                  borderRadius: 14,
                  padding: '14px 14px',
                  fontSize: 20,
                  fontWeight: 900,
                  color: 'var(--at-ink)',
                  outline: 'none',
                  background: 'var(--at-bg)',
                }}
              />
            </label>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              {[1, 2, 3].map(multiplier => (
                <button
                  key={multiplier}
                  type="button"
                  onClick={() => setBid(selected.currentBid + selected.increment * multiplier)}
                  style={{
                    flex: 1,
                    border: '1px solid var(--at-border)',
                    background: 'var(--at-bg-2)',
                    borderRadius: 999,
                    padding: '9px 8px',
                    fontSize: 11,
                    fontWeight: 900,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  +{fmtShort(selected.increment * multiplier)}
                </button>
              ))}
            </div>
            <a
              href={bidHref}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                marginTop: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 9,
                width: '100%',
                padding: '15px 16px',
                borderRadius: 14,
                background: '#25D366',
                color: '#fff',
                fontWeight: 900,
                textDecoration: 'none',
                boxShadow: '0 12px 28px rgba(37,211,102,.28)',
              }}
            >
              <IconWhatsapp size={19} fill="#fff" />
              Validar oferta por WhatsApp
            </a>
            <div style={{ marginTop: 12, display: 'grid', gap: 7 }}>
              {['Sin pago online en esta etapa', selected.reserve, selected.score].map(item => (
                <div key={item} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12.5, color: 'var(--at-ink-2)' }}>
                  <span style={{ width: 18, height: 18, borderRadius: 999, background: 'var(--at-accent-soft)', color: 'var(--at-accent)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    <IconCheck size={11} sw={2.4} />
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section style={{ padding: '30px 0 8px' }}>
          <SectionHeader eyebrow="Confianza" title="Cómo hacemos que sea transparente" />
          <div className="grid md:grid-cols-3" style={{ gap: 12, marginTop: 16 }}>
            <ProcessStep number="01" title="Prevalidación" desc="Antes de ofertar, confirmamos datos básicos por WhatsApp. Así evitamos pujas falsas y cuidamos al comprador y al vendedor." />
            <ProcessStep number="02" title="Auto publicado con ficha" desc="Cada lote muestra kilometraje, versión, fotos y observaciones relevantes. Si falta algo, lo aclaramos antes del cierre." />
            <ProcessStep number="03" title="Cierre asistido" desc="Cuando termina la subasta, AutosTandil contacta al mejor oferente y coordina seña, documentación y visita." />
          </div>
        </section>

        <section style={{ padding: '30px 0 8px' }}>
          <div className="lg:grid lg:grid-cols-[1.1fr_.9fr] lg:gap-12 lg:items-center" style={{
            background: 'var(--at-ink)',
            color: '#fff',
            borderRadius: 22,
            padding: '28px 24px',
            overflow: 'hidden',
            position: 'relative',
          }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontFamily: 'var(--at-mono)', fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: '#9db8ff', fontWeight: 900 }}>
                ¿Querés subastar tu auto?
              </div>
              <h3 style={{ margin: '8px 0 0', fontFamily: 'var(--at-display)', fontSize: 32, lineHeight: 1.02, fontWeight: 650, letterSpacing: '-.03em' }}>
                Lo preparamos, lo publicamos y administramos las ofertas.
              </h3>
              <p style={{ margin: '12px 0 0', color: 'rgba(255,255,255,.72)', fontSize: 14, lineHeight: 1.6, maxWidth: 580 }}>
                La subasta tiene sentido cuando el auto está bien presentado y la gente confía. Por eso AutosTandil filtra el lote, ordena la información y acompaña el cierre.
              </p>
            </div>
            <a
              href={buildWhatsapp(null, 'auction-seller')}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                position: 'relative',
                zIndex: 1,
                marginTop: 18,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '14px 18px',
                borderRadius: 999,
                background: '#fff',
                color: 'var(--at-ink)',
                fontWeight: 900,
                textDecoration: 'none',
              }}
            >
              Quiero subastar mi auto <IconArrowRight size={15} sw={2.4} />
            </a>
          </div>
        </section>
      </main>

      <div className="md:hidden" style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 38,
        padding: '10px 14px calc(env(safe-area-inset-bottom, 0px) + 74px)',
        pointerEvents: 'none',
      }}>
        <a
          href={bidHref}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            padding: '13px 14px',
            borderRadius: 18,
            background: 'rgba(15,23,42,.94)',
            color: '#fff',
            textDecoration: 'none',
            boxShadow: '0 18px 44px rgba(15,23,42,.28)',
            backdropFilter: 'blur(18px)',
          }}
        >
          <span>
            <span style={{ display: 'block', fontSize: 10, color: 'rgba(255,255,255,.55)', fontFamily: 'var(--at-mono)', letterSpacing: '.1em', textTransform: 'uppercase' }}>Siguiente oferta</span>
            <strong style={{ display: 'block', marginTop: 2, fontSize: 16 }}>{fmtPrice(selected.nextBid)}</strong>
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#25D366', color: '#fff', borderRadius: 999, padding: '10px 12px', fontWeight: 900, fontSize: 12 }}>
            <IconWhatsapp size={16} fill="#fff" />
            Ofertar
          </span>
        </a>
      </div>
    </div>
  );
}
