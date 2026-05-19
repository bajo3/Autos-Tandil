import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useCars } from '../hooks/useCars';
import { hasSupabaseConfig, supabase } from '../lib/supabase';
import { carToRow } from '../lib/carMapper';
import { getAdminCredentials, isAdminSession, setAdminSession } from '../lib/adminAuth';
import { fmtPrice, fmtKm } from '../lib/utils';
import { VEHICLE_USE_LABELS, VEHICLE_USE_OPTIONS } from '../lib/vehicleUse';
import { ImageManager } from '../components/admin/ImageManager';
import { AuctionsAdmin } from '../components/admin/AuctionsAdmin';
import { ProgressiveImage } from '../components/ProgressiveImage';
import { ATLogo } from '../components/ATLogo';
import { getAdminAnalytics } from '../services/analyticsService';
import { listGrowthLeads, updateGrowthLead } from '../services/leadService';

const emptyCar = {
  id: '', brand: '', model: '', version: '', year: new Date().getFullYear(),
  km: 0, price: 0, currency: 'ARS', fuel: 'Nafta', trans: 'Manual',
  engine: '', color: '', type: 'Auto', body: '', badges: [], usageTags: [], desc: '',
  images: [], status: 'draft',
};

const fieldStyle = {
  width: '100%', border: '1px solid var(--at-border)', background: 'var(--at-surface)',
  color: 'var(--at-ink)', borderRadius: 8, padding: '10px 11px',
  fontSize: 13, fontFamily: 'inherit', outline: 'none',
};

const labelStyle = {
  display: 'grid', gap: 6, fontSize: 11, color: 'var(--at-ink-3)',
  fontFamily: 'var(--at-mono)', textTransform: 'uppercase', letterSpacing: '.1em',
};

const buttonStyle = {
  border: 'none', borderRadius: 8, padding: '10px 12px',
  fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit',
};

const primaryButton = {
  ...buttonStyle,
  background: 'var(--at-accent)',
  color: '#fff',
  textDecoration: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const ghostButton = {
  ...buttonStyle,
  background: 'var(--at-bg-2)',
  color: 'var(--at-ink)',
  textDecoration: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const leadChip = {
  borderRadius: 999,
  padding: '4px 8px',
  background: 'var(--at-bg-2)',
  color: 'var(--at-ink-2)',
  fontWeight: 800,
};

const cardStyle = {
  background: 'var(--at-surface)',
  border: '1px solid var(--at-border)',
  borderRadius: 12,
  boxShadow: '0 14px 36px -28px rgba(15,23,42,.45)',
};

const slugify = (parts) => parts.filter(Boolean).join(' ')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const cleanImages = (images) => {
  const seen = new Set();
  return (images || []).map(image => String(image || '').trim()).filter(Boolean).filter((image) => {
    const key = image.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const statusLabel = {
  published: 'Disponible',
  sold: 'Vendido',
  reserved: 'Reservado',
  draft: 'Borrador',
};

function Login({ onLogin }) {
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    const credentials = getAdminCredentials();
    if (user !== credentials.user || password !== credentials.password) {
      setError('Usuario o clave incorrectos.');
      return;
    }
    setAdminSession(true);
    if (hasSupabaseConfig && user.includes('@')) {
      try { await supabase.auth.signInWithPassword({ email: user, password }); }
      catch { /* ignore: writes fallarán si no hay session, pero entra al panel */ }
    }
    onLogin();
  };

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 20, background: 'var(--at-bg)' }}>
      <form data-testid="admin-login-form" onSubmit={submit} style={{ ...cardStyle, width: '100%', maxWidth: 380, padding: 24 }}>
        <ATLogo size={24} />
        <h1 style={{ margin: '18px 0 6px', fontFamily: 'var(--at-display)', fontSize: 28 }}>Admin AutosTandil</h1>
        <p style={{ margin: '0 0 18px', fontSize: 13, color: 'var(--at-ink-2)', lineHeight: 1.5 }}>
          Acceso temporal para gestionar stock, fotos y estadisticas del sitio.
        </p>
        <div style={{ display: 'grid', gap: 12 }}>
          <label style={labelStyle}>Usuario<input name="user" style={fieldStyle} value={user} onChange={e => setUser(e.target.value)} /></label>
          <label style={labelStyle}>Clave<input name="password" style={fieldStyle} type="password" value={password} onChange={e => setPassword(e.target.value)} /></label>
          {error && <div style={{ color: '#b91c1c', fontSize: 12 }}>{error}</div>}
          <button style={primaryButton}>Entrar</button>
        </div>
      </form>
    </main>
  );
}

function AdminShell({ children, onLogout }) {
  const { pathname } = useLocation();
  const nav = [
    ['/admin', 'Dashboard'],
    ['/admin/autos', 'Autos'],
    ['/admin/leads', 'Leads'],
    ['/admin/subastas', 'Subastas'],
    ['/admin/analytics', 'Analytics'],
  ];
  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f7f8fb, var(--at-bg) 260px)', padding: '20px 16px 48px' }}>
      <div style={{ maxWidth: '86rem', margin: '0 auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', marginBottom: 18 }}>
          <Link to="/admin" style={{ textDecoration: 'none', color: 'inherit' }}><ATLogo size={24} /></Link>
          <nav style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {nav.map(([to, label]) => (
              <Link key={to} to={to} style={{
                ...ghostButton,
                background: pathname === to ? 'var(--at-ink)' : 'var(--at-surface)',
                color: pathname === to ? '#fff' : 'var(--at-ink)',
              }}>{label}</Link>
            ))}
            <button onClick={onLogout} style={ghostButton}>Salir</button>
          </nav>
        </header>
        {children}
      </div>
    </main>
  );
}

function StatCard({ label, value, note }) {
  return (
    <div style={{ ...cardStyle, padding: 16 }}>
      <div style={{ fontSize: 11, color: 'var(--at-ink-3)', fontFamily: 'var(--at-mono)', textTransform: 'uppercase', letterSpacing: '.12em' }}>{label}</div>
      <div style={{ marginTop: 8, fontFamily: 'var(--at-display)', fontSize: 30, fontWeight: 800, color: 'var(--at-ink)' }}>{value}</div>
      {note && <div style={{ marginTop: 4, fontSize: 12, color: 'var(--at-ink-2)' }}>{note}</div>}
    </div>
  );
}

function Dashboard({ cars, analytics }) {
  const counts = useMemo(() => ({
    total: cars.length,
    available: cars.filter(c => c.status === 'published').length,
    sold: cars.filter(c => c.status === 'sold').length,
    reserved: cars.filter(c => c.status === 'reserved').length,
    draft: cars.filter(c => c.status === 'draft').length,
  }), [cars]);
  const topCar = analytics?.topCars?.[0]?.title || 'Sin datos todavia';

  return (
    <section data-testid="admin-dashboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: 18 }}>
        <div>
          <div style={{ fontFamily: 'var(--at-mono)', fontSize: 11, color: 'var(--at-accent)', letterSpacing: '.14em', textTransform: 'uppercase' }}>Panel privado</div>
          <h1 style={{ margin: '6px 0 0', fontFamily: 'var(--at-display)', fontSize: 40, letterSpacing: '-.03em' }}>Resumen AutosTandil</h1>
        </div>
        <Link data-testid="admin-add-car" to="/admin/autos/nuevo" style={primaryButton}>Agregar nuevo auto</Link>
      </div>
      <div className="grid md:grid-cols-3 lg:grid-cols-4" style={{ gap: 12 }}>
        <StatCard label="Total de autos" value={counts.total} />
        <StatCard label="Disponibles" value={counts.available} />
        <StatCard label="Vendidos" value={counts.sold} />
        <StatCard label="Borradores" value={counts.draft} />
        <StatCard label="Reservados" value={counts.reserved} />
        <StatCard label="Total de visitas" value={analytics?.totalPageViews ?? 0} />
        <StatCard label="Consultas WhatsApp" value={analytics?.totalWhatsappClicks ?? 0} />
        <StatCard label="Auto mas visto" value={topCar} />
      </div>
      <div className="grid md:grid-cols-4" style={{ gap: 10, marginTop: 18 }}>
        <Link to="/admin/autos/nuevo" style={{ ...cardStyle, padding: 18, color: 'var(--at-ink)', textDecoration: 'none', fontWeight: 800 }}>Agregar nuevo auto</Link>
        <Link to="/catalogo" style={{ ...cardStyle, padding: 18, color: 'var(--at-ink)', textDecoration: 'none', fontWeight: 800 }}>Ver catalogo</Link>
        <Link to="/admin/analytics" style={{ ...cardStyle, padding: 18, color: 'var(--at-ink)', textDecoration: 'none', fontWeight: 800 }}>Ver analytics</Link>
        <Link to="/admin/autos" style={{ ...cardStyle, padding: 18, color: 'var(--at-ink)', textDecoration: 'none', fontWeight: 800 }}>Gestionar autos</Link>
      </div>
    </section>
  );
}

function CarForm({ value, onChange, onSubmit, saving, onCancel }) {
  const badges = value.badges || [];
  const usageTags = value.usageTags || value.usage_tags || [];
  const patch = (key, nextValue) => onChange({ ...value, [key]: nextValue });
  const patchNumber = (key, nextValue) => patch(key, Number(nextValue) || 0);
  const toggleBadge = (badge) => patch('badges', badges.includes(badge) ? badges.filter(item => item !== badge) : [...badges, badge]);
  const toggleUse = (useId) => patch('usageTags', usageTags.includes(useId) ? usageTags.filter(item => item !== useId) : [...usageTags, useId]);

  const submit = (event) => {
    event.preventDefault();
    const id = value.id || slugify([value.brand, value.model, value.year]);
    const images = cleanImages(value.images || value.photoUrls);
    onSubmit({ ...value, id, images, photoUrls: images, thumbUrl: images[0] || '' });
  };

  return (
    <form data-testid="admin-car-form" onSubmit={submit} style={{ display: 'grid', gap: 14 }}>
      <FormSection title="Datos principales">
        <div className="grid md:grid-cols-3" style={{ gap: 10 }}>
          <label style={labelStyle}>ID<input style={fieldStyle} value={value.id} onChange={e => patch('id', e.target.value)} placeholder="se genera si queda vacio" /></label>
          <label style={labelStyle}>Marca<input style={fieldStyle} required value={value.brand} onChange={e => patch('brand', e.target.value)} /></label>
          <label style={labelStyle}>Modelo<input style={fieldStyle} required value={value.model} onChange={e => patch('model', e.target.value)} /></label>
        </div>
        <label style={labelStyle}>Version<input style={fieldStyle} value={value.version} onChange={e => patch('version', e.target.value)} /></label>
        <div className="grid md:grid-cols-4" style={{ gap: 10 }}>
          <label style={labelStyle}>Ano<input style={fieldStyle} type="number" required value={value.year} onChange={e => patchNumber('year', e.target.value)} /></label>
          <label style={labelStyle}>Km<input style={fieldStyle} type="number" value={value.km} onChange={e => patchNumber('km', e.target.value)} /></label>
          <label style={labelStyle}>Precio<input style={fieldStyle} type="number" value={value.price} onChange={e => patchNumber('price', e.target.value)} /></label>
          <label style={labelStyle}>Moneda<input style={fieldStyle} value={value.currency} onChange={e => patch('currency', e.target.value)} /></label>
        </div>
      </FormSection>
      <FormSection title="Caracteristicas">
        <div className="grid md:grid-cols-4" style={{ gap: 10 }}>
          <label style={labelStyle}>Combustible<input style={fieldStyle} value={value.fuel} onChange={e => patch('fuel', e.target.value)} /></label>
          <label style={labelStyle}>Transmision<input style={fieldStyle} value={value.trans} onChange={e => patch('trans', e.target.value)} /></label>
          <label style={labelStyle}>Carroceria<input style={fieldStyle} value={value.body} onChange={e => patch('body', e.target.value)} /></label>
          <label style={labelStyle}>Color<input style={fieldStyle} value={value.color} onChange={e => patch('color', e.target.value)} /></label>
        </div>
        <div className="grid md:grid-cols-2" style={{ gap: 10 }}>
          <label style={labelStyle}>Tipo<input style={fieldStyle} value={value.type} onChange={e => patch('type', e.target.value)} /></label>
          <label style={labelStyle}>Motor<input style={fieldStyle} value={value.engine} onChange={e => patch('engine', e.target.value)} /></label>
        </div>
      </FormSection>
      <ImageManager images={value.images || value.photoUrls || []} onChange={(images) => onChange({ ...value, images, photoUrls: images, thumbUrl: images[0] || '' })} />
      <FormSection title="Publicacion">
        <div>
          <div style={{ ...labelStyle, marginBottom: 8 }}>Uso recomendado</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {VEHICLE_USE_OPTIONS.map(option => (
              <button key={option.id} type="button" onClick={() => toggleUse(option.id)} style={{
                ...ghostButton,
                border: '1px solid ' + (usageTags.includes(option.id) ? 'var(--at-accent)' : 'var(--at-border)'),
                background: usageTags.includes(option.id) ? 'var(--at-accent-soft)' : 'var(--at-surface)',
                color: usageTags.includes(option.id) ? 'var(--at-accent)' : 'var(--at-ink)',
              }}>{option.label}</button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            ['destacado', 'Destacado'], ['financia', 'Financiacion'], ['permuta', 'Permuta'], ['nuevo', 'Nuevo ingreso'],
          ].map(([badge, label]) => (
            <button key={badge} type="button" onClick={() => toggleBadge(badge)} style={{
              ...ghostButton,
              border: '1px solid ' + (badges.includes(badge) ? 'var(--at-ink)' : 'var(--at-border)'),
              background: badges.includes(badge) ? 'var(--at-ink)' : 'var(--at-surface)',
              color: badges.includes(badge) ? '#fff' : 'var(--at-ink)',
            }}>{label}</button>
          ))}
        </div>
        <label style={labelStyle}>Estado
          <select style={fieldStyle} value={value.status} onChange={e => patch('status', e.target.value)}>
            <option value="draft">Borrador</option>
            <option value="published">Disponible</option>
            <option value="reserved">Reservado</option>
            <option value="sold">Vendido</option>
          </select>
        </label>
      </FormSection>
      <FormSection title="Descripcion">
        <label style={labelStyle}>Descripcion comercial<textarea style={{ ...fieldStyle, minHeight: 108, resize: 'vertical' }} value={value.desc} onChange={e => patch('desc', e.target.value)} /></label>
      </FormSection>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        <button type="button" onClick={onCancel} style={ghostButton}>Cancelar</button>
        <button disabled={saving || !hasSupabaseConfig} style={{ ...primaryButton, opacity: saving || !hasSupabaseConfig ? .55 : 1 }}>{saving ? 'Guardando...' : 'Guardar auto'}</button>
      </div>
    </form>
  );
}

function FormSection({ title, children }) {
  return (
    <section style={{ ...cardStyle, padding: 16, display: 'grid', gap: 12 }}>
      <h3 style={{ margin: 0, fontFamily: 'var(--at-display)', fontSize: 18 }}>{title}</h3>
      {children}
    </section>
  );
}

function AutosList({ cars, loading, onStatus, onDelete }) {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');
  const filtered = useMemo(() => cars.filter((car) => {
    const haystack = `${car.brand} ${car.model} ${car.version}`.toLowerCase();
    if (q && !haystack.includes(q.toLowerCase())) return false;
    if (status !== 'all' && car.status !== status) return false;
    return true;
  }), [cars, q, status]);

  return (
    <section>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: 'var(--at-display)', fontSize: 36 }}>Autos publicados</h1>
          <p style={{ margin: '6px 0 0', color: 'var(--at-ink-2)', fontSize: 13 }}>{filtered.length} unidades en gestion.</p>
        </div>
        <Link data-testid="admin-add-car" to="/admin/autos/nuevo" style={primaryButton}>Agregar nuevo auto</Link>
      </div>
      <div style={{ ...cardStyle, padding: 12, marginBottom: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar marca, modelo o version" style={{ ...fieldStyle, flex: '1 1 260px' }} />
        {[
          ['all', 'Todos'], ['published', 'Disponible'], ['sold', 'Vendido'], ['reserved', 'Reservado'], ['draft', 'Borrador'],
        ].map(([value, label]) => (
          <button key={value} onClick={() => setStatus(value)} style={{ ...ghostButton, background: status === value ? 'var(--at-ink)' : 'var(--at-bg-2)', color: status === value ? '#fff' : 'var(--at-ink)' }}>{label}</button>
        ))}
      </div>
      <div data-testid="admin-cars-list" style={{ display: 'grid', gap: 10 }}>
        {loading ? <div style={{ color: 'var(--at-ink-2)' }}>Cargando stock...</div> : filtered.map(car => (
          <article key={car.id} style={{ ...cardStyle, padding: 10, display: 'grid', gridTemplateColumns: '104px 1fr', gap: 12 }}>
            <div style={{ position: 'relative', width: 104, aspectRatio: '4/3', borderRadius: 10, overflow: 'hidden', background: 'var(--at-bg-2)' }}>
              {car.thumbUrl ? <ProgressiveImage src={car.thumbUrl} alt="" style={{ width: '100%', height: '100%' }} /> : <div style={{ height: '100%', display: 'grid', placeItems: 'center', fontSize: 11 }}>Sin foto</div>}
              <span style={{ position: 'absolute', right: 6, bottom: 6, borderRadius: 999, padding: '3px 6px', background: 'rgba(255,255,255,.94)', fontSize: 10, fontWeight: 800 }}>{(car.images || car.photoUrls || []).length} fotos</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
              <div>
                <strong style={{ fontFamily: 'var(--at-display)', fontSize: 17 }}>{car.brand} {car.model}</strong>
                <div style={{ color: 'var(--at-ink-2)', fontSize: 12, marginTop: 2 }}>{car.version}</div>
                <div style={{ color: 'var(--at-ink-3)', fontSize: 11, marginTop: 5 }}>{car.year} / {fmtKm(car.km)} / {fmtPrice(car.price)} / {statusLabel[car.status] || car.status}</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                  {['destacado', 'financia', 'permuta', 'nuevo'].map(badge => car.badges?.includes(badge) && <span key={badge} style={{ borderRadius: 999, padding: '3px 7px', background: 'var(--at-bg-2)', fontSize: 10, fontWeight: 800 }}>{badge}</span>)}
                  {(car.usageTags || car.usage_tags || []).map(use => <span key={use} style={{ borderRadius: 999, padding: '3px 7px', background: 'var(--at-accent-soft)', color: 'var(--at-accent)', fontSize: 10, fontWeight: 800 }}>{VEHICLE_USE_LABELS[use] || use}</span>)}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                <Link to={`/admin/autos/${car.id}/editar`} style={ghostButton}>Editar</Link>
                <Link to={`/auto/${car.id}`} style={ghostButton}>Ver en web</Link>
                <select value={car.status} onChange={e => onStatus(car, e.target.value)} style={{ ...fieldStyle, width: 'auto', padding: '9px 10px' }}>
                  <option value="published">Disponible</option><option value="reserved">Reservado</option><option value="sold">Vendido</option><option value="draft">Borrador</option>
                </select>
                <button style={{ ...ghostButton, background: '#fee2e2', color: '#991b1b' }} onClick={() => onDelete(car)}>Eliminar</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function leadTitle(row) {
  if (row.lead_type === 'seller') return `${row.vehicle_brand || 'Auto'} ${row.vehicle_model || 'a vender'}`.trim();
  if (row.table === 'buyer_alerts') return row.query || row.brand || row.type || 'Alerta de busqueda';
  return row.car_title || row.notes || 'Comprador interesado';
}

function LeadsView({ growth, onStatus }) {
  const leads = growth?.leads || [];
  const alerts = growth?.alerts || [];
  const rows = [
    ...leads.map(row => ({ ...row, table: 'sales_leads', kindLabel: row.lead_type === 'seller' ? 'Vendedor' : 'Comprador' })),
    ...alerts.map(row => ({ ...row, table: 'buyer_alerts', kindLabel: 'Alerta' })),
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const counts = {
    total: rows.length,
    new: rows.filter(row => ['new', 'active'].includes(row.status)).length,
    contacted: rows.filter(row => row.status === 'contacted').length,
    won: rows.filter(row => row.status === 'won').length,
  };

  return (
    <section data-testid="admin-leads">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'end', flexWrap: 'wrap', marginBottom: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: 'var(--at-display)', fontSize: 36 }}>CRM de oportunidades</h1>
          <p style={{ margin: '6px 0 0', color: 'var(--at-ink-2)', fontSize: 13 }}>
            Consultas de venta, asistente de compra y alertas de busqueda.
          </p>
        </div>
        {!growth?.configured && <span style={{ ...ghostButton, cursor: 'default' }}>Fallback local</span>}
      </div>

      <div className="grid md:grid-cols-4" style={{ gap: 12, marginBottom: 14 }}>
        <StatCard label="Total leads" value={counts.total} />
        <StatCard label="Nuevos/activos" value={counts.new} />
        <StatCard label="Contactados" value={counts.contacted} />
        <StatCard label="Cerrados" value={counts.won} />
      </div>

      <div style={{ display: 'grid', gap: 10 }}>
        {rows.length ? rows.map(row => (
          <article key={`${row.table}-${row.id}`} style={{ ...cardStyle, padding: 14, display: 'grid', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontFamily: 'var(--at-mono)', fontSize: 10, color: 'var(--at-accent)', letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 900 }}>
                  {row.kindLabel} / {row.source || 'web'}
                </div>
                <strong style={{ display: 'block', marginTop: 5, fontFamily: 'var(--at-display)', fontSize: 18 }}>
                  {leadTitle(row)}
                </strong>
                <div style={{ color: 'var(--at-ink-2)', fontSize: 12, marginTop: 4 }}>
                  {row.full_name || 'Sin nombre'} · {row.phone || 'sin telefono'} {row.email ? `· ${row.email}` : ''}
                </div>
              </div>
              <select value={row.status || 'new'} onChange={e => onStatus(row.table, row.id, e.target.value)} style={{ ...fieldStyle, width: 'auto', minWidth: 150 }}>
                <option value="new">Nuevo</option>
                <option value="active">Activo</option>
                <option value="contacted">Contactado</option>
                <option value="visit">Visita</option>
                <option value="won">Cerrado</option>
                <option value="lost">Perdido</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', color: 'var(--at-ink-2)', fontSize: 12 }}>
              {row.budget_max && <span style={leadChip}>Hasta {fmtPrice(Number(row.budget_max))}</span>}
              {row.vehicle_year && <span style={leadChip}>Año {row.vehicle_year}</span>}
              {row.vehicle_km && <span style={leadChip}>{fmtKm(Number(row.vehicle_km))}</span>}
              {row.type && <span style={leadChip}>{row.type}</span>}
              {row.brand && <span style={leadChip}>{row.brand}</span>}
            </div>
            {(row.notes || row.preferences?.recommended?.length) && (
              <p style={{ margin: 0, color: 'var(--at-ink-2)', fontSize: 12, lineHeight: 1.5 }}>
                {row.notes || `Recomendados: ${row.preferences.recommended.join(', ')}`}
              </p>
            )}
          </article>
        )) : (
          <div style={{ ...cardStyle, padding: 20, color: 'var(--at-ink-2)' }}>Todavia no hay oportunidades capturadas.</div>
        )}
      </div>
    </section>
  );
}

function AnalyticsView({ analytics }) {
  if (!analytics) {
    return <div data-testid="admin-analytics" style={{ ...cardStyle, padding: 24 }}>No se pudieron cargar estadisticas todavia.</div>;
  }
  const maxViews = Math.max(...(analytics.ranking || []).map(row => row.views), 1);
  return (
    <section data-testid="admin-analytics">
      <h1 style={{ margin: '0 0 16px', fontFamily: 'var(--at-display)', fontSize: 36 }}>Analytics</h1>
      <div className="grid md:grid-cols-3" style={{ gap: 12 }}>
        <StatCard label="Visitas totales" value={analytics.totalPageViews} />
        <StatCard label="Visitas 7 dias" value={analytics.pageViews7d} />
        <StatCard label="Clicks WhatsApp" value={analytics.totalWhatsappClicks} />
      </div>
      <div className="grid lg:grid-cols-2" style={{ gap: 12, marginTop: 14 }}>
        <div style={{ ...cardStyle, padding: 16 }}>
          <h2 style={{ margin: '0 0 12px', fontFamily: 'var(--at-display)', fontSize: 20 }}>Ranking autos</h2>
          {analytics.ranking?.length ? analytics.ranking.slice(0, 8).map(row => (
            <div key={row.slug} style={{ padding: '10px 0', borderTop: '1px solid var(--at-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 13 }}><strong>{row.title}</strong><span>{row.views} vistas / {row.clicks} clicks</span></div>
              <div style={{ height: 7, borderRadius: 999, background: 'var(--at-bg-2)', marginTop: 7 }}><div style={{ height: '100%', width: `${Math.max(6, (row.views / maxViews) * 100)}%`, borderRadius: 999, background: 'var(--at-accent)' }} /></div>
              <div style={{ marginTop: 4, fontSize: 11, color: 'var(--at-ink-3)' }}>Conversion aprox. {row.conversion}%</div>
            </div>
          )) : <p style={{ color: 'var(--at-ink-2)', fontSize: 13 }}>Todavia no hay datos suficientes.</p>}
        </div>
        <div style={{ ...cardStyle, padding: 16 }}>
          <h2 style={{ margin: '0 0 12px', fontFamily: 'var(--at-display)', fontSize: 20 }}>Paginas mas visitadas</h2>
          {analytics.topPages?.length ? analytics.topPages.map(page => <div key={page.key} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderTop: '1px solid var(--at-border)', fontSize: 13 }}><span>{page.key}</span><strong>{page.count}</strong></div>) : <p style={{ color: 'var(--at-ink-2)', fontSize: 13 }}>Sin visitas registradas.</p>}
        </div>
        <div style={{ ...cardStyle, padding: 16 }}>
          <h2 style={{ margin: '0 0 12px', fontFamily: 'var(--at-display)', fontSize: 20 }}>Eventos comerciales</h2>
          {analytics.topEvents?.length ? analytics.topEvents.map(event => <div key={event.key} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderTop: '1px solid var(--at-border)', fontSize: 13 }}><span>{event.key}</span><strong>{event.count}</strong></div>) : <p style={{ color: 'var(--at-ink-2)', fontSize: 13 }}>Sin eventos registrados.</p>}
        </div>
      </div>
    </section>
  );
}

function FormRoute({ initialCar, title, onSubmit, saving, onCancel }) {
  const [draftCar, setDraftCar] = useState(initialCar);

  return (
    <section>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ margin: 0, fontFamily: 'var(--at-display)', fontSize: 36 }}>{title}</h1>
        <Link to="/admin/autos" style={ghostButton}>Volver al listado</Link>
      </div>
      <CarForm value={draftCar} onChange={setDraftCar} onSubmit={onSubmit} saving={saving} onCancel={onCancel} />
    </section>
  );
}

export default function Admin() {
  const [logged, setLogged] = useState(isAdminSession());
  const { cars, loading, source, reload, configured } = useCars({ includeDrafts: true });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [growth, setGrowth] = useState({ leads: [], alerts: [], configured: false });
  const { pathname } = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    getAdminAnalytics().then(setAnalytics);
  }, [pathname]);

  useEffect(() => {
    if (!logged) return;
    listGrowthLeads().then(setGrowth).catch(error => {
      console.warn('Growth leads:', error.message);
      setGrowth({ leads: [], alerts: [], configured: false });
    });
  }, [logged, pathname]);

  if (!logged) return <Login onLogin={() => setLogged(true)} />;

  const editingCar = id ? cars.find(car => car.id === id) : null;
  const isForm = pathname === '/admin/autos/nuevo' || pathname.endsWith('/editar');

  const saveCar = async (car) => {
    if (!hasSupabaseConfig) return;
    setSaving(true);
    setMessage('');
    const { error } = await supabase.from('autos').upsert(carToRow(car), { onConflict: 'id' });
    setSaving(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setMessage('Auto guardado.');
    await reload();
    navigate('/admin/autos');
  };

  const changeStatus = async (car, status) => {
    const { error } = await supabase.from('autos').update({ status }).eq('id', car.id);
    if (error) setMessage(error.message);
    else {
      setMessage('Estado actualizado.');
      reload();
    }
  };

  const deleteCar = async () => {
    if (!confirmDelete) return;
    const { error } = await supabase.from('autos').delete().eq('id', confirmDelete.id);
    if (error) setMessage(error.message);
    else {
      setMessage('Auto eliminado.');
      setConfirmDelete(null);
      reload();
    }
  };

  const changeLeadStatus = async (table, id, status) => {
    try {
      await updateGrowthLead(table, id, { status });
      setGrowth(await listGrowthLeads());
      setMessage('Lead actualizado.');
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <AdminShell onLogout={() => { setAdminSession(false); setLogged(false); }}>
      {message && <div style={{ ...cardStyle, padding: 12, marginBottom: 14, fontSize: 13 }}>{message}</div>}
      {!configured && <div style={{ ...cardStyle, padding: 12, marginBottom: 14, fontSize: 13, color: '#92400e' }}>Fuente actual: {source}. Faltan variables Supabase, se muestran mocks.</div>}
      {(pathname === '/admin' || pathname === '/admin/login') && <Dashboard cars={cars} analytics={analytics} />}
      {pathname === '/admin/autos' && <AutosList cars={cars} loading={loading} onStatus={changeStatus} onDelete={setConfirmDelete} />}
      {pathname === '/admin/leads' && <LeadsView growth={growth} onStatus={changeLeadStatus} />}
      {pathname === '/admin/subastas' && <AuctionsAdmin cars={cars} />}
      {pathname === '/admin/analytics' && <AnalyticsView analytics={analytics} />}
      {isForm && (
        <FormRoute
          key={pathname}
          initialCar={editingCar || emptyCar}
          title={editingCar ? 'Editar auto' : 'Agregar nuevo auto'}
          onSubmit={saveCar}
          saving={saving}
          onCancel={() => navigate('/admin/autos')}
        />
      )}
      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.5)', display: 'grid', placeItems: 'center', padding: 20, zIndex: 100 }}>
          <div style={{ ...cardStyle, maxWidth: 420, padding: 20 }}>
            <h2 style={{ margin: 0, fontFamily: 'var(--at-display)', fontSize: 22 }}>Confirmar eliminacion</h2>
            <p style={{ fontSize: 13, color: 'var(--at-ink-2)', lineHeight: 1.5 }}>Se eliminara solo el auto con ID <strong>{confirmDelete.id}</strong>.</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button style={ghostButton} onClick={() => setConfirmDelete(null)}>Cancelar</button>
              <button style={{ ...primaryButton, background: '#b91c1c' }} onClick={deleteCar}>Eliminar este auto</button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
