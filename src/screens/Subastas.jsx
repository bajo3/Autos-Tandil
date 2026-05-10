import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CARS as MOCK_CARS } from '../data/cars';
import { buildWhatsapp, fmtKm, fmtPrice, fmtShort } from '../lib/utils';
import { hasSupabaseConfig, supabase } from '../lib/supabase';
import { AppHeader } from '../components/AppHeader';
import { SectionHeader } from '../components/SectionHeader';
import { AuthModal } from '../components/AuthModal';
import { ProfileGate } from '../components/ProfileGate';
import { useAuth } from '../hooks/useAuth';
import {
  listPublicAuctions, listBids, getMyParticipation, requestParticipation,
  placeBid, subscribeAuction,
} from '../services/auctionService';
import {
  IconWhatsapp, IconCheck, IconClock, IconShield, IconGavel,
  IconCar, IconLocation, IconArrowRight,
} from '../components/Icons';

const pageWrap = { maxWidth: '80rem', margin: '0 auto', padding: '0 20px' };
const AUCTION_NUMBER = '5492494621182';

// ----------------------------- helpers -----------------------------
function parseMoney(value, fallback) {
  const onlyDigits = String(value || '').replace(/[^\d]/g, '');
  return Number(onlyDigits) || fallback;
}

function formatCountdown(ms) {
  if (ms <= 0) return 'Cerrada';
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (days > 0) return `${days}d ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function deriveStatus(auction, now) {
  if (auction.status === 'cancelled') return 'cancelled';
  if (auction.status === 'ended') return 'ended';
  const start = new Date(auction.starts_at).getTime();
  const end = new Date(auction.ends_at).getTime();
  if (now < start) return 'scheduled';
  if (now >= end) return 'ended';
  return 'live';
}

function statusLabel(status) {
  return ({ live: 'En vivo', scheduled: 'Próxima', ended: 'Cerrada', cancelled: 'Cancelada' })[status] || status;
}

function nextMin(auction) {
  const inc = Number(auction.min_increment) || 0;
  const cur = auction.current_bid != null ? Number(auction.current_bid) : null;
  if (cur == null) return Number(auction.starting_price) || 0;
  return cur + inc;
}

// Build mock auctions from inventory cars to use as fallback when DB is empty
function buildMockAuctions(cars) {
  const source = cars.length ? cars : MOCK_CARS;
  return source.slice(0, 3).map((car, index) => {
    const startingPrice = Math.max(1000000, Math.round(car.price * 0.78 / 100000) * 100000);
    const inc = 250000;
    const bidCount = [14, 8, 21][index] || 5;
    const current = startingPrice + bidCount * inc;
    const ends = new Date(Date.now() + [1000 * 60 * 60 * 2, 1000 * 60 * 60 * 26, 1000 * 60 * 47][index]);
    return {
      id: `mock-${car.id}`,
      _mock: true,
      car_id: car.id,
      car,
      title: `${car.brand} ${car.model}`,
      description: car.description,
      cover_url: car.photoUrls?.[0] || car.thumbUrl,
      starting_price: startingPrice,
      min_increment: inc,
      deposit_amount: 100000,
      starts_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      ends_at: ends.toISOString(),
      status: 'live',
      current_bid: current,
      bid_count: bidCount,
    };
  });
}

// ----------------------------- presentational -----------------------------
function TrustPill({ icon, children }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 10px',
      borderRadius: 999, background: 'rgba(255,255,255,.1)',
      border: '1px solid rgba(255,255,255,.14)', color: 'rgba(255,255,255,.88)',
      fontSize: 12, fontWeight: 800, whiteSpace: 'nowrap',
    }}>
      {icon}{children}
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

function LotImage({ auction, status, large = false }) {
  const [broken, setBroken] = useState(false);
  const cover = auction.cover_url || auction.car?.photoUrls?.[0] || auction.car?.thumbUrl;
  return (
    <div style={{ position: 'relative', aspectRatio: large ? '16/10' : '4/3', overflow: 'hidden', background: large ? '#111827' : 'var(--at-bg-2)' }}>
      {broken || !cover ? (
        <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', textAlign: 'center', background: 'linear-gradient(135deg, var(--at-bg-2), var(--at-surface))', color: 'var(--at-ink-2)', padding: 20 }}>
          <div>
            <div style={{ fontFamily: 'var(--at-display)', fontSize: large ? 30 : 18, fontWeight: 800, color: 'var(--at-ink)' }}>{auction.title}</div>
            <div style={{ marginTop: 6, fontSize: 12, color: 'var(--at-ink-3)' }}>Foto en preparación</div>
          </div>
        </div>
      ) : (
        <img src={cover} alt={auction.title} onError={() => setBroken(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      )}
      <div style={{ position: 'absolute', inset: 0, background: large ? 'linear-gradient(180deg, rgba(15,23,42,0) 40%, rgba(15,23,42,.72) 100%)' : 'none', pointerEvents: 'none' }} />
      <span style={{
        position: 'absolute', top: 12, left: 12, display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '6px 10px', borderRadius: 999,
        background: status === 'live' ? '#16a34a' : status === 'ended' ? '#64748b' : 'rgba(15,23,42,.78)',
        color: '#fff', fontSize: 11, fontWeight: 900, boxShadow: '0 10px 26px rgba(15,23,42,.18)',
      }}>
        <span style={{ width: 6, height: 6, borderRadius: 999, background: '#fff', opacity: .9, animation: status === 'live' ? 'at-pulse 1.6s infinite' : 'none' }} />
        {statusLabel(status)}
      </span>
    </div>
  );
}

function LotCard({ auction, active, onSelect, now }) {
  const status = deriveStatus(auction, now);
  const ms = new Date(auction.ends_at).getTime() - now;
  return (
    <button type="button" onClick={onSelect}
      style={{
        width: '100%', border: `1px solid ${active ? 'var(--at-accent)' : 'var(--at-border)'}`,
        borderRadius: 16, overflow: 'hidden',
        background: active ? 'var(--at-accent-soft)' : 'var(--at-surface)',
        padding: 0, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
        boxShadow: active ? '0 18px 40px rgba(0,68,255,.12)' : '0 1px 2px rgba(15,23,42,.04)',
      }}>
      <LotImage auction={auction} status={status} />
      <div style={{ padding: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--at-display)', fontSize: 18, fontWeight: 800, color: 'var(--at-ink)', letterSpacing: '-.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {auction.title}
            </div>
            <div style={{ fontSize: 11, color: 'var(--at-ink-2)', marginTop: 2, fontFamily: 'var(--at-mono)' }}>
              Base {fmtShort(Number(auction.starting_price))}
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 10, color: 'var(--at-ink-3)', fontFamily: 'var(--at-mono)', letterSpacing: '.1em', textTransform: 'uppercase' }}>Oferta</div>
            <div style={{ fontSize: 16, color: 'var(--at-ink)', fontWeight: 900, marginTop: 2 }}>
              {auction.current_bid != null ? fmtShort(Number(auction.current_bid)) : '—'}
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 13 }}>
          <MiniSpec icon={<IconClock size={13} sw={1.8} />} label="Cierre" value={status === 'live' ? formatCountdown(ms) : statusLabel(status)} />
          <MiniSpec icon={<IconGavel size={13} sw={1.8} />} label="Pujas" value={auction.bid_count || 0} />
        </div>
      </div>
    </button>
  );
}

function ProcessStep({ number, title, desc }) {
  return (
    <div style={{ background: 'var(--at-surface)', border: '1px solid var(--at-border)', borderRadius: 16, padding: 16 }}>
      <div style={{ width: 34, height: 34, borderRadius: 11, background: 'var(--at-ink)', color: '#fff', display: 'grid', placeItems: 'center', fontFamily: 'var(--at-mono)', fontWeight: 900, fontSize: 12 }}>
        {number}
      </div>
      <div style={{ marginTop: 12, fontFamily: 'var(--at-display)', fontSize: 17, fontWeight: 800, color: 'var(--at-ink)' }}>{title}</div>
      <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--at-ink-2)', lineHeight: 1.55 }}>{desc}</p>
    </div>
  );
}

function BidHistory({ bids, currentUserId }) {
  if (!bids?.length) {
    return (
      <div style={{ marginTop: 12, padding: 14, borderRadius: 12, background: 'var(--at-bg-2)', fontSize: 12, color: 'var(--at-ink-2)' }}>
        Todavía no hay ofertas. Si esta es tu subasta, podés ser el primero.
      </div>
    );
  }
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 0', display: 'grid', gap: 6, maxHeight: 220, overflowY: 'auto' }}>
      {bids.map((b, i) => {
        const mine = currentUserId && b.user_id === currentUserId;
        return (
          <li key={b.id} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
            padding: '10px 12px', borderRadius: 10,
            background: i === 0 ? 'var(--at-accent-soft)' : 'var(--at-bg-2)',
            border: i === 0 ? '1px solid var(--at-accent)' : '1px solid transparent',
          }}>
            <div style={{ fontSize: 12, color: 'var(--at-ink-2)', fontFamily: 'var(--at-mono)' }}>
              {mine ? 'Vos' : `Postor ${b.user_id.slice(0, 4).toUpperCase()}`}
              <span style={{ marginLeft: 8, color: 'var(--at-ink-3)' }}>
                {new Date(b.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div style={{ fontWeight: 900, color: 'var(--at-ink)' }}>{fmtPrice(Number(b.amount))}</div>
          </li>
        );
      })}
    </ul>
  );
}

// ----------------------------- bidding panel -----------------------------
function BiddingPanel({
  auction, status, user, profile, participation, bids, ms, now,
  onLoginClick, onSaveProfile, onRequestParticipation, onPlaceBid,
}) {
  const [bid, setBid] = useState(nextMin(auction));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [okMsg, setOkMsg] = useState('');

  useEffect(() => {
    Promise.resolve().then(() => { setBid(nextMin(auction)); setErr(''); setOkMsg(''); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auction.id, auction.current_bid, auction.min_increment, auction.starting_price]);

  const inc = Number(auction.min_increment) || 0;
  const min = nextMin(auction);

  const handleBid = async (event) => {
    event.preventDefault();
    if (bid < min) { setErr(`La oferta mínima es ${fmtPrice(min)}.`); return; }
    setBusy(true); setErr(''); setOkMsg('');
    try {
      await onPlaceBid(bid);
      setOkMsg('¡Oferta registrada!');
    } catch (e) {
      const m = e?.message || '';
      if (m.includes('NOT_APPROVED')) setErr('Tu participación todavía no está aprobada.');
      else if (m.includes('BID_TOO_LOW')) setErr(`La oferta es menor al mínimo (${fmtPrice(min)}).`);
      else if (m.includes('AUCTION_NOT_LIVE') || m.includes('OUT_OF_WINDOW')) setErr('La subasta no está activa.');
      else setErr('No se pudo registrar la oferta. Probá de nuevo.');
    } finally { setBusy(false); }
  };

  const heading = (
    <>
      <div style={{ fontFamily: 'var(--at-mono)', fontSize: 10, color: 'var(--at-accent)', letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 900 }}>
        Hacer una oferta
      </div>
      <h2 style={{ margin: '7px 0 0', fontFamily: 'var(--at-display)', fontSize: 22, fontWeight: 850, letterSpacing: '-.025em', color: 'var(--at-ink)' }}>
        {auction.title}
      </h2>
    </>
  );

  // -- demo / mock --
  if (auction._mock) {
    const wa = `https://wa.me/${AUCTION_NUMBER}?text=${encodeURIComponent(`Hola! Quiero saber cuándo arranca la subasta del ${auction.title}.`)}`;
    return (
      <aside style={panelStyle}>
        {heading}
        <p style={{ margin: '10px 0 0', fontSize: 13, color: 'var(--at-ink-2)', lineHeight: 1.5 }}>
          Esta es una vista previa. Las subastas en vivo arrancan apenas habilitemos los primeros lotes. Dejá tu interés por WhatsApp y te avisamos.
        </p>
        <a href={wa} target="_blank" rel="noopener noreferrer" style={waBtn}>
          <IconWhatsapp size={18} fill="#fff" />Avisame cuando arranque
        </a>
      </aside>
    );
  }

  // -- not authenticated --
  if (!user) {
    return (
      <aside style={panelStyle}>
        {heading}
        <p style={{ margin: '10px 0 14px', fontSize: 13, color: 'var(--at-ink-2)', lineHeight: 1.5 }}>
          Para ofertar necesitás una cuenta. Toma menos de un minuto y la usás en todas las subastas.
        </p>
        <button type="button" onClick={onLoginClick} style={primaryBtn}>Ingresar / Crear cuenta</button>
        <SafetyList items={['Cuenta validada', `Seña reembolsable de ${fmtPrice(Number(auction.deposit_amount))}`, 'Pago por MercadoPago']} />
      </aside>
    );
  }

  // -- profile incomplete --
  const profileComplete = profile && profile.full_name?.trim() && profile.dni?.trim() && profile.phone?.trim();
  if (!profileComplete) {
    return (
      <aside style={panelStyle}>
        {heading}
        <div style={{ marginTop: 12 }}>
          <ProfileGate profile={profile} onSave={onSaveProfile} />
        </div>
      </aside>
    );
  }

  // -- not yet participant --
  if (!participation) {
    return (
      <aside style={panelStyle}>
        {heading}
        <p style={{ margin: '10px 0 14px', fontSize: 13, color: 'var(--at-ink-2)', lineHeight: 1.5 }}>
          Para habilitarte tenés que dejar una <strong>seña reembolsable de {fmtPrice(Number(auction.deposit_amount))}</strong>. Si no ganás se reintegra; si ganás cuenta como parte del precio.
        </p>
        <button type="button" onClick={onRequestParticipation} style={primaryBtn}>Pedir habilitación</button>
        <SafetyList items={['Pago seguro con MercadoPago', 'Reintegro automático si no ganás', 'AutosTandil verifica cada lote']} />
      </aside>
    );
  }

  // -- participation pending deposit --
  if (participation.deposit_status === 'pending') {
    return (
      <aside style={panelStyle}>
        {heading}
        <Banner tone="warn">
          Tu participación está creada. Falta confirmar la seña de {fmtPrice(Number(auction.deposit_amount))} por MercadoPago.
        </Banner>
        <DepositButton auctionId={auction.id} amount={Number(auction.deposit_amount)} />
        <p style={{ marginTop: 10, fontSize: 11.5, color: 'var(--at-ink-3)', lineHeight: 1.5 }}>
          MercadoPago aún no está conectado en este entorno. Avisanos por WhatsApp y un asesor te confirma manualmente.
        </p>
        <a href={`https://wa.me/${AUCTION_NUMBER}?text=${encodeURIComponent('Hola! Necesito coordinar la seña para participar de la subasta ' + auction.title)}`}
          target="_blank" rel="noopener noreferrer" style={{ ...waBtn, marginTop: 8 }}>
          <IconWhatsapp size={16} fill="#fff" />Coordinar seña por WhatsApp
        </a>
      </aside>
    );
  }

  if (participation.deposit_status === 'refunded' || participation.deposit_status === 'forfeited') {
    return (
      <aside style={panelStyle}>
        {heading}
        <Banner tone="info">Tu participación está cerrada. Si querés volver a entrar, escribinos.</Banner>
      </aside>
    );
  }

  // -- approved & live --
  if (status !== 'live') {
    return (
      <aside style={panelStyle}>
        {heading}
        <Banner tone="info">
          {status === 'scheduled'
            ? `Esta subasta arranca en ${formatCountdown(new Date(auction.starts_at).getTime() - now)}.`
            : 'Esta subasta ya cerró. Te avisamos por WhatsApp si fuiste el ganador.'}
        </Banner>
        <BidHistory bids={bids} currentUserId={user.id} />
      </aside>
    );
  }

  return (
    <aside style={panelStyle}>
      {heading}
      <p style={{ margin: '8px 0 0', fontSize: 13, color: 'var(--at-ink-2)', lineHeight: 1.5 }}>
        Estás habilitado. Tus ofertas se registran al instante y son visibles para los demás participantes.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>
        <Stat label="Oferta actual" value={auction.current_bid != null ? fmtPrice(Number(auction.current_bid)) : '—'} />
        <Stat label="Cierra en" value={formatCountdown(ms)} highlight={ms < 60_000} />
      </div>

      <form onSubmit={handleBid}>
        <label style={{ display: 'block', marginTop: 16 }}>
          <span style={panelLabel}>Tu oferta (mínimo {fmtPrice(min)})</span>
          <input type="text" inputMode="numeric" value={fmtPrice(bid)}
            onChange={(e) => setBid(parseMoney(e.target.value, min))}
            style={{
              width: '100%', border: '1px solid var(--at-border)', borderRadius: 14,
              padding: '14px', fontSize: 20, fontWeight: 900, color: 'var(--at-ink)',
              outline: 'none', background: 'var(--at-bg)', boxSizing: 'border-box',
            }} />
        </label>
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          {[1, 2, 3].map(mult => (
            <button key={mult} type="button" onClick={() => setBid(min + inc * (mult - 1))}
              style={{
                flex: 1, border: '1px solid var(--at-border)', background: 'var(--at-bg-2)',
                borderRadius: 999, padding: '9px 8px', fontSize: 11, fontWeight: 900, cursor: 'pointer', fontFamily: 'inherit',
              }}>
              {mult === 1 ? `Mín` : `+${fmtShort(inc * (mult - 1))}`}
            </button>
          ))}
        </div>

        {err && <Banner tone="err">{err}</Banner>}
        {okMsg && <Banner tone="ok">{okMsg}</Banner>}

        <button type="submit" disabled={busy || ms <= 0}
          style={{ ...primaryBtn, opacity: (busy || ms <= 0) ? .55 : 1, marginTop: 14 }}>
          <IconGavel size={16} sw={2} />{busy ? 'Enviando…' : 'Confirmar oferta'}
        </button>
      </form>

      <div style={{ marginTop: 16 }}>
        <div style={{ ...panelLabel, marginBottom: 0 }}>Historial</div>
        <BidHistory bids={bids} currentUserId={user.id} />
      </div>
    </aside>
  );
}

// ----------------------------- side helpers -----------------------------
const panelStyle = {
  marginTop: 24, position: 'sticky', top: 84,
  background: 'var(--at-surface)', border: '1px solid var(--at-border)',
  borderRadius: 18, padding: 18, boxShadow: '0 18px 46px rgba(15,23,42,.08)',
};
const panelLabel = {
  display: 'block', fontSize: 11, color: 'var(--at-ink-3)',
  fontFamily: 'var(--at-mono)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6,
};
const primaryBtn = {
  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  padding: '13px 16px', borderRadius: 14, border: 'none',
  background: 'var(--at-ink)', color: '#fff', fontWeight: 900, cursor: 'pointer', fontFamily: 'inherit',
};
const waBtn = {
  marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
  width: '100%', padding: '13px 16px', borderRadius: 14, background: '#25D366',
  color: '#fff', fontWeight: 900, textDecoration: 'none', boxShadow: '0 12px 28px rgba(37,211,102,.28)',
};

function Stat({ label, value, highlight }) {
  return (
    <div style={{ background: highlight ? '#fef3c7' : 'var(--at-bg-2)', borderRadius: 12, padding: 12 }}>
      <div style={{ ...panelLabel, marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: 'var(--at-display)', fontSize: 18, fontWeight: 900, color: highlight ? '#92400e' : 'var(--at-ink)' }}>{value}</div>
    </div>
  );
}

function Banner({ tone = 'info', children }) {
  const palette = {
    info: { bg: '#eff6ff', fg: '#1e40af' },
    ok:   { bg: '#dcfce7', fg: '#166534' },
    warn: { bg: '#fef3c7', fg: '#92400e' },
    err:  { bg: '#fee2e2', fg: '#991b1b' },
  }[tone] || { bg: '#eff6ff', fg: '#1e40af' };
  return (
    <div style={{ marginTop: 12, padding: 11, borderRadius: 10, background: palette.bg, color: palette.fg, fontSize: 12.5, lineHeight: 1.5 }}>
      {children}
    </div>
  );
}

function SafetyList({ items }) {
  return (
    <div style={{ marginTop: 14, display: 'grid', gap: 7 }}>
      {items.map(item => (
        <div key={item} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12.5, color: 'var(--at-ink-2)' }}>
          <span style={{ width: 18, height: 18, borderRadius: 999, background: 'var(--at-accent-soft)', color: 'var(--at-accent)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <IconCheck size={11} sw={2.4} />
          </span>{item}
        </div>
      ))}
    </div>
  );
}

function DepositButton({ auctionId, amount }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const start = async () => {
    setBusy(true); setErr('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('NO_SESSION');
      const res = await fetch('/api/mp/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ auction_id: auctionId, amount, kind: 'deposit' }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      if (data?.init_point) window.location.href = data.init_point;
      else throw new Error('Sin init_point');
    } catch (e) {
      setErr('MercadoPago no está configurado todavía. Coordiná la seña por WhatsApp.');
      console.warn('MP error', e);
    } finally { setBusy(false); }
  };
  return (
    <>
      <button type="button" onClick={start} disabled={busy} style={{ ...primaryBtn, marginTop: 14, background: '#009ee3', opacity: busy ? .6 : 1 }}>
        {busy ? 'Generando pago…' : `Pagar seña ${fmtPrice(amount)} con MercadoPago`}
      </button>
      {err && <div style={{ marginTop: 8, fontSize: 11.5, color: '#92400e' }}>{err}</div>}
    </>
  );
}

// ----------------------------- main screen -----------------------------
export default function Subastas({ cars = MOCK_CARS }) {
  const navigate = useNavigate();
  const { user, profile, updateProfile, signOut } = useAuth();

  const [authOpen, setAuthOpen] = useState(false);
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => Date.now());
  const [selectedId, setSelectedId] = useState(null);
  const [bids, setBids] = useState([]);
  const [participation, setParticipation] = useState(null);

  // ticking clock for countdowns
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // load auctions (real first, mock fallback)
  const loadAuctions = useCallback(async () => {
    setLoading(true);
    try {
      if (hasSupabaseConfig) {
        const real = await listPublicAuctions();
        if (real.length) {
          setAuctions(real);
          setSelectedId(prev => prev && real.some(a => a.id === prev) ? prev : real[0].id);
          setLoading(false);
          return;
        }
      }
    } catch (e) { console.warn('listPublicAuctions failed', e); }
    const mock = buildMockAuctions(cars);
    setAuctions(mock);
    setSelectedId(prev => prev && mock.some(a => a.id === prev) ? prev : mock[0]?.id);
    setLoading(false);
  }, [cars]);

  useEffect(() => { Promise.resolve().then(loadAuctions); }, [loadAuctions]);

  const selected = useMemo(() => auctions.find(a => a.id === selectedId) || auctions[0] || null, [auctions, selectedId]);

  // load bids + participation for selected
  const loadBids = useCallback(async () => {
    if (!selected || selected._mock) { setBids([]); return; }
    try { setBids(await listBids(selected.id)); } catch (e) { console.warn(e); }
  }, [selected]);

  const loadParticipation = useCallback(async () => {
    if (!selected || selected._mock || !user) { setParticipation(null); return; }
    try { setParticipation(await getMyParticipation(selected.id, user.id)); }
    catch (e) { console.warn(e); }
  }, [selected, user]);

  useEffect(() => { Promise.resolve().then(loadBids); }, [loadBids]);
  useEffect(() => { Promise.resolve().then(loadParticipation); }, [loadParticipation]);

  // realtime
  const subRef = useRef(null);
  useEffect(() => {
    if (!selected || selected._mock) return;
    if (subRef.current) subRef.current();
    subRef.current = subscribeAuction(selected.id, {
      onAuction: (newAuction) => {
        setAuctions(prev => prev.map(a => a.id === newAuction.id ? { ...a, ...newAuction } : a));
      },
      onBid: (newBid) => {
        setBids(prev => [newBid, ...prev].slice(0, 30));
      },
    });
    return () => { if (subRef.current) { subRef.current(); subRef.current = null; } };
  }, [selected]);

  if (!selected) {
    return (
      <div className="pb-[118px] md:pb-0">
        <AppHeader onBack={() => navigate('/')} title="Subastas" />
        <main style={pageWrap}>
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--at-ink-2)' }}>
            {loading ? 'Cargando subastas…' : 'Todavía no hay subastas activas.'}
          </div>
        </main>
      </div>
    );
  }

  const status = deriveStatus(selected, now);
  const ms = new Date(selected.ends_at).getTime() - now;

  const handleSaveProfile = async (patch) => { await updateProfile(patch); };

  const handleRequestParticipation = async () => {
    if (!user) { setAuthOpen(true); return; }
    try {
      const p = await requestParticipation(selected.id, user.id);
      setParticipation(p);
    } catch (e) { console.warn(e); }
  };

  const handlePlaceBid = async (amount) => {
    await placeBid(selected.id, amount);
    // realtime will refresh; also refresh bids defensively
    loadBids();
  };

  const heroBg = selected.cover_url || selected.car?.photoUrls?.[0] || selected.car?.thumbUrl;

  return (
    <div className="pb-[118px] md:pb-0">
      <AppHeader onBack={() => navigate('/')} title="Subastas"
        right={user ? (
          <button onClick={signOut} style={{ background: 'none', border: 'none', color: 'var(--at-ink-2)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
            Salir
          </button>
        ) : (
          <button onClick={() => setAuthOpen(true)} style={{ background: 'var(--at-ink)', color: '#fff', border: 'none', borderRadius: 999, padding: '7px 13px', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>
            Ingresar
          </button>
        )} />

      <section style={{ background: 'var(--at-ink)', color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: `linear-gradient(90deg, rgba(15,23,42,.96) 0%, rgba(15,23,42,.82) 48%, rgba(15,23,42,.72) 100%)${heroBg ? `, url(${heroBg})` : ''}`,
          backgroundSize: 'cover', backgroundPosition: 'center', filter: 'saturate(.95)',
        }} />
        <div style={{ ...pageWrap, position: 'relative', paddingTop: 34, paddingBottom: 34 }}>
          <div className="lg:grid lg:grid-cols-[1fr_460px] lg:gap-12 lg:items-center">
            <div>
              <div style={{ fontFamily: 'var(--at-mono)', fontSize: 10.5, letterSpacing: '.18em', textTransform: 'uppercase', color: '#9db8ff', fontWeight: 800 }}>
                Subastas en vivo · AutosTandil
              </div>
              <h1 style={{
                margin: '10px 0 0', fontFamily: 'var(--at-display)',
                fontSize: 'clamp(34px, 5vw, 64px)', lineHeight: .96,
                letterSpacing: '-.045em', fontWeight: 600, maxWidth: 720,
              }}>
                Ofertá en tiempo real con reglas claras.
              </h1>
              <p style={{ margin: '18px 0 0', maxWidth: 560, fontSize: 15, lineHeight: 1.65, color: 'rgba(255,255,255,.76)' }}>
                Autos curados, identidad verificada, seña reembolsable y cierre coordinado por AutosTandil. Sin sorpresas.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 20 }}>
                <TrustPill icon={<IconShield size={14} sw={2} />}>Seña reembolsable</TrustPill>
                <TrustPill icon={<IconCar size={14} sw={2} />}>Autos verificados</TrustPill>
                <TrustPill icon={<IconLocation size={14} sw={2} />}>Cierre local en Tandil</TrustPill>
              </div>
            </div>

            <div style={{
              marginTop: 24, background: 'rgba(255,255,255,.1)',
              border: '1px solid rgba(255,255,255,.16)', borderRadius: 22, padding: 14,
              boxShadow: '0 28px 80px rgba(0,0,0,.28)', backdropFilter: 'blur(18px)',
            }}>
              <div style={{ borderRadius: 16, overflow: 'hidden' }}>
                <LotImage auction={selected} status={status} large />
              </div>
              <div style={{ padding: '15px 4px 2px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'start' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--at-display)', fontSize: 24, fontWeight: 800, letterSpacing: '-.025em' }}>
                      {selected.title}
                    </div>
                    {selected.car?.km != null && (
                      <div style={{ fontSize: 13, color: 'rgba(255,255,255,.72)', marginTop: 3 }}>
                        {selected.car.year} · {fmtKm(selected.car.km)}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--at-mono)', fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.5)' }}>Cierra</div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', marginTop: 2 }}>
                      {status === 'live' ? formatCountdown(ms) : statusLabel(status)}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16 }}>
                  <div style={{ background: 'rgba(255,255,255,.1)', borderRadius: 14, padding: 12 }}>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,.55)', fontFamily: 'var(--at-mono)', letterSpacing: '.1em', textTransform: 'uppercase' }}>Oferta actual</div>
                    <div style={{ marginTop: 4, fontFamily: 'var(--at-display)', fontSize: 24, fontWeight: 900 }}>
                      {selected.current_bid != null ? fmtPrice(Number(selected.current_bid)) : fmtPrice(Number(selected.starting_price))}
                    </div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,.1)', borderRadius: 14, padding: 12 }}>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,.55)', fontFamily: 'var(--at-mono)', letterSpacing: '.1em', textTransform: 'uppercase' }}>Siguiente mínima</div>
                    <div style={{ marginTop: 4, fontFamily: 'var(--at-display)', fontSize: 24, fontWeight: 900, color: '#9db8ff' }}>
                      {fmtPrice(nextMin(selected))}
                    </div>
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
            <SectionHeader eyebrow="Lotes activos" title={selected._mock ? 'Vista previa de subastas' : 'Subastas curadas'} />
            <div className="lg:grid lg:grid-cols-3" style={{ display: 'grid', gap: 14, marginTop: 16 }}>
              {auctions.map(a => (
                <LotCard key={a.id} auction={a}
                  active={a.id === selected.id}
                  onSelect={() => setSelectedId(a.id)}
                  now={now} />
              ))}
            </div>
          </div>

          <BiddingPanel
            auction={selected} status={status} ms={ms} now={now}
            user={user} profile={profile} participation={participation} bids={bids}
            onLoginClick={() => setAuthOpen(true)}
            onSaveProfile={handleSaveProfile}
            onRequestParticipation={handleRequestParticipation}
            onPlaceBid={handlePlaceBid}
          />
        </section>

        <section style={{ padding: '30px 0 8px' }}>
          <SectionHeader eyebrow="Confianza" title="Cómo funciona la subasta" />
          <div className="grid md:grid-cols-3" style={{ gap: 12, marginTop: 16 }}>
            <ProcessStep number="01" title="Te validamos" desc="Creás cuenta, completás tus datos y dejás una seña reembolsable. En segundos quedás habilitado para ofertar." />
            <ProcessStep number="02" title="Pujás en vivo" desc="Las ofertas se ven al instante. Si alguien puja en los últimos 2 minutos, el cierre se extiende. Sin trampas de último segundo." />
            <ProcessStep number="03" title="Cierre asistido" desc="Al ganar, AutosTandil te contacta para coordinar pago final, transferencia y entrega. La seña va como parte del precio." />
          </div>
        </section>

        <section style={{ padding: '30px 0 8px' }}>
          <div className="lg:grid lg:grid-cols-[1.1fr_.9fr] lg:gap-12 lg:items-center" style={{
            background: 'var(--at-ink)', color: '#fff', borderRadius: 22, padding: '28px 24px', overflow: 'hidden', position: 'relative',
          }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontFamily: 'var(--at-mono)', fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: '#9db8ff', fontWeight: 900 }}>
                ¿Querés subastar tu auto?
              </div>
              <h3 style={{ margin: '8px 0 0', fontFamily: 'var(--at-display)', fontSize: 32, lineHeight: 1.02, fontWeight: 650, letterSpacing: '-.03em' }}>
                Lo preparamos, lo publicamos y administramos las ofertas.
              </h3>
              <p style={{ margin: '12px 0 0', color: 'rgba(255,255,255,.72)', fontSize: 14, lineHeight: 1.6, maxWidth: 580 }}>
                La subasta tiene sentido cuando el auto está bien presentado y los participantes son reales. Por eso filtramos el lote y exigimos seña antes de pujar.
              </p>
            </div>
            <a href={buildWhatsapp(null, 'auction-seller')} target="_blank" rel="noopener noreferrer"
              style={{
                position: 'relative', zIndex: 1, marginTop: 18, display: 'inline-flex', alignItems: 'center',
                justifyContent: 'center', gap: 8, padding: '14px 18px', borderRadius: 999,
                background: '#fff', color: 'var(--at-ink)', fontWeight: 900, textDecoration: 'none',
              }}>
              Quiero subastar mi auto <IconArrowRight size={15} sw={2.4} />
            </a>
          </div>
        </section>
      </main>

      {/* mobile sticky bar */}
      <div className="md:hidden" style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 38,
        padding: '10px 14px calc(env(safe-area-inset-bottom, 0px) + 74px)', pointerEvents: 'none',
      }}>
        <div style={{
          pointerEvents: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 12, padding: '13px 14px', borderRadius: 18,
          background: 'rgba(15,23,42,.94)', color: '#fff', boxShadow: '0 18px 44px rgba(15,23,42,.28)', backdropFilter: 'blur(18px)',
        }}>
          <span>
            <span style={{ display: 'block', fontSize: 10, color: 'rgba(255,255,255,.55)', fontFamily: 'var(--at-mono)', letterSpacing: '.1em', textTransform: 'uppercase' }}>Siguiente oferta</span>
            <strong style={{ display: 'block', marginTop: 2, fontSize: 16 }}>{fmtPrice(nextMin(selected))}</strong>
          </span>
          {selected._mock || !user ? (
            <button onClick={() => setAuthOpen(true)} style={{ background: 'var(--at-accent)', color: '#fff', border: 'none', borderRadius: 999, padding: '10px 14px', fontWeight: 900, fontSize: 12, cursor: 'pointer' }}>
              Participar
            </button>
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: status === 'live' ? '#16a34a' : '#64748b', color: '#fff', borderRadius: 999, padding: '10px 12px', fontWeight: 900, fontSize: 12 }}>
              <IconGavel size={14} sw={2} fill="none" stroke="#fff" />{statusLabel(status)}
            </span>
          )}
        </div>
      </div>

      <style>{`@keyframes at-pulse { 0%,100% { opacity: .9; transform: scale(1) } 50% { opacity: .35; transform: scale(.7) } }`}</style>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
