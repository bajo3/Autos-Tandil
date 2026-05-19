import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fmtPrice, fmtShort, buildWhatsapp } from '../lib/utils';
import { hasSupabaseConfig, supabase } from '../lib/supabase';
import { AppHeader } from '../components/AppHeader';
import { AuthModal } from '../components/AuthModal';
import { ProfileGate } from '../components/ProfileGate';
import { ProgressiveImage } from '../components/ProgressiveImage';
import { useAuth } from '../hooks/useAuth';
import {
  getMyParticipation, listBids, listMyAuctionActivity, listPublicAuctions,
  placeBid, requestParticipation, subscribeAuction,
} from '../services/auctionService';
import {
  IconArrowRight, IconCar, IconCheck, IconClock, IconGavel,
  IconHandshake, IconShield, IconWhatsapp,
} from '../components/Icons';

const pageWrap = { maxWidth: '82rem', margin: '0 auto', padding: '0 16px' };

const navItems = [
  { id: 'subastas', label: 'Lotes', icon: IconCar },
  { id: 'resumen', label: 'Pasos', icon: IconGavel },
  { id: 'pagos', label: 'Pagos', icon: IconShield },
  { id: 'perfil', label: 'Perfil', icon: IconHandshake },
  { id: 'ayuda', label: 'Ayuda', icon: IconWhatsapp },
];

function statusLabel(status) {
  return ({ live: 'En vivo', scheduled: 'Programada', ended: 'Cerrada', cancelled: 'Cancelada', draft: 'Borrador' })[status] || status;
}

function depositLabel(status) {
  return ({
    pending: 'Seña pendiente',
    authorized: 'Autorizado',
    paid: 'Seña pagada',
    refunded: 'Reintegrada',
    forfeited: 'Cerrada',
  })[status] || 'Pendiente';
}

function paymentLabel(status) {
  return ({
    pending: 'Pendiente',
    approved: 'Aprobado',
    rejected: 'Rechazado',
    refunded: 'Reintegrado',
    cancelled: 'Cancelado',
  })[status] || status || 'Pendiente';
}

function formatCountdown(ms) {
  if (ms <= 0) return 'Cerrada';
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  if (days > 0) return `${days}d ${String(h).padStart(2, '0')}h`;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function deriveStatus(auction, now) {
  if (!auction) return 'scheduled';
  if (auction.status === 'cancelled' || auction.status === 'ended') return auction.status;
  if (now < new Date(auction.starts_at).getTime()) return 'scheduled';
  if (now >= new Date(auction.ends_at).getTime()) return 'ended';
  return auction.status === 'live' ? 'live' : auction.status;
}

function nextMin(auction) {
  const inc = Number(auction?.min_increment) || 0;
  if (auction?.current_bid == null) return Number(auction?.starting_price) || 0;
  return Number(auction.current_bid) + inc;
}

function profileReady(profile) {
  return Boolean(profile?.full_name?.trim() && profile?.dni?.trim() && profile?.phone?.trim());
}

function statusTone(status) {
  if (status === 'live') return { bg: '#dcfce7', fg: '#166534' };
  if (status === 'scheduled') return { bg: 'var(--at-accent-soft)', fg: 'var(--at-accent)' };
  if (status === 'ended') return { bg: 'var(--at-bg-2)', fg: 'var(--at-ink-2)' };
  return { bg: '#fee2e2', fg: '#991b1b' };
}

function Card({ children, style }) {
  return (
    <div style={{
      background: 'var(--at-surface)', border: '1px solid var(--at-border)',
      borderRadius: 18, padding: 16, boxShadow: '0 1px 2px rgba(15,23,42,.04)',
      ...style,
    }}>
      {children}
    </div>
  );
}

function Metric({ label, value, tone = 'default' }) {
  const active = tone === 'accent';
  return (
    <Card style={{ background: active ? 'var(--at-ink)' : 'var(--at-surface)', color: active ? '#fff' : 'var(--at-ink)' }}>
      <div style={{ fontFamily: 'var(--at-mono)', fontSize: 10, letterSpacing: '.11em', textTransform: 'uppercase', color: active ? 'rgba(255,255,255,.58)' : 'var(--at-ink-3)' }}>
        {label}
      </div>
      <div style={{ marginTop: 8, fontFamily: 'var(--at-display)', fontSize: 26, fontWeight: 850, letterSpacing: '-.03em' }}>
        {value}
      </div>
    </Card>
  );
}

function NavButton({ item, active, onClick }) {
  const Icon = item.icon;
  return (
    <button type="button" onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 10, width: '100%',
        padding: '11px 12px', borderRadius: 14,
        border: active ? '1px solid var(--at-accent)' : '1px solid transparent',
        background: active ? 'var(--at-accent-soft)' : 'transparent',
        color: active ? 'var(--at-accent)' : 'var(--at-ink-2)',
        fontWeight: 900, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
        whiteSpace: 'nowrap',
      }}>
      <Icon size={17} sw={2.2} />
      {item.label}
    </button>
  );
}

function AuctionCard({ auction, participation, active, onSelect, now }) {
  const cover = auction.cover_url || auction.car?.photoUrls?.[0] || auction.car?.thumbUrl;
  const displayStatus = deriveStatus(auction, now);
  const tone = statusTone(displayStatus);
  return (
    <button type="button" onClick={onSelect} style={{
      width: '100%', display: 'grid', gridTemplateColumns: '96px 1fr', gap: 12, alignItems: 'center',
      padding: 10, border: `1px solid ${active ? 'var(--at-accent)' : 'var(--at-border)'}`, borderRadius: 16,
      textDecoration: 'none', background: active ? 'var(--at-accent-soft)' : 'var(--at-surface)',
      textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
      boxShadow: active ? '0 16px 36px rgba(0,68,255,.12)' : '0 1px 2px rgba(15,23,42,.04)',
    }}>
      <div style={{ width: 96, aspectRatio: '4/3', borderRadius: 12, overflow: 'hidden', background: 'var(--at-bg-2)' }}>
        <ProgressiveImage src={cover} alt={auction.title} loading="lazy" style={{ width: '100%', height: '100%' }} />
      </div>
      <div style={{ minWidth: 0 }}>
        <span style={{ display: 'inline-flex', borderRadius: 999, padding: '3px 8px', background: tone.bg, color: tone.fg, fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '.08em' }}>
          {statusLabel(displayStatus)}
        </span>
        <strong style={{ display: 'block', color: 'var(--at-ink)', fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {auction.title}
        </strong>
        <span style={{ display: 'block', marginTop: 5, color: 'var(--at-ink-2)', fontSize: 12, lineHeight: 1.35 }}>
          Base {fmtShort(Number(auction.starting_price))} · Seña {fmtShort(Number(auction.deposit_amount))}
        </span>
        <span style={{ display: 'block', marginTop: 4, color: participation ? 'var(--at-accent)' : 'var(--at-ink-3)', fontFamily: 'var(--at-mono)', fontSize: 11 }}>
          {participation ? depositLabel(participation.deposit_status) : 'Tocá para ver reglas'}
        </span>
      </div>
    </button>
  );
}

function HowItWorksCard({ compact = false }) {
  const steps = [
    ['1', 'Elegís lote', 'Abrís la subasta que te interesa.'],
    ['2', 'Validás datos', 'Nombre, DNI y celular.'],
    ['3', 'Pagás seña', 'La seña habilita la participación.'],
    ['4', 'Ofertás', 'Si ganás, coordinamos el cierre.'],
  ];
  return (
    <Card style={{ background: compact ? 'var(--at-surface)' : 'linear-gradient(135deg, var(--at-ink), #172033)', color: compact ? 'var(--at-ink)' : '#fff' }}>
      <div style={{ display: 'grid', gap: 10 }}>
        <div>
          <div style={{ fontFamily: 'var(--at-mono)', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: compact ? 'var(--at-accent)' : '#9db8ff', fontWeight: 900 }}>
            Cómo participar
          </div>
          <h2 style={{ margin: '5px 0 0', fontFamily: 'var(--at-display)', fontSize: compact ? 22 : 28, lineHeight: 1.05 }}>
            Simple: lote, seña y oferta.
          </h2>
        </div>
        <div className="grid sm:grid-cols-4" style={{ gap: 8 }}>
          {steps.map(([n, title, text]) => (
            <div key={n} style={{ borderRadius: 14, padding: 12, background: compact ? 'var(--at-bg-2)' : 'rgba(255,255,255,.08)', border: compact ? '1px solid var(--at-border)' : '1px solid rgba(255,255,255,.12)' }}>
              <span style={{ width: 24, height: 24, borderRadius: 999, display: 'grid', placeItems: 'center', background: compact ? 'var(--at-ink)' : '#fff', color: compact ? '#fff' : 'var(--at-ink)', fontWeight: 900, fontSize: 12 }}>{n}</span>
              <strong style={{ display: 'block', marginTop: 8, fontSize: 13 }}>{title}</strong>
              <span style={{ display: 'block', marginTop: 3, color: compact ? 'var(--at-ink-2)' : 'rgba(255,255,255,.68)', fontSize: 12, lineHeight: 1.35 }}>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function EmptyState({ title, text, action }) {
  return (
    <div style={{ padding: 18, borderRadius: 16, background: 'var(--at-bg-2)', color: 'var(--at-ink-2)', fontSize: 13, lineHeight: 1.55 }}>
      <strong style={{ display: 'block', color: 'var(--at-ink)', fontSize: 15 }}>{title}</strong>
      <span style={{ display: 'block', marginTop: 5 }}>{text}</span>
      {action}
    </div>
  );
}

function DepositButton({ auctionId, amount, onDone }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const start = async () => {
    setBusy(true); setErr('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('NO_SESSION');
      const res = await fetch('/api/mp/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ auction_id: auctionId, amount, kind: 'deposit' }),
      });
      const raw = await res.text();
      let data = {};
      try { data = raw ? JSON.parse(raw) : {}; }
      catch { data = { error: raw || 'INVALID_RESPONSE' }; }
      if (!res.ok) {
        const detail = data?.detail?.message || data?.detail?.error || data?.detail || data?.error || 'MP_ERROR';
        throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail));
      }
      if (data?.init_point) window.location.href = data.init_point;
      else throw new Error('Sin init_point');
      onDone?.();
    } catch (e) {
      console.warn('MP error', e);
      setErr(`MercadoPago no pudo iniciar el pago: ${e?.message || 'reintentá en unos segundos'}.`);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <button type="button" onClick={start} disabled={busy} style={{ ...pillLink, width: '100%', background: '#009ee3', opacity: busy ? .6 : 1 }}>
        {busy ? 'Generando pago...' : `Pagar seña ${fmtPrice(amount)}`}
      </button>
      {err && <div style={{ marginTop: 8, color: '#92400e', fontSize: 12 }}>{err}</div>}
    </>
  );
}

function AuctionWorkspace({
  auction, user, profile, participation, bids, now, onLogin, onProfileSave,
  onRequest, onBid, onRefresh,
}) {
  const [bid, setBid] = useState(() => nextMin(auction));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');

  useEffect(() => {
    Promise.resolve().then(() => {
      setBid(nextMin(auction));
      setErr('');
      setOk('');
    });
  }, [auction]);

  if (!auction) {
    return (
      <Card>
        <EmptyState title="Sin subasta seleccionada" text="Elegí un lote real desde el listado para ver reglas, seña y ofertas." />
      </Card>
    );
  }

  const status = deriveStatus(auction, now);
  const ms = new Date(auction.ends_at).getTime() - now;
  const min = nextMin(auction);
  const ready = profileReady(profile);
  const cover = auction.cover_url || auction.car?.photoUrls?.[0] || auction.car?.thumbUrl;

  const submitBid = async (event) => {
    event.preventDefault();
    if (Number(bid) < min) {
      setErr(`La oferta mínima es ${fmtPrice(min)}.`);
      return;
    }
    setBusy(true); setErr(''); setOk('');
    try {
      await onBid(Number(bid));
      setOk('Oferta registrada.');
    } catch (e) {
      const msg = e?.message || '';
      if (msg.includes('NOT_APPROVED')) setErr('Tu participación todavía no está aprobada.');
      else if (msg.includes('BID_TOO_LOW')) setErr(`La oferta es menor al mínimo (${fmtPrice(min)}).`);
      else if (msg.includes('AUCTION_NOT_LIVE') || msg.includes('OUT_OF_WINDOW')) setErr('La subasta no está activa.');
      else setErr('No se pudo registrar la oferta.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card style={{ display: 'grid', gap: 14 }}>
      <div style={{ borderRadius: 16, overflow: 'hidden', background: 'var(--at-bg-2)', aspectRatio: '16/9' }}>
        <ProgressiveImage src={cover} alt={auction.title} loading="eager" style={{ width: '100%', height: '100%' }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'start', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: 'var(--at-mono)', color: 'var(--at-accent)', letterSpacing: '.13em', textTransform: 'uppercase', fontSize: 10, fontWeight: 900 }}>
            {statusLabel(status)}
          </div>
          <h2 style={{ margin: '5px 0 0', fontFamily: 'var(--at-display)', fontSize: 28, color: 'var(--at-ink)', letterSpacing: '-.03em' }}>
            {auction.title}
          </h2>
          {auction.description && <p style={{ margin: '8px 0 0', color: 'var(--at-ink-2)', fontSize: 13, lineHeight: 1.55 }}>{auction.description}</p>}
        </div>
        <button type="button" onClick={onRefresh} style={smallGhost}>Actualizar</button>
      </div>

      <div className="grid sm:grid-cols-3" style={{ gap: 10 }}>
        <Metric label="Oferta actual" value={auction.current_bid != null ? fmtPrice(Number(auction.current_bid)) : fmtPrice(Number(auction.starting_price))} />
        <Metric label="Siguiente mínima" value={fmtPrice(min)} tone="accent" />
        <Metric label="Cierre" value={status === 'live' ? formatCountdown(ms) : statusLabel(status)} />
      </div>

      {!user && (
        <EmptyState
          title="Ingresá para participar"
          text="Desde este mismo panel podés crear cuenta, validar datos, señar y ofertar."
          action={<button type="button" onClick={() => onLogin('signin')} style={pillLink}>Ingresar / Crear cuenta</button>}
        />
      )}

      {user && !ready && (
        <div>
          <h3 style={{ margin: '0 0 8px', fontFamily: 'var(--at-display)', fontSize: 20, color: 'var(--at-ink)' }}>Validación requerida</h3>
          <ProfileGate profile={profile} onSave={onProfileSave} />
        </div>
      )}

      {user && ready && !participation && (
        <EmptyState
          title="Pedí habilitación"
          text={`La seña para este lote es de ${fmtPrice(Number(auction.deposit_amount))}. Queda vinculada a tu cuenta.`}
          action={<button type="button" onClick={onRequest} style={pillLink}>Pedir habilitación</button>}
        />
      )}

      {user && ready && participation?.deposit_status === 'pending' && (
        <div>
          <EmptyState title="Falta confirmar la seña" text="Cuando el pago quede aprobado, se habilita la puja en este panel." />
          <DepositButton auctionId={auction.id} amount={Number(auction.deposit_amount)} onDone={onRefresh} />
        </div>
      )}

      {user && ready && ['authorized', 'paid'].includes(participation?.deposit_status) && status === 'live' && (
        <form onSubmit={submitBid} style={{ display: 'grid', gap: 10 }}>
          <label style={{ display: 'grid', gap: 6, fontSize: 11, color: 'var(--at-ink-3)', fontFamily: 'var(--at-mono)', letterSpacing: '.1em', textTransform: 'uppercase' }}>
            Tu oferta
            <input type="number" value={bid} min={min} step={Number(auction.min_increment) || 1}
              onChange={(e) => setBid(e.target.value)}
              style={{ width: '100%', border: '1px solid var(--at-border)', borderRadius: 14, padding: 14, fontSize: 20, fontWeight: 900, color: 'var(--at-ink)', background: 'var(--at-bg)', boxSizing: 'border-box' }} />
          </label>
          {err && <div style={alertErr}>{err}</div>}
          {ok && <div style={alertOk}>{ok}</div>}
          <button disabled={busy} style={{ ...pillLink, width: '100%', opacity: busy ? .6 : 1 }}>
            {busy ? 'Enviando...' : 'Confirmar oferta'}
          </button>
        </form>
      )}

      {user && ready && ['authorized', 'paid'].includes(participation?.deposit_status) && status !== 'live' && (
        <EmptyState title="Subasta no activa" text={status === 'scheduled' ? 'Cuando llegue el horario de inicio vas a poder ofertar acá.' : 'Esta subasta ya cerró.'} />
      )}

      <div>
        <h3 style={{ margin: '0 0 10px', fontFamily: 'var(--at-display)', fontSize: 20, color: 'var(--at-ink)' }}>Historial de ofertas</h3>
        {bids.length ? (
          <div style={{ display: 'grid', gap: 7 }}>
            {bids.slice(0, 8).map((b, index) => (
              <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '10px 12px', borderRadius: 12, background: index === 0 ? 'var(--at-accent-soft)' : 'var(--at-bg-2)' }}>
                <span style={{ color: 'var(--at-ink-2)', fontSize: 12, fontFamily: 'var(--at-mono)' }}>{b.user_id === user?.id ? 'Vos' : `Postor ${b.user_id.slice(0, 4).toUpperCase()}`}</span>
                <strong style={{ color: 'var(--at-ink)' }}>{fmtPrice(Number(b.amount))}</strong>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="Sin ofertas todavía" text="Cuando haya pujas reales, se van a ver acá." />
        )}
      </div>
    </Card>
  );
}

export default function SubastasPanel() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, updateProfile, signOut } = useAuth();
  const [active, setActive] = useState('subastas');
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signin');
  const [auctions, setAuctions] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [auctionLoading, setAuctionLoading] = useState(true);
  const [activity, setActivity] = useState({ participations: [], payments: [] });
  const [activityLoading, setActivityLoading] = useState(false);
  const [participation, setParticipation] = useState(null);
  const [bids, setBids] = useState([]);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const resetFromEmail = new URLSearchParams(location.search).get('reset') === '1' || location.hash.includes('type=recovery');
    if (resetFromEmail) {
      Promise.resolve().then(() => {
        setAuthMode('reset');
        setAuthOpen(true);
      });
    }
  }, [location.search, location.hash]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const openAuth = (mode) => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  const loadAuctions = useCallback(async () => {
    setAuctionLoading(true);
    try {
      const real = hasSupabaseConfig ? await listPublicAuctions() : [];
      setAuctions(real);
      setSelectedId(prev => prev && real.some(a => a.id === prev) ? prev : real[0]?.id || null);
    } catch (e) {
      console.warn('panel auctions failed', e);
      setAuctions([]);
      setSelectedId(null);
    } finally {
      setAuctionLoading(false);
    }
  }, []);

  const loadActivity = useCallback(async () => {
    if (!user) {
      setActivity({ participations: [], payments: [] });
      return;
    }
    setActivityLoading(true);
    try { setActivity(await listMyAuctionActivity(user.id)); }
    catch (e) { console.warn('panel activity failed', e); }
    finally { setActivityLoading(false); }
  }, [user]);

  useEffect(() => { Promise.resolve().then(loadAuctions); }, [loadAuctions]);
  useEffect(() => { Promise.resolve().then(loadActivity); }, [loadActivity]);

  const selected = useMemo(() => auctions.find(a => a.id === selectedId) || auctions[0] || null, [auctions, selectedId]);

  const loadSelected = useCallback(async () => {
    if (!selected || !hasSupabaseConfig) {
      setParticipation(null);
      setBids([]);
      return;
    }
    try {
      const [nextBids, nextParticipation] = await Promise.all([
        listBids(selected.id),
        user ? getMyParticipation(selected.id, user.id) : Promise.resolve(null),
      ]);
      setBids(nextBids);
      setParticipation(nextParticipation);
    } catch (e) {
      console.warn('selected auction failed', e);
    }
  }, [selected, user]);

  useEffect(() => { Promise.resolve().then(loadSelected); }, [loadSelected]);

  useEffect(() => {
    if (!selected || !hasSupabaseConfig) return undefined;
    const unsubscribe = subscribeAuction(selected.id, {
      onAuction: (nextAuction) => setAuctions(prev => prev.map(a => a.id === nextAuction.id ? { ...a, ...nextAuction } : a)),
      onBid: (bid) => setBids(prev => [bid, ...prev].slice(0, 30)),
    });
    return unsubscribe;
  }, [selected]);

  const participations = activity.participations || [];
  const payments = activity.payments || [];
  const auctionById = useMemo(() => new Map(auctions.map(auction => [auction.id, auction])), [auctions]);
  const sortedAuctions = useMemo(() => [...auctions].sort((a, b) => {
    const rank = { live: 0, scheduled: 1, ended: 2, cancelled: 3, draft: 4 };
    return (rank[deriveStatus(a, now)] ?? 9) - (rank[deriveStatus(b, now)] ?? 9)
      || new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime();
  }), [auctions, now]);
  const myActive = participations.filter(item => ['pending', 'authorized', 'paid'].includes(item.deposit_status));
  const paidDeposits = payments.filter(payment => payment.kind === 'deposit' && payment.status === 'approved');
  const ready = profileReady(profile);

  const handleRequest = async () => {
    if (!user) {
      openAuth('signin');
      return;
    }
    if (!selected) return;
    const next = await requestParticipation(selected.id, user.id);
    setParticipation(next);
    await loadActivity();
  };

  const handleBid = async (amount) => {
    if (!selected) return;
    await placeBid(selected.id, amount);
    await Promise.all([loadAuctions(), loadSelected(), loadActivity()]);
  };

  const showAuctions = () => setActive('subastas');
  const handleSignOut = async () => {
    await signOut();
    setActive('subastas');
    setParticipation(null);
    setBids([]);
  };

  const content = {
    resumen: (
      <div style={{ display: 'grid', gap: 14 }}>
        <HowItWorksCard />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4" style={{ gap: 10 }}>
          <Metric label="Perfil" value={user ? ready ? 'Completo' : 'Pendiente' : 'Sin sesión'} tone={user && !ready ? 'accent' : 'default'} />
          <Metric label="Participaciones" value={activityLoading ? '...' : myActive.length} />
          <Metric label="Señas pagas" value={activityLoading ? '...' : paidDeposits.length} />
          <Metric label="Subastas reales" value={auctionLoading ? '...' : auctions.length} />
        </div>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ margin: 0, fontFamily: 'var(--at-display)', fontSize: 22, color: 'var(--at-ink)' }}>Próximas acciones</h2>
            <button type="button" onClick={showAuctions} style={linkButton}>Ver lotes</button>
          </div>
          <div style={{ display: 'grid', gap: 9 }}>
            <Step done={Boolean(user)} text="Cuenta creada e iniciada" />
            <Step done={!user || ready} text="Datos personales completos" />
            <Step done={myActive.length > 0} text="Participación solicitada en una subasta" />
            <Step done={paidDeposits.length > 0} text="Seña confirmada por MercadoPago o administración" />
          </div>
        </Card>

        {!user && (
          <Card style={{ background: 'var(--at-surface)' }}>
            <div style={{ fontFamily: 'var(--at-mono)', color: 'var(--at-accent)', letterSpacing: '.16em', textTransform: 'uppercase', fontSize: 10, fontWeight: 900 }}>
              Panel de subastas reales
            </div>
            <h2 style={{ margin: '8px 0 0', fontFamily: 'var(--at-display)', fontSize: 'clamp(32px, 7vw, 52px)', lineHeight: 1, letterSpacing: '-.045em', color: 'var(--at-ink)' }}>
              Todo pasa acá: lotes, señas y ofertas.
            </h2>
            <p style={{ margin: '14px 0 0', color: 'var(--at-ink-2)', maxWidth: 620, lineHeight: 1.6, fontSize: 14 }}>
              Entrá para participar. Igual podés ver las subastas reales disponibles desde este mismo panel.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 20 }}>
              <button type="button" onClick={() => openAuth('signin')} style={lightBtn}>Acceder al panel</button>
              <button type="button" onClick={() => openAuth('signup')} style={ghostBtn}>Abrir cuenta</button>
            </div>
          </Card>
        )}

        {user && !ready && (
          <Card>
            <h2 style={{ margin: 0, fontFamily: 'var(--at-display)', fontSize: 24, color: 'var(--at-ink)' }}>Validá tus datos</h2>
            <p style={{ margin: '8px 0 14px', color: 'var(--at-ink-2)', fontSize: 13, lineHeight: 1.6 }}>
              Con nombre, documento y teléfono te podemos habilitar para señas, ofertas y cierre de operación.
            </p>
            <ProfileGate profile={profile} onSave={updateProfile} />
          </Card>
        )}
      </div>
    ),
    subastas: (
      <div className="lg:grid lg:grid-cols-[.95fr_1.2fr]" style={{ gap: 14, alignItems: 'start' }}>
        <div style={{ display: 'grid', gap: 14 }}>
          <HowItWorksCard compact />

          <Card>
            <h2 style={{ margin: 0, fontFamily: 'var(--at-display)', fontSize: 22, color: 'var(--at-ink)' }}>Tus participaciones</h2>
            <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
              {activityLoading ? (
                <div className="skel" style={{ height: 96, borderRadius: 14 }} />
              ) : myActive.length ? (
                myActive.map(item => {
                  const auction = auctionById.get(item.auction_id);
                  return auction ? <AuctionCard key={item.id} auction={auction} participation={item} active={selected?.id === auction.id} onSelect={() => setSelectedId(auction.id)} now={now} /> : null;
                })
              ) : (
                <EmptyState
                  title="Todavía no estás en una subasta"
                  text="Elegí un lote real, pedí habilitación y seguí todo desde este panel."
                  action={<button type="button" onClick={showAuctions} style={pillLink}>Elegir lote <IconArrowRight size={14} sw={2.4} /></button>}
                />
              )}
            </div>
          </Card>

          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline', flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, fontFamily: 'var(--at-display)', fontSize: 22, color: 'var(--at-ink)' }}>Lotes disponibles</h2>
              <span style={{ fontFamily: 'var(--at-mono)', fontSize: 11, color: 'var(--at-ink-3)' }}>{sortedAuctions.length} publicados</span>
            </div>
            <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
              {auctionLoading ? (
                <div className="skel" style={{ height: 120, borderRadius: 14 }} />
              ) : sortedAuctions.length ? sortedAuctions.map(auction => (
                <AuctionCard key={auction.id} auction={auction} participation={participations.find(p => p.auction_id === auction.id)} active={selected?.id === auction.id} onSelect={() => setSelectedId(auction.id)} now={now} />
              )) : (
                <EmptyState title="No hay subastas publicadas" text="Cuando el admin cree una subasta programada o en vivo, aparece acá. No mostramos demos." />
              )}
            </div>
          </Card>
        </div>

        <AuctionWorkspace
          auction={selected}
          user={user}
          profile={profile}
          participation={participation}
          bids={bids}
          now={now}
          onLogin={openAuth}
          onProfileSave={updateProfile}
          onRequest={handleRequest}
          onBid={handleBid}
          onRefresh={() => Promise.all([loadAuctions(), loadSelected(), loadActivity()])}
        />
      </div>
    ),
    pagos: (
      <Card>
        <h2 style={{ margin: 0, fontFamily: 'var(--at-display)', fontSize: 22, color: 'var(--at-ink)' }}>Pagos y señas</h2>
        <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
          {activityLoading ? (
            <div className="skel" style={{ height: 108, borderRadius: 14 }} />
          ) : payments.length ? payments.map(payment => (
            <div key={payment.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'center', borderTop: '1px solid var(--at-border)', padding: '12px 0' }}>
              <span>
                <strong style={{ color: 'var(--at-ink)', display: 'block' }}>{payment.kind === 'deposit' ? 'Seña' : 'Pago final'}</strong>
                <span style={{ color: 'var(--at-ink-3)', fontSize: 12, fontFamily: 'var(--at-mono)' }}>{paymentLabel(payment.status)}</span>
              </span>
              <strong style={{ color: 'var(--at-ink)' }}>{fmtPrice(Number(payment.amount))}</strong>
            </div>
          )) : (
            <EmptyState title="Sin pagos todavía" text="Cuando confirmes una seña, el estado aparece acá junto con el monto y resultado." />
          )}
        </div>
      </Card>
    ),
    perfil: (
      <Card>
        <h2 style={{ margin: 0, fontFamily: 'var(--at-display)', fontSize: 22, color: 'var(--at-ink)' }}>Datos de cuenta</h2>
        <p style={{ margin: '8px 0 14px', color: 'var(--at-ink-2)', fontSize: 13, lineHeight: 1.6 }}>
          Mantené estos datos actualizados para que el alta, la seña y el cierre de compra no se traben.
        </p>
        {user ? <ProfileGate profile={profile} onSave={updateProfile} /> : <button type="button" onClick={() => openAuth('signin')} style={pillLink}>Ingresar para editar perfil</button>}
      </Card>
    ),
    ayuda: (
      <div style={{ display: 'grid', gap: 14 }}>
        <Card>
          <h2 style={{ margin: 0, fontFamily: 'var(--at-display)', fontSize: 22, color: 'var(--at-ink)' }}>Ayuda directa</h2>
          <p style={{ margin: '8px 0 14px', color: 'var(--at-ink-2)', fontSize: 13, lineHeight: 1.6 }}>
            Si una seña quedó pendiente, no recibiste el email o necesitás coordinar entrega, hablá con AutosTandil.
          </p>
          <a href={buildWhatsapp(null, 'auction-help')} target="_blank" rel="noopener noreferrer" style={{ ...pillLink, background: '#25D366' }}>
            <IconWhatsapp size={16} fill="#fff" /> WhatsApp
          </a>
        </Card>
        <Card>
          <h3 style={{ margin: 0, fontFamily: 'var(--at-display)', fontSize: 19, color: 'var(--at-ink)' }}>Reglas rápidas</h3>
          <div style={{ marginTop: 12, display: 'grid', gap: 9 }}>
            <Step done text="La seña habilita la participación y se descuenta si ganás." />
            <Step done text="Si no ganás, la seña se reintegra según el estado administrativo." />
            <Step done text="El cierre de compra se coordina con AutosTandil." />
          </div>
        </Card>
      </div>
    ),
  };

  return (
    <div className="pb-[118px] md:pb-0" style={{ minHeight: '100vh', background: 'var(--at-bg)' }}>
      <AppHeader onBack={() => navigate('/')} title="Subastas" />

      <main style={{ ...pageWrap, paddingTop: 18, paddingBottom: 34 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'end', flexWrap: 'wrap', marginBottom: 14 }}>
          <div>
            <div style={{ fontFamily: 'var(--at-mono)', color: 'var(--at-accent)', letterSpacing: '.15em', textTransform: 'uppercase', fontSize: 10, fontWeight: 900 }}>
              Panel de subastas
            </div>
            <h1 style={{ margin: '6px 0 0', fontFamily: 'var(--at-display)', fontSize: 'clamp(30px, 6vw, 48px)', lineHeight: 1, letterSpacing: '-.04em', color: 'var(--at-ink)' }}>
              Subastas reales
            </h1>
            <p style={{ margin: '8px 0 0', color: 'var(--at-ink-2)', fontSize: 13 }}>
              {user ? `Sesión: ${user.email}` : 'Lotes reales, participación y ofertas desde una sola pantalla.'}
            </p>
          </div>
          <button type="button" onClick={showAuctions} style={{ ...pillLink, marginTop: 0 }}>
            Ver subastas <IconArrowRight size={14} sw={2.4} />
          </button>
        </div>

        <div className="flex md:hidden" style={{ gap: 8, overflowX: 'auto', padding: '4px 0 12px', position: 'sticky', top: 0, zIndex: 12, background: 'var(--at-bg)' }}>
          {navItems.map(item => <NavButton key={item.id} item={item} active={active === item.id} onClick={() => setActive(item.id)} />)}
          {user ? (
            <button type="button" onClick={handleSignOut} style={menuActionBtn}>Cerrar sesión</button>
          ) : (
            <button type="button" onClick={() => openAuth('signin')} style={menuActionBtn}>Ingresar</button>
          )}
        </div>

        <div className="md:grid md:grid-cols-[230px_1fr] md:gap-18 lg:gap-24" style={{ alignItems: 'start' }}>
          <aside className="hidden md:block" style={{ position: 'sticky', top: 82 }}>
            <Card style={{ padding: 10 }}>
              {navItems.map(item => <NavButton key={item.id} item={item} active={active === item.id} onClick={() => setActive(item.id)} />)}
              {user ? (
                <button type="button" onClick={handleSignOut} style={menuActionBtn}>Cerrar sesión</button>
              ) : (
                <button type="button" onClick={() => openAuth('signin')} style={menuActionBtn}>Ingresar</button>
              )}
            </Card>
            <Card style={{ marginTop: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, color: 'var(--at-ink)' }}>
                <IconClock size={17} sw={2.2} />
                <strong style={{ fontSize: 13 }}>Soporte rápido</strong>
              </div>
              <a href={buildWhatsapp(null, 'auction-help')} target="_blank" rel="noopener noreferrer" style={{ ...pillLink, width: '100%', marginTop: 12 }}>
                WhatsApp
              </a>
            </Card>
          </aside>

          <section data-testid="auction-client-panel">
            {content[active]}
          </section>
        </div>
      </main>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} mode={authMode} />
    </div>
  );
}

function Step({ done, text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, color: 'var(--at-ink-2)', fontSize: 13 }}>
      <span style={{
        width: 22, height: 22, borderRadius: 999, display: 'grid', placeItems: 'center', flexShrink: 0,
        background: done ? '#dcfce7' : 'var(--at-bg-2)', color: done ? '#166534' : 'var(--at-ink-3)',
      }}>
        <IconCheck size={13} sw={2.4} />
      </span>
      {text}
    </div>
  );
}

const pillLink = {
  marginTop: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  padding: '11px 14px', borderRadius: 999, border: 'none',
  background: 'var(--at-accent)', color: '#fff', fontWeight: 900, textDecoration: 'none',
  fontSize: 13, fontFamily: 'inherit', cursor: 'pointer',
};

const linkButton = {
  background: 'none', border: 'none', color: 'var(--at-accent)', fontWeight: 900,
  fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', padding: 0,
};

const smallGhost = {
  border: '1px solid var(--at-border)', borderRadius: 999, padding: '9px 12px',
  background: 'var(--at-bg-2)', color: 'var(--at-ink)', fontWeight: 900,
  fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
};

const menuActionBtn = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  width: '100%', padding: '11px 12px', borderRadius: 14,
  border: '1px solid var(--at-border)', background: 'var(--at-ink)',
  color: '#fff', fontWeight: 900, fontSize: 13, cursor: 'pointer',
  fontFamily: 'inherit', whiteSpace: 'nowrap',
};

const lightBtn = {
  ...pillLink, marginTop: 0, background: '#fff', color: 'var(--at-ink)',
};

const ghostBtn = {
  ...pillLink, marginTop: 0, background: 'rgba(255,255,255,.12)', color: '#fff',
  border: '1px solid rgba(255,255,255,.22)',
};

const alertErr = {
  padding: 10, borderRadius: 10, background: '#fee2e2', color: '#991b1b', fontSize: 12,
};

const alertOk = {
  padding: 10, borderRadius: 10, background: '#dcfce7', color: '#166534', fontSize: 12,
};
