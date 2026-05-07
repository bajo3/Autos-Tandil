import { useMemo, useState } from 'react';
import { useCars } from '../hooks/useCars';
import { hasSupabaseConfig, supabase } from '../lib/supabase';
import { carToRow } from '../lib/carMapper';
import { getAdminCredentials, isAdminSession, setAdminSession } from '../lib/adminAuth';
import { fmtPrice, fmtKm } from '../lib/utils';
import { ImageManager } from '../components/admin/ImageManager';
import { ATLogo } from '../components/ATLogo';

const emptyCar = {
  id: '',
  brand: '',
  model: '',
  version: '',
  year: new Date().getFullYear(),
  km: 0,
  price: 0,
  currency: 'ARS',
  fuel: 'Nafta',
  trans: 'Manual',
  engine: '',
  color: '',
  type: 'Auto',
  body: '',
  badges: [],
  desc: '',
  images: [],
  status: 'draft',
};

const fieldStyle = {
  width: '100%',
  border: '1px solid var(--at-border)',
  background: 'var(--at-surface)',
  color: 'var(--at-ink)',
  borderRadius: 8,
  padding: '10px 11px',
  fontSize: 13,
  fontFamily: 'inherit',
  outline: 'none',
};

const labelStyle = {
  display: 'grid',
  gap: 5,
  fontSize: 10.5,
  color: 'var(--at-ink-3)',
  fontFamily: 'var(--at-mono)',
  textTransform: 'uppercase',
  letterSpacing: '.1em',
};

const slugify = (parts) => parts
  .filter(Boolean)
  .join(' ')
  .normalize('NFD')
  .replace(/[̀-ͯ]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '');

const cleanImages = (images) => {
  const seen = new Set();
  return (images || [])
    .map(image => String(image || '').trim())
    .filter(Boolean)
    .filter((image) => {
      const key = image.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
};

function FormSection({ title, children }) {
  return (
    <section style={{
      border: '1px solid var(--at-border)',
      background: 'var(--at-surface)',
      borderRadius: 12,
      padding: '18px 16px',
      display: 'grid',
      gap: 14,
    }}>
      <h3 style={{ margin: 0, fontFamily: 'var(--at-display)', fontSize: 16, fontWeight: 600, color: 'var(--at-ink)', letterSpacing: '-.01em' }}>
        {title}
      </h3>
      {children}
    </section>
  );
}

function TogglePill({ active, children, onClick }) {
  return (
    <button type="button" onClick={onClick} style={{
      border: '1.5px solid ' + (active ? 'var(--at-accent)' : 'var(--at-border)'),
      background: active ? 'var(--at-accent)' : 'var(--at-surface)',
      color: active ? '#fff' : 'var(--at-ink-2)',
      borderRadius: 999,
      padding: '7px 14px',
      fontSize: 12,
      fontWeight: 600,
      cursor: 'pointer',
      fontFamily: 'inherit',
      transition: 'all .15s',
    }}>
      {children}
    </button>
  );
}

function StatusBadge({ status }) {
  const map = {
    published: { bg: '#dcfce7', fg: '#166534', label: 'Publicado' },
    draft:     { bg: '#f1f5f9', fg: '#475569', label: 'Borrador' },
    reserved:  { bg: '#fef3c7', fg: '#92400e', label: 'Reservado' },
    sold:      { bg: '#f3f4f6', fg: '#6b7280', label: 'Vendido' },
  };
  const s = map[status] || map.draft;
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 999,
      background: s.bg, color: s.fg, fontSize: 10.5, fontWeight: 700,
      letterSpacing: '.04em', textTransform: 'uppercase',
    }}>{s.label}</span>
  );
}

function Login({ onLogin }) {
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = (event) => {
    event.preventDefault();
    const credentials = getAdminCredentials();
    if (user === credentials.user && password === credentials.password) {
      setAdminSession(true);
      onLogin();
      return;
    }
    setError('Usuario o clave incorrectos.');
  };

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 20, background: 'var(--at-page-bg)' }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <ATLogo size={24} color="var(--at-ink)" />
          <div style={{ marginTop: 8, fontSize: 11, color: 'var(--at-ink-3)', fontFamily: 'var(--at-mono)', letterSpacing: '.1em', textTransform: 'uppercase' }}>
            Panel de gestión
          </div>
        </div>
        <form data-testid="admin-login-form" onSubmit={submit} style={{
          background: 'var(--at-surface)',
          border: '1px solid var(--at-border)',
          borderRadius: 16,
          padding: '28px 24px',
          boxShadow: '0 20px 60px -20px rgba(15,23,42,.15)',
        }}>
          <h1 style={{ margin: '0 0 6px', fontFamily: 'var(--at-display)', fontSize: 24, fontWeight: 600, letterSpacing: '-.025em' }}>
            Acceso admin
          </h1>
          <p style={{ margin: '0 0 22px', fontSize: 12.5, color: 'var(--at-ink-2)', lineHeight: 1.5 }}>
            Ingresá con tus credenciales para gestionar el stock.
          </p>
          <div style={{ display: 'grid', gap: 14 }}>
            <label style={labelStyle}>
              Usuario
              <input name="user" style={fieldStyle} value={user} onChange={e => setUser(e.target.value)} autoComplete="username" />
            </label>
            <label style={labelStyle}>
              Clave
              <input name="password" style={fieldStyle} type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" />
            </label>
            {error && (
              <div style={{ padding: '9px 12px', borderRadius: 8, background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: 12.5 }}>
                {error}
              </div>
            )}
            <button style={{
              border: 'none', borderRadius: 10, padding: '12px',
              background: 'var(--at-ink)', color: '#fff',
              fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              marginTop: 4,
            }}>Entrar</button>
          </div>
        </form>
      </div>
    </main>
  );
}

function CarForm({ value, onChange, onSubmit, saving, onCancel }) {
  const badges = value.badges || [];

  const patch = (key, nextValue) => onChange({ ...value, [key]: nextValue });
  const patchNumber = (key, nextValue) => patch(key, Number(nextValue) || 0);
  const toggleBadge = (badge) => {
    patch('badges', badges.includes(badge) ? badges.filter(item => item !== badge) : [...badges, badge]);
  };

  const submit = (event) => {
    event.preventDefault();
    const id = value.id || slugify([value.brand, value.model, value.year]);
    const images = cleanImages(value.images || value.photoUrls);
    onSubmit({ ...value, id, images, photoUrls: images, thumbUrl: images[0] || '' });
  };

  return (
    <form data-testid="admin-car-form" onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
      <FormSection title="Datos principales">
        <div className="grid md:grid-cols-3" style={{ gap: 10 }}>
          <label style={labelStyle}>ID<input style={fieldStyle} value={value.id} onChange={e => patch('id', e.target.value)} placeholder="auto-generado" /></label>
          <label style={labelStyle}>Marca<input style={fieldStyle} required value={value.brand} onChange={e => patch('brand', e.target.value)} /></label>
          <label style={labelStyle}>Modelo<input style={fieldStyle} required value={value.model} onChange={e => patch('model', e.target.value)} /></label>
        </div>
        <label style={labelStyle}>Versión<input style={fieldStyle} value={value.version} onChange={e => patch('version', e.target.value)} /></label>
        <div className="grid md:grid-cols-4" style={{ gap: 10 }}>
          <label style={labelStyle}>Año<input style={fieldStyle} type="number" required value={value.year} onChange={e => patchNumber('year', e.target.value)} /></label>
          <label style={labelStyle}>Km<input style={fieldStyle} type="number" value={value.km} onChange={e => patchNumber('km', e.target.value)} /></label>
          <label style={labelStyle}>Precio<input style={fieldStyle} type="number" value={value.price} onChange={e => patchNumber('price', e.target.value)} /></label>
          <label style={labelStyle}>Moneda
            <select style={fieldStyle} value={value.currency} onChange={e => patch('currency', e.target.value)}>
              <option value="ARS">ARS</option>
              <option value="USD">USD</option>
            </select>
          </label>
        </div>
      </FormSection>

      <FormSection title="Ficha técnica">
        <div className="grid md:grid-cols-2" style={{ gap: 10 }}>
          <label style={labelStyle}>Combustible
            <select style={fieldStyle} value={value.fuel} onChange={e => patch('fuel', e.target.value)}>
              {['Nafta', 'Diésel', 'GNC', 'Eléctrico', 'Híbrido'].map(f => <option key={f}>{f}</option>)}
            </select>
          </label>
          <label style={labelStyle}>Transmisión
            <select style={fieldStyle} value={value.trans} onChange={e => patch('trans', e.target.value)}>
              <option>Manual</option>
              <option>Automática</option>
            </select>
          </label>
        </div>
        <div className="grid md:grid-cols-3" style={{ gap: 10 }}>
          <label style={labelStyle}>Motor<input style={fieldStyle} value={value.engine} onChange={e => patch('engine', e.target.value)} placeholder="1.6 MPI" /></label>
          <label style={labelStyle}>Color<input style={fieldStyle} value={value.color} onChange={e => patch('color', e.target.value)} /></label>
          <label style={labelStyle}>Tipo
            <select style={fieldStyle} value={value.type} onChange={e => patch('type', e.target.value)}>
              {['Auto', 'Camioneta', 'SUV', 'Utilitario'].map(t => <option key={t}>{t}</option>)}
            </select>
          </label>
        </div>
        <label style={labelStyle}>Carrocería<input style={fieldStyle} value={value.body} onChange={e => patch('body', e.target.value)} placeholder="Sedán, Hatchback, SUV..." /></label>
      </FormSection>

      <FormSection title="Fotos">
        <ImageManager
          images={cleanImages(value.images || value.photoUrls)}
          onChange={(images) => onChange({ ...value, images, photoUrls: images, thumbUrl: images[0] || '' })}
        />
      </FormSection>

      <FormSection title="Publicación">
        <div>
          <div style={{ fontSize: 11, color: 'var(--at-ink-3)', marginBottom: 10, fontFamily: 'var(--at-mono)', textTransform: 'uppercase', letterSpacing: '.08em' }}>Badges</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <TogglePill active={badges.includes('destacado')} onClick={() => toggleBadge('destacado')}>Destacado</TogglePill>
            <TogglePill active={badges.includes('financia')} onClick={() => toggleBadge('financia')}>Financia</TogglePill>
            <TogglePill active={badges.includes('permuta')} onClick={() => toggleBadge('permuta')}>Permuta</TogglePill>
            <TogglePill active={badges.includes('nuevo')} onClick={() => toggleBadge('nuevo')}>Nuevo ingreso</TogglePill>
          </div>
        </div>
        <label style={labelStyle}>Estado
          <select style={fieldStyle} value={value.status} onChange={e => patch('status', e.target.value)}>
            <option value="draft">Borrador</option>
            <option value="published">Publicado</option>
            <option value="reserved">Reservado</option>
            <option value="sold">Vendido</option>
          </select>
        </label>
      </FormSection>

      <FormSection title="Descripción">
        <label style={labelStyle}>
          Descripción comercial
          <textarea style={{ ...fieldStyle, minHeight: 96, resize: 'vertical', lineHeight: 1.5 }}
            value={value.desc} onChange={e => patch('desc', e.target.value)} />
        </label>
      </FormSection>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap', paddingTop: 4 }}>
        <button type="button" onClick={onCancel} style={{
          border: '1px solid var(--at-border)', borderRadius: 8, padding: '10px 18px',
          background: 'var(--at-surface)', color: 'var(--at-ink)',
          fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
        }}>Cancelar</button>
        <button disabled={saving || !hasSupabaseConfig} style={{
          border: 'none', borderRadius: 8, padding: '10px 20px',
          background: 'var(--at-ink)', color: '#fff',
          fontSize: 13, fontWeight: 700, cursor: saving || !hasSupabaseConfig ? 'default' : 'pointer',
          fontFamily: 'inherit',
          opacity: saving || !hasSupabaseConfig ? .5 : 1,
        }}>
          {saving ? 'Guardando…' : 'Guardar auto'}
        </button>
      </div>
    </form>
  );
}

export default function Admin() {
  const [logged, setLogged] = useState(isAdminSession());
  const { cars, loading, source, reload, configured } = useCars({ includeDrafts: true });
  const [editing, setEditing] = useState(emptyCar);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const sortedCars = useMemo(() => [...cars].sort((a, b) => a.brand.localeCompare(b.brand) || a.model.localeCompare(b.model)), [cars]);

  const published = sortedCars.filter(c => c.status === 'published').length;
  const drafts = sortedCars.filter(c => c.status === 'draft').length;

  if (!logged) return <Login onLogin={() => setLogged(true)} />;

  const openNew = () => { setEditing(emptyCar); setShowForm(true); };
  const openEdit = (car) => { setEditing(car); setShowForm(true); };
  const closeForm = () => { setEditing(emptyCar); setShowForm(false); };

  const saveCar = async (car) => {
    if (!hasSupabaseConfig) return;
    setSaving(true);
    setMessage('');
    const row = carToRow(car);
    const { error } = await supabase.from('autos').upsert(row, { onConflict: 'id' });
    setSaving(false);
    if (error) { setMessage(error.message); return; }
    closeForm();
    setMessage('Auto guardado.');
    reload();
  };

  const changeStatus = async (car, status) => {
    const { error } = await supabase.from('autos').update({ status }).eq('id', car.id);
    if (error) setMessage(error.message);
    else { setMessage('Estado actualizado.'); reload(); }
  };

  const deleteCar = async () => {
    if (!confirmDelete) return;
    const { error } = await supabase.from('autos').delete().eq('id', confirmDelete.id);
    if (error) setMessage(error.message);
    else { setMessage('Auto eliminado.'); setConfirmDelete(null); reload(); }
  };

  return (
    <main style={{ minHeight: '100vh', background: 'var(--at-page-bg)', paddingBottom: 64 }}>

      {/* Admin top bar */}
      <div style={{ background: 'var(--at-ink)', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
        <div style={{
          maxWidth: '80rem', margin: '0 auto', padding: '0 20px',
          height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <ATLogo size={20} dark />
            <span style={{
              fontFamily: 'var(--at-mono)', fontSize: 10, letterSpacing: '.14em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,.4)',
              borderLeft: '1px solid rgba(255,255,255,.12)', paddingLeft: 14,
            }}>Panel admin</span>
          </div>
          <button onClick={() => { setAdminSession(false); setLogged(false); }} style={{
            background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)',
            borderRadius: 8, padding: '6px 14px',
            color: 'rgba(255,255,255,.7)', fontSize: 12, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>
            Salir
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '28px 20px' }}>

        {/* Dashboard header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ margin: 0, fontFamily: 'var(--at-display)', fontSize: 30, fontWeight: 600, letterSpacing: '-.03em', color: 'var(--at-ink)' }}>
              Stock AutosTandil
            </h1>
            <p style={{ margin: '4px 0 0', color: 'var(--at-ink-3)', fontSize: 12, fontFamily: 'var(--at-mono)' }}>
              {source} · {configured ? 'Supabase conectado' : 'Sin Supabase — modo mock'}
            </p>
          </div>
          <button
            data-testid="btn-add-car"
            onClick={openNew}
            style={{
              border: 'none', borderRadius: 10, padding: '11px 20px',
              background: 'var(--at-accent)', color: '#fff',
              fontSize: 13.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              display: 'inline-flex', alignItems: 'center', gap: 8, flexShrink: 0,
              boxShadow: '0 4px 14px -4px rgba(0,68,255,.35)',
            }}>
            <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Agregar nuevo auto
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 24 }}>
          {[
            { l: 'Total stock', v: sortedCars.length },
            { l: 'Publicados', v: published },
            { l: 'Borradores', v: drafts },
          ].map(s => (
            <div key={s.l} style={{
              background: 'var(--at-surface)', border: '1px solid var(--at-border)',
              borderRadius: 12, padding: '16px 18px',
            }}>
              <div style={{ fontFamily: 'var(--at-display)', fontSize: 26, fontWeight: 600, letterSpacing: '-.03em', color: 'var(--at-ink)' }}>{s.v}</div>
              <div style={{ fontSize: 10.5, color: 'var(--at-ink-3)', marginTop: 2, fontFamily: 'var(--at-mono)', textTransform: 'uppercase', letterSpacing: '.08em' }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Message */}
        {message && (
          <div style={{
            border: '1px solid var(--at-border)', background: 'var(--at-surface)',
            borderRadius: 8, padding: '11px 14px', marginBottom: 18,
            fontSize: 13, color: 'var(--at-ink)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10,
          }}>
            <span>{message}</span>
            <button onClick={() => setMessage('')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--at-ink-3)', lineHeight: 1, padding: 0 }}>×</button>
          </div>
        )}

        {/* Form panel — shown on demand */}
        {showForm && (
          <section style={{
            background: 'var(--at-surface)', border: '1px solid var(--at-border)',
            borderRadius: 16, padding: '22px 20px', marginBottom: 24,
            boxShadow: '0 8px 30px -10px rgba(15,23,42,.1)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontFamily: 'var(--at-display)', fontSize: 20, fontWeight: 600, letterSpacing: '-.02em' }}>
                {editing.id ? `Editando: ${editing.brand} ${editing.model}` : 'Nuevo auto'}
              </h2>
              <button onClick={closeForm} style={{
                background: 'var(--at-bg-2)', border: '1px solid var(--at-border)',
                borderRadius: 8, padding: '6px 12px',
                fontSize: 12, fontWeight: 600, color: 'var(--at-ink-2)', cursor: 'pointer', fontFamily: 'inherit',
              }}>✕ Cerrar</button>
            </div>
            <CarForm value={editing} onChange={setEditing} onSubmit={saveCar} saving={saving} onCancel={closeForm} />
          </section>
        )}

        {/* Cars list */}
        <section data-testid="admin-cars-list">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 style={{ margin: 0, fontFamily: 'var(--at-display)', fontSize: 18, fontWeight: 600, letterSpacing: '-.02em', color: 'var(--at-ink)' }}>
              Autos en stock
            </h2>
            <span style={{ fontFamily: 'var(--at-mono)', fontSize: 11, color: 'var(--at-ink-3)' }}>{sortedCars.length} unidades</span>
          </div>

          {loading ? (
            <div style={{ color: 'var(--at-ink-2)', padding: '30px 0', textAlign: 'center', fontSize: 13 }}>Cargando stock…</div>
          ) : sortedCars.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '48px 20px',
              background: 'var(--at-surface)', border: '1px dashed var(--at-border-strong)', borderRadius: 14,
            }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>🚗</div>
              <div style={{ fontFamily: 'var(--at-display)', fontSize: 18, fontWeight: 600, marginBottom: 6 }}>Sin autos todavía</div>
              <div style={{ fontSize: 13, color: 'var(--at-ink-2)', marginBottom: 16 }}>Agregá el primer auto al stock.</div>
              <button onClick={openNew} style={{
                border: 'none', borderRadius: 8, padding: '10px 20px',
                background: 'var(--at-accent)', color: '#fff',
                fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              }}>+ Agregar auto</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 8 }}>
              {sortedCars.map(car => (
                <article key={car.id} style={{
                  display: 'grid',
                  gridTemplateColumns: '88px 1fr',
                  gap: 14,
                  background: 'var(--at-surface)',
                  border: '1px solid var(--at-border)',
                  borderRadius: 12,
                  padding: 12,
                }}>
                  <div style={{ position: 'relative', width: 88, aspectRatio: '4/3', borderRadius: 8, overflow: 'hidden', background: 'var(--at-bg-2)', flexShrink: 0 }}>
                    {car.thumbUrl ? (
                      <img src={car.thumbUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    ) : (
                      <div style={{ height: '100%', display: 'grid', placeItems: 'center', color: 'var(--at-ink-3)', fontSize: 10.5, textAlign: 'center', padding: 8 }}>Sin foto</div>
                    )}
                    <span style={{
                      position: 'absolute', right: 5, bottom: 5,
                      borderRadius: 999, padding: '2px 6px',
                      background: 'rgba(15,23,42,.72)', backdropFilter: 'blur(4px)',
                      fontSize: 9.5, fontWeight: 700, color: '#fff',
                    }}>
                      {(car.images || car.photoUrls || []).length} fotos
                    </span>
                  </div>
                  <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    {/* Car info row */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <strong style={{ fontFamily: 'var(--at-display)', fontSize: 14.5, letterSpacing: '-.01em', lineHeight: 1.2 }}>{car.brand} {car.model}</strong>
                        <StatusBadge status={car.status} />
                      </div>
                      <div style={{ color: 'var(--at-ink-2)', fontSize: 11.5, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{car.version}</div>
                      <div style={{ color: 'var(--at-ink-3)', fontSize: 11, marginTop: 4, fontFamily: 'var(--at-mono)' }}>
                        {car.year} · {fmtKm(car.km)} · {fmtPrice(car.price)}
                      </div>
                      {(car.badges || []).length > 0 && (
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
                          {car.badges.filter(b => ['destacado','financia','permuta','nuevo'].includes(b)).map(badge => (
                            <span key={badge} style={{
                              borderRadius: 999, padding: '2px 7px',
                              background: 'var(--at-accent-soft)', color: 'var(--at-accent-strong)',
                              fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em',
                            }}>{badge}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* Action buttons — always full-width below info, wrapping freely */}
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 10 }}>
                      <button style={{ border: '1px solid var(--at-border)', borderRadius: 7, padding: '5px 10px', background: 'var(--at-surface)', color: 'var(--at-ink)', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => openEdit(car)}>Editar</button>
                      <a href={`/auto/${car.id}`} target="_blank" rel="noopener noreferrer" style={{ border: '1px solid var(--at-border)', borderRadius: 7, padding: '5px 10px', background: 'var(--at-surface)', color: 'var(--at-ink)', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'none', display: 'inline-flex' }}>Ver ↗</a>
                      {car.status !== 'published' && (
                        <button style={{ border: 'none', borderRadius: 7, padding: '5px 10px', background: '#dcfce7', color: '#166534', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => changeStatus(car, 'published')}>Publicar</button>
                      )}
                      {car.status !== 'reserved' && (
                        <button style={{ border: 'none', borderRadius: 7, padding: '5px 10px', background: '#fef3c7', color: '#92400e', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => changeStatus(car, 'reserved')}>Reservar</button>
                      )}
                      {car.status !== 'sold' && (
                        <button style={{ border: 'none', borderRadius: 7, padding: '5px 10px', background: '#f3f4f6', color: '#374151', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => changeStatus(car, 'sold')}>Vendido</button>
                      )}
                      {car.status !== 'draft' && (
                        <button style={{ border: '1px solid var(--at-border)', borderRadius: 7, padding: '5px 10px', background: 'var(--at-surface)', color: 'var(--at-ink-2)', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => changeStatus(car, 'draft')}>Archivar</button>
                      )}
                      <button style={{ border: 'none', borderRadius: 7, padding: '5px 10px', background: '#fee2e2', color: '#991b1b', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => setConfirmDelete(car)}>Eliminar</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Delete confirm modal */}
      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.55)', display: 'grid', placeItems: 'center', padding: 20, zIndex: 100, backdropFilter: 'blur(4px)' }}>
          <div style={{ maxWidth: 440, width: '100%', background: 'var(--at-surface)', borderRadius: 16, padding: 24, border: '1px solid var(--at-border)', boxShadow: '0 24px 60px -16px rgba(15,23,42,.4)' }}>
            <h2 style={{ margin: '0 0 8px', fontFamily: 'var(--at-display)', fontSize: 20, fontWeight: 600 }}>Confirmar eliminación</h2>
            <p style={{ fontSize: 13, color: 'var(--at-ink-2)', lineHeight: 1.55, margin: '0 0 20px' }}>
              Se eliminará <strong>{confirmDelete.brand} {confirmDelete.model}</strong> (ID: {confirmDelete.id}). Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button style={{ border: '1px solid var(--at-border)', borderRadius: 8, padding: '9px 16px', background: 'var(--at-surface)', color: 'var(--at-ink)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => setConfirmDelete(null)}>Cancelar</button>
              <button style={{ border: 'none', borderRadius: 8, padding: '9px 18px', background: '#b91c1c', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }} onClick={deleteCar}>Eliminar este auto</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
