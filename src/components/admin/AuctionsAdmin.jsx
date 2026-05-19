import { useEffect, useMemo, useState, useCallback } from 'react';
import { AUCTION_MIN_DEPOSIT, fmtPrice } from '../../lib/utils';
import {
  listAllAuctions, createAuction, updateAuction, deleteAuction,
  listAuctionParticipants, setParticipantStatus, closeAuction,
} from '../../services/auctionService';

const card = {
  background: 'var(--at-surface)', border: '1px solid var(--at-border)',
  borderRadius: 12, boxShadow: '0 14px 36px -28px rgba(15,23,42,.45)',
};
const field = {
  width: '100%', border: '1px solid var(--at-border)', background: 'var(--at-surface)',
  color: 'var(--at-ink)', borderRadius: 8, padding: '10px 11px', fontSize: 13,
  fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
};
const lbl = {
  display: 'grid', gap: 6, fontSize: 11, color: 'var(--at-ink-3)',
  fontFamily: 'var(--at-mono)', textTransform: 'uppercase', letterSpacing: '.1em',
};
const btn = {
  border: 'none', borderRadius: 8, padding: '10px 12px', fontSize: 12,
  fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit',
};
const primary = { ...btn, background: 'var(--at-accent)', color: '#fff' };
const ghost = { ...btn, background: 'var(--at-bg-2)', color: 'var(--at-ink)' };
const danger = { ...btn, background: '#fee2e2', color: '#991b1b' };

const STATUS_OPTIONS = [
  ['draft', 'Borrador'],
  ['scheduled', 'Programada'],
  ['live', 'En vivo'],
  ['ended', 'Cerrada'],
  ['cancelled', 'Cancelada'],
];

const PARTICIPANT_STATUS = [
  ['pending', 'Pendiente'],
  ['authorized', 'Autorizado'],
  ['paid', 'Seña pagada'],
  ['refunded', 'Reintegrada'],
  ['forfeited', 'Perdida'],
];

function toLocalInput(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function emptyAuction(cars) {
  const car = cars?.[0];
  const now = new Date();
  const ends = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 3);
  return {
    car_id: car?.id || '',
    title: car ? `${car.brand} ${car.model} ${car.version || ''}`.trim() : '',
    description: '',
    cover_url: car?.photoUrls?.[0] || car?.thumbUrl || '',
    starting_price: car ? Math.round(car.price * 0.7) : 1000000,
    min_increment: 100000,
    reserve_price: '',
    deposit_amount: AUCTION_MIN_DEPOSIT,
    starts_at: toLocalInput(now),
    ends_at: toLocalInput(ends),
    anti_snipe_seconds: 120,
    status: 'scheduled',
  };
}

function AuctionForm({ initial, cars, onSave, onCancel }) {
  const [val, setVal] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const set = (k, v) => setVal(prev => ({ ...prev, [k]: v }));

  const onCarPick = (id) => {
    const car = cars.find(c => c.id === id);
    setVal(prev => ({
      ...prev,
      car_id: id,
      title: car ? `${car.brand} ${car.model} ${car.version || ''}`.trim() : prev.title,
      cover_url: car?.photoUrls?.[0] || car?.thumbUrl || prev.cover_url,
      starting_price: car && !prev.starting_price ? Math.round(car.price * 0.7) : prev.starting_price,
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true); setErr('');
    try {
      const payload = {
        ...val,
        starting_price: Number(val.starting_price),
        min_increment: Number(val.min_increment),
        reserve_price: val.reserve_price === '' ? null : Number(val.reserve_price),
        deposit_amount: Math.max(AUCTION_MIN_DEPOSIT, Number(val.deposit_amount)),
        anti_snipe_seconds: Number(val.anti_snipe_seconds),
        starts_at: new Date(val.starts_at).toISOString(),
        ends_at: new Date(val.ends_at).toISOString(),
      };
      await onSave(payload);
    } catch (e) { setErr(e?.message || 'No se pudo guardar.'); }
    finally { setBusy(false); }
  };

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
      <section style={{ ...card, padding: 16, display: 'grid', gap: 10 }}>
        <h3 style={{ margin: 0, fontFamily: 'var(--at-display)', fontSize: 18 }}>Datos del lote</h3>
        <label style={lbl}>Auto del inventario
          <select style={field} value={val.car_id} onChange={(e) => onCarPick(e.target.value)}>
            <option value="">— Sin vincular —</option>
            {cars.map(c => <option key={c.id} value={c.id}>{c.brand} {c.model} {c.version} ({c.year})</option>)}
          </select>
        </label>
        <label style={lbl}>Título<input style={field} required value={val.title} onChange={(e) => set('title', e.target.value)} /></label>
        <label style={lbl}>Descripción
          <textarea style={{ ...field, minHeight: 90, resize: 'vertical' }} value={val.description} onChange={(e) => set('description', e.target.value)} />
        </label>
        <label style={lbl}>URL de portada<input style={field} value={val.cover_url} onChange={(e) => set('cover_url', e.target.value)} /></label>
      </section>

      <section style={{ ...card, padding: 16, display: 'grid', gap: 10 }}>
        <h3 style={{ margin: 0, fontFamily: 'var(--at-display)', fontSize: 18 }}>Reglas</h3>
        <div className="grid md:grid-cols-3" style={{ display: 'grid', gap: 10 }}>
          <label style={lbl}>Precio base<input style={field} type="number" required value={val.starting_price} onChange={(e) => set('starting_price', e.target.value)} /></label>
          <label style={lbl}>Incremento mínimo<input style={field} type="number" required value={val.min_increment} onChange={(e) => set('min_increment', e.target.value)} /></label>
          <label style={lbl}>Reserva (opcional)<input style={field} type="number" value={val.reserve_price} onChange={(e) => set('reserve_price', e.target.value)} /></label>
        </div>
        <div className="grid md:grid-cols-3" style={{ display: 'grid', gap: 10 }}>
          <label style={lbl}>Seña<input style={field} type="number" min={AUCTION_MIN_DEPOSIT} required value={val.deposit_amount} onChange={(e) => set('deposit_amount', e.target.value)} /></label>
          <label style={lbl}>Anti-snipe (seg)<input style={field} type="number" required value={val.anti_snipe_seconds} onChange={(e) => set('anti_snipe_seconds', e.target.value)} /></label>
          <label style={lbl}>Estado
            <select style={field} value={val.status} onChange={(e) => set('status', e.target.value)}>
              {STATUS_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>
        </div>
        <div className="grid md:grid-cols-2" style={{ display: 'grid', gap: 10 }}>
          <label style={lbl}>Inicio<input style={field} type="datetime-local" required value={val.starts_at} onChange={(e) => set('starts_at', e.target.value)} /></label>
          <label style={lbl}>Cierre<input style={field} type="datetime-local" required value={val.ends_at} onChange={(e) => set('ends_at', e.target.value)} /></label>
        </div>
      </section>

      {err && <div style={{ padding: 12, borderRadius: 10, background: '#fee2e2', color: '#991b1b', fontSize: 13 }}>{err}</div>}

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button type="button" onClick={onCancel} style={ghost}>Cancelar</button>
        <button disabled={busy} style={{ ...primary, opacity: busy ? .55 : 1 }}>{busy ? 'Guardando…' : 'Guardar subasta'}</button>
      </div>
    </form>
  );
}

function ParticipantsPanel({ auctionId }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try { setList(await listAuctionParticipants(auctionId)); }
    catch (e) { console.warn(e); }
    finally { setLoading(false); }
  }, [auctionId]);

  useEffect(() => { Promise.resolve().then(load); }, [load]);

  const change = async (p, status) => {
    try { await setParticipantStatus(p.id, status); load(); }
    catch (e) { alert(e?.message || 'No se pudo actualizar'); }
  };

  if (loading) return <div style={{ ...card, padding: 14, fontSize: 13, color: 'var(--at-ink-2)' }}>Cargando participantes…</div>;
  if (!list.length) return <div style={{ ...card, padding: 14, fontSize: 13, color: 'var(--at-ink-2)' }}>Sin participantes todavía.</div>;

  return (
    <div style={{ ...card, padding: 14 }}>
      <h3 style={{ margin: '0 0 10px', fontFamily: 'var(--at-display)', fontSize: 18 }}>Participantes</h3>
      <div style={{ display: 'grid', gap: 8 }}>
        {list.map(p => (
          <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, alignItems: 'center', padding: '10px 12px', border: '1px solid var(--at-border)', borderRadius: 10 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--at-ink)' }}>
                {p.profile?.full_name || `Usuario ${p.user_id.slice(0, 8)}`}
              </div>
              <div style={{ fontSize: 11, color: 'var(--at-ink-3)', fontFamily: 'var(--at-mono)' }}>
                {p.profile?.dni && `DNI ${p.profile.dni} · `}{p.profile?.phone || ''} · pedida {new Date(p.created_at).toLocaleString('es-AR')}
              </div>
            </div>
            <select value={p.deposit_status} onChange={(e) => change(p, e.target.value)} style={{ ...field, width: 'auto', padding: '8px 10px' }}>
              {PARTICIPANT_STATUS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AuctionsAdmin({ cars }) {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | 'new' | auction obj
  const [openParticipants, setOpenParticipants] = useState(null);
  const [msg, setMsg] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [q, setQ] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try { setAuctions(await listAllAuctions()); }
    catch (e) { setMsg(e?.message || String(e)); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { Promise.resolve().then(load); }, [load]);

  const onSave = async (payload) => {
    if (editing && editing !== 'new') {
      await updateAuction(editing.id, payload);
      setMsg('Subasta actualizada.');
    } else {
      await createAuction(payload);
      setMsg('Subasta creada.');
    }
    setEditing(null);
    load();
  };

  const onDelete = async (a) => {
    if (!confirm(`Eliminar subasta "${a.title}"? Se borran ofertas y participantes asociados.`)) return;
    try { await deleteAuction(a.id); setMsg('Subasta eliminada.'); load(); }
    catch (e) { setMsg(e?.message || String(e)); }
  };

  const onClose = async (a) => {
    if (!confirm(`Cerrar la subasta "${a.title}" y declarar ganador?`)) return;
    try { await closeAuction(a.id); setMsg('Subasta cerrada.'); load(); }
    catch (e) { setMsg(e?.message || String(e)); }
  };

  const visibleAuctions = useMemo(() => {
    const rank = { live: 0, scheduled: 1, draft: 2, ended: 3, cancelled: 4 };
    const query = q.trim().toLowerCase();
    return [...auctions]
      .filter(auction => statusFilter === 'all' || auction.status === statusFilter)
      .filter(auction => !query || `${auction.title} ${auction.description || ''}`.toLowerCase().includes(query))
      .sort((a, b) => (rank[a.status] ?? 9) - (rank[b.status] ?? 9)
        || new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
  }, [auctions, q, statusFilter]);

  const counts = useMemo(() => ({
    all: auctions.length,
    live: auctions.filter(a => a.status === 'live').length,
    scheduled: auctions.filter(a => a.status === 'scheduled').length,
    draft: auctions.filter(a => a.status === 'draft').length,
    ended: auctions.filter(a => a.status === 'ended').length,
  }), [auctions]);

  if (editing) {
    const initial = editing === 'new'
      ? emptyAuction(cars)
      : { ...editing, starts_at: toLocalInput(editing.starts_at), ends_at: toLocalInput(editing.ends_at), reserve_price: editing.reserve_price ?? '' };
    return (
      <section>
        <h1 style={{ margin: '0 0 16px', fontFamily: 'var(--at-display)', fontSize: 32 }}>
          {editing === 'new' ? 'Nueva subasta' : `Editar: ${editing.title}`}
        </h1>
        <AuctionForm initial={initial} cars={cars} onSave={onSave} onCancel={() => setEditing(null)} />
      </section>
    );
  }

  return (
    <section>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontFamily: 'var(--at-mono)', fontSize: 11, color: 'var(--at-accent)', letterSpacing: '.14em', textTransform: 'uppercase' }}>Subastas</div>
          <h1 style={{ margin: '6px 0 0', fontFamily: 'var(--at-display)', fontSize: 36 }}>Lotes activos</h1>
        </div>
        <button onClick={() => setEditing('new')} style={primary}>Nueva subasta</button>
      </div>

      {msg && <div style={{ ...card, padding: 12, marginBottom: 12, fontSize: 13 }}>{msg}</div>}

      <div style={{ ...card, padding: 12, marginBottom: 12, display: 'grid', gap: 10 }}>
        <input
          value={q}
          onChange={event => setQ(event.target.value)}
          placeholder="Buscar lote por titulo o descripcion"
          style={field}
        />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            ['all', `Todos (${counts.all})`],
            ['live', `En vivo (${counts.live})`],
            ['scheduled', `Programadas (${counts.scheduled})`],
            ['draft', `Borradores (${counts.draft})`],
            ['ended', `Cerradas (${counts.ended})`],
          ].map(([value, label]) => (
            <button key={value} type="button" onClick={() => setStatusFilter(value)} style={{
              ...ghost,
              background: statusFilter === value ? 'var(--at-ink)' : 'var(--at-bg-2)',
              color: statusFilter === value ? '#fff' : 'var(--at-ink)',
            }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ color: 'var(--at-ink-2)' }}>Cargando subastas…</div>
      ) : auctions.length === 0 ? (
        <div style={{ ...card, padding: 24, color: 'var(--at-ink-2)' }}>Todavía no hay subastas. Creá la primera.</div>
      ) : visibleAuctions.length === 0 ? (
        <div style={{ ...card, padding: 24, color: 'var(--at-ink-2)' }}>No hay subastas con esos filtros.</div>
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {visibleAuctions.map(a => (
            <div key={a.id} style={{ ...card, padding: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'start' }}>
                <div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <strong style={{ fontFamily: 'var(--at-display)', fontSize: 18 }}>{a.title}</strong>
                    <span style={{ fontSize: 10, fontWeight: 900, padding: '3px 8px', borderRadius: 999, background: 'var(--at-bg-2)', textTransform: 'uppercase', letterSpacing: '.08em' }}>
                      {STATUS_OPTIONS.find(([v]) => v === a.status)?.[1] || a.status}
                    </span>
                  </div>
                  <div style={{ marginTop: 6, fontSize: 12, color: 'var(--at-ink-2)' }}>
                    Base {fmtPrice(Number(a.starting_price))} · +{fmtPrice(Number(a.min_increment))} · seña {fmtPrice(Number(a.deposit_amount))}
                  </div>
                  <div style={{ marginTop: 4, fontSize: 11, color: 'var(--at-ink-3)', fontFamily: 'var(--at-mono)' }}>
                    {new Date(a.starts_at).toLocaleString('es-AR')} → {new Date(a.ends_at).toLocaleString('es-AR')}
                  </div>
                  <div style={{ marginTop: 8, display: 'flex', gap: 14, fontSize: 12, color: 'var(--at-ink-2)' }}>
                    <span>Ofertas: <strong style={{ color: 'var(--at-ink)' }}>{a.bid_count || 0}</strong></span>
                    <span>Actual: <strong style={{ color: 'var(--at-ink)' }}>{a.current_bid != null ? fmtPrice(Number(a.current_bid)) : '—'}</strong></span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <button style={ghost} onClick={() => setEditing(a)}>Editar</button>
                  <button style={ghost} onClick={() => setOpenParticipants(openParticipants === a.id ? null : a.id)}>
                    {openParticipants === a.id ? 'Cerrar' : 'Participantes'}
                  </button>
                  {a.status === 'live' && <button style={primary} onClick={() => onClose(a)}>Cerrar subasta</button>}
                  <button style={danger} onClick={() => onDelete(a)}>Eliminar</button>
                </div>
              </div>
              {openParticipants === a.id && (
                <div style={{ marginTop: 12 }}><ParticipantsPanel auctionId={a.id} /></div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
