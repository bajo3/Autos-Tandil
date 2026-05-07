import { useMemo, useState } from 'react';
import { useCars } from '../hooks/useCars';
import { hasSupabaseConfig, supabase } from '../lib/supabase';
import { carToRow } from '../lib/carMapper';
import { getAdminCredentials, isAdminSession, setAdminSession } from '../lib/adminAuth';
import { fmtPrice, fmtKm } from '../lib/utils';
import { ImageManager } from '../components/admin/ImageManager';

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
  gap: 6,
  fontSize: 11,
  color: 'var(--at-ink-3)',
  fontFamily: 'var(--at-mono)',
  textTransform: 'uppercase',
  letterSpacing: '.1em',
};

const buttonStyle = {
  border: 'none',
  borderRadius: 8,
  padding: '10px 12px',
  fontSize: 12,
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'inherit',
};

const slugify = (parts) => parts
  .filter(Boolean)
  .join(' ')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
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

const formSectionStyle = {
  border: '1px solid var(--at-border)',
  background: 'var(--at-bg)',
  borderRadius: 12,
  padding: 14,
  display: 'grid',
  gap: 12,
};

function FormSection({ title, children }) {
  return (
    <section style={formSectionStyle}>
      <h3 style={{ margin: 0, fontFamily: 'var(--at-display)', fontSize: 18, fontWeight: 700 }}>
        {title}
      </h3>
      {children}
    </section>
  );
}

function TogglePill({ active, children, onClick }) {
  return (
    <button type="button" onClick={onClick} style={{
      border: '1px solid ' + (active ? 'var(--at-ink)' : 'var(--at-border)'),
      background: active ? 'var(--at-ink)' : 'var(--at-surface)',
      color: active ? '#fff' : 'var(--at-ink)',
      borderRadius: 999,
      padding: '9px 12px',
      fontSize: 12,
      fontWeight: 800,
      cursor: 'pointer',
      fontFamily: 'inherit',
    }}>
      {children}
    </button>
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
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 20 }}>
      <form data-testid="admin-login-form" onSubmit={submit} style={{
        width: '100%',
        maxWidth: 360,
        background: 'var(--at-surface)',
        border: '1px solid var(--at-border)',
        borderRadius: 12,
        padding: 22,
        boxShadow: '0 18px 50px -30px rgba(15,23,42,.45)',
      }}>
        <h1 style={{ margin: 0, fontFamily: 'var(--at-display)', fontSize: 26, fontWeight: 600 }}>
          Admin AutosTandil
        </h1>
        <p style={{ margin: '8px 0 18px', fontSize: 12, lineHeight: 1.5, color: 'var(--at-ink-2)' }}>
          Acceso temporal para gestionar stock. No reemplaza autenticacion real de produccion.
        </p>
        <div style={{ display: 'grid', gap: 12 }}>
          <label style={labelStyle}>Usuario<input name="user" style={fieldStyle} value={user} onChange={e => setUser(e.target.value)} /></label>
          <label style={labelStyle}>Clave<input name="password" style={fieldStyle} type="password" value={password} onChange={e => setPassword(e.target.value)} /></label>
          {error && <div style={{ color: '#b91c1c', fontSize: 12 }}>{error}</div>}
          <button style={{ ...buttonStyle, background: 'var(--at-ink)', color: '#fff' }}>Entrar</button>
        </div>
      </form>
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
    onSubmit({
      ...value,
      id,
      images,
      photoUrls: images,
      thumbUrl: images[0] || '',
    });
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

      <ImageManager
        images={value.images || value.photoUrls || []}
        onChange={(images) => onChange({ ...value, images, photoUrls: images, thumbUrl: images[0] || '' })}
      />

      <FormSection title="Publicacion">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <TogglePill active={badges.includes('destacado')} onClick={() => toggleBadge('destacado')}>Destacado</TogglePill>
          <TogglePill active={badges.includes('financia')} onClick={() => toggleBadge('financia')}>Financiacion</TogglePill>
          <TogglePill active={badges.includes('permuta')} onClick={() => toggleBadge('permuta')}>Permuta</TogglePill>
          <TogglePill active={badges.includes('nuevo')} onClick={() => toggleBadge('nuevo')}>Nuevo ingreso</TogglePill>
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

      <FormSection title="Descripcion">
        <label style={labelStyle}>Descripcion comercial<textarea style={{ ...fieldStyle, minHeight: 108, resize: 'vertical' }} value={value.desc} onChange={e => patch('desc', e.target.value)} /></label>
      </FormSection>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        <button type="button" onClick={onCancel} style={{ ...buttonStyle, background: 'var(--at-bg-2)', color: 'var(--at-ink)' }}>Limpiar</button>
        <button disabled={saving || !hasSupabaseConfig} style={{ ...buttonStyle, background: 'var(--at-ink)', color: '#fff', opacity: saving || !hasSupabaseConfig ? .55 : 1 }}>
          {saving ? 'Guardando...' : 'Guardar auto'}
        </button>
      </div>
    </form>
  );
}

export default function Admin() {
  const [logged, setLogged] = useState(isAdminSession());
  const { cars, loading, source, reload, configured } = useCars({ includeDrafts: true });
  const [editing, setEditing] = useState(emptyCar);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const sortedCars = useMemo(() => [...cars].sort((a, b) => a.brand.localeCompare(b.brand) || a.model.localeCompare(b.model)), [cars]);

  if (!logged) return <Login onLogin={() => setLogged(true)} />;

  const saveCar = async (car) => {
    if (!hasSupabaseConfig) return;
    setSaving(true);
    setMessage('');
    const row = carToRow(car);
    const { error } = await supabase.from('autos').upsert(row, { onConflict: 'id' });
    setSaving(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setEditing(emptyCar);
    setMessage('Auto guardado.');
    reload();
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

  return (
    <main style={{ minHeight: '100vh', background: 'var(--at-bg)', padding: '24px 16px 48px' }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: 'var(--at-mono)', fontSize: 11, color: 'var(--at-ink-3)', letterSpacing: '.14em', textTransform: 'uppercase' }}>
              Panel privado MVP
            </div>
            <h1 style={{ margin: '6px 0 0', fontFamily: 'var(--at-display)', fontSize: 34, fontWeight: 600 }}>
              Stock AutosTandil
            </h1>
            <p style={{ margin: '6px 0 0', color: 'var(--at-ink-2)', fontSize: 13 }}>
              Fuente actual: {source}. {configured ? 'Supabase configurado.' : 'Faltan VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.'}
            </p>
          </div>
          <button onClick={() => { setAdminSession(false); setLogged(false); }} style={{ ...buttonStyle, background: 'var(--at-bg-2)', color: 'var(--at-ink)' }}>
            Salir
          </button>
        </header>

        {message && (
          <div style={{ border: '1px solid var(--at-border)', background: 'var(--at-surface)', borderRadius: 8, padding: 12, marginBottom: 14, fontSize: 13 }}>
            {message}
          </div>
        )}

        <section style={{ background: 'var(--at-surface)', border: '1px solid var(--at-border)', borderRadius: 12, padding: 16, marginBottom: 18 }}>
          <h2 style={{ margin: '0 0 14px', fontFamily: 'var(--at-display)', fontSize: 20 }}>Crear o editar auto</h2>
          <CarForm value={editing} onChange={setEditing} onSubmit={saveCar} saving={saving} onCancel={() => setEditing(emptyCar)} />
        </section>

        <section data-testid="admin-cars-list" style={{ display: 'grid', gap: 10 }}>
          {loading ? <div style={{ color: 'var(--at-ink-2)' }}>Cargando stock...</div> : sortedCars.map(car => (
            <article key={car.id} style={{
              display: 'grid',
              gridTemplateColumns: '96px 1fr',
              gap: 12,
              background: 'var(--at-surface)',
              border: '1px solid var(--at-border)',
              borderRadius: 10,
              padding: 10,
            }}>
              <div style={{ position: 'relative', width: 96, aspectRatio: '4/3', borderRadius: 8, overflow: 'hidden', background: 'var(--at-bg-2)' }}>
                {car.thumbUrl ? (
                  <img src={car.thumbUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <div style={{ height: '100%', display: 'grid', placeItems: 'center', color: 'var(--at-ink-3)', fontSize: 11, textAlign: 'center', padding: 8 }}>
                    Sin foto
                  </div>
                )}
                <span style={{
                  position: 'absolute',
                  right: 6,
                  bottom: 6,
                  borderRadius: 999,
                  padding: '3px 6px',
                  background: 'rgba(255,255,255,.92)',
                  fontSize: 10,
                  fontWeight: 800,
                  color: 'var(--at-ink)',
                }}>
                  {(car.images || car.photoUrls || []).length} fotos
                </span>
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                  <div>
                    <strong style={{ fontFamily: 'var(--at-display)', fontSize: 16 }}>{car.brand} {car.model}</strong>
                    <div style={{ color: 'var(--at-ink-2)', fontSize: 12, marginTop: 2 }}>{car.version}</div>
                    <div style={{ color: 'var(--at-ink-3)', fontSize: 11, marginTop: 4 }}>{car.year} / {fmtKm(car.km)} / {fmtPrice(car.price)} / {car.status}</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                      {['destacado', 'financia', 'permuta'].map(badge => car.badges?.includes(badge) && (
                        <span key={badge} style={{
                          borderRadius: 999,
                          padding: '3px 7px',
                          background: 'var(--at-bg-2)',
                          color: 'var(--at-ink-2)',
                          fontSize: 10,
                          fontWeight: 800,
                          textTransform: 'uppercase',
                        }}>
                          {badge}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                    <button style={{ ...buttonStyle, background: 'var(--at-bg-2)', color: 'var(--at-ink)' }} onClick={() => setEditing(car)}>Editar</button>
                    <a href={`/auto/${car.id}`} style={{ ...buttonStyle, background: 'var(--at-bg-2)', color: 'var(--at-ink)', textDecoration: 'none', display: 'inline-flex' }}>Ver</a>
                    <button style={{ ...buttonStyle, background: '#dcfce7', color: '#166534' }} onClick={() => changeStatus(car, 'published')}>Publicar</button>
                    <button style={{ ...buttonStyle, background: '#fef3c7', color: '#92400e' }} onClick={() => changeStatus(car, 'reserved')}>Reservar</button>
                    <button style={{ ...buttonStyle, background: '#e5e7eb', color: '#374151' }} onClick={() => changeStatus(car, 'sold')}>Vendido</button>
                    <button style={{ ...buttonStyle, background: '#fee2e2', color: '#991b1b' }} onClick={() => setConfirmDelete(car)}>Eliminar</button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>

      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.5)', display: 'grid', placeItems: 'center', padding: 20, zIndex: 100 }}>
          <div style={{ maxWidth: 420, background: 'var(--at-surface)', borderRadius: 12, padding: 20, border: '1px solid var(--at-border)' }}>
            <h2 style={{ margin: 0, fontFamily: 'var(--at-display)', fontSize: 22 }}>Confirmar eliminacion</h2>
            <p style={{ fontSize: 13, color: 'var(--at-ink-2)', lineHeight: 1.5 }}>
              Se eliminara solo el auto con ID <strong>{confirmDelete.id}</strong>. Esta accion es puntual y no afecta otros registros.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button style={{ ...buttonStyle, background: 'var(--at-bg-2)', color: 'var(--at-ink)' }} onClick={() => setConfirmDelete(null)}>Cancelar</button>
              <button style={{ ...buttonStyle, background: '#b91c1c', color: '#fff' }} onClick={deleteCar}>Eliminar este auto</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
