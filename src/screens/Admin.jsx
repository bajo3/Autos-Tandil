import { useMemo, useState } from 'react';
import { useCars } from '../hooks/useCars';
import { hasSupabaseConfig, supabase } from '../lib/supabase';
import { carToRow } from '../lib/carMapper';
import { getAdminCredentials, isAdminSession, setAdminSession } from '../lib/adminAuth';
import { fmtPrice, fmtKm } from '../lib/utils';

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
  photoUrls: [],
  thumbUrl: '',
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
      <form onSubmit={submit} style={{
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
          <label style={labelStyle}>Usuario<input style={fieldStyle} value={user} onChange={e => setUser(e.target.value)} /></label>
          <label style={labelStyle}>Clave<input style={fieldStyle} type="password" value={password} onChange={e => setPassword(e.target.value)} /></label>
          {error && <div style={{ color: '#b91c1c', fontSize: 12 }}>{error}</div>}
          <button style={{ ...buttonStyle, background: 'var(--at-ink)', color: '#fff' }}>Entrar</button>
        </div>
      </form>
    </main>
  );
}

function CarForm({ value, onChange, onSubmit, saving, onCancel }) {
  const badgesText = value.badges.join(', ');
  const photosText = value.photoUrls.join('\n');

  const patch = (key, nextValue) => onChange({ ...value, [key]: nextValue });
  const patchNumber = (key, nextValue) => patch(key, Number(nextValue) || 0);

  const submit = (event) => {
    event.preventDefault();
    const id = value.id || slugify([value.brand, value.model, value.year]);
    const photoUrls = photosText.split('\n').map(v => v.trim()).filter(Boolean);
    onSubmit({
      ...value,
      id,
      badges: badgesText.split(',').map(v => v.trim()).filter(Boolean),
      photoUrls,
      thumbUrl: value.thumbUrl || photoUrls[0] || '',
    });
  };

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 14 }}>
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
        <label style={labelStyle}>Estado
          <select style={fieldStyle} value={value.status} onChange={e => patch('status', e.target.value)}>
            <option value="draft">Borrador</option>
            <option value="published">Publicado</option>
            <option value="reserved">Reservado</option>
            <option value="sold">Vendido</option>
          </select>
        </label>
      </div>
      <div className="grid md:grid-cols-4" style={{ gap: 10 }}>
        <label style={labelStyle}>Tipo<input style={fieldStyle} value={value.type} onChange={e => patch('type', e.target.value)} /></label>
        <label style={labelStyle}>Combustible<input style={fieldStyle} value={value.fuel} onChange={e => patch('fuel', e.target.value)} /></label>
        <label style={labelStyle}>Transmision<input style={fieldStyle} value={value.trans} onChange={e => patch('trans', e.target.value)} /></label>
        <label style={labelStyle}>Color<input style={fieldStyle} value={value.color} onChange={e => patch('color', e.target.value)} /></label>
      </div>
      <div className="grid md:grid-cols-2" style={{ gap: 10 }}>
        <label style={labelStyle}>Motor<input style={fieldStyle} value={value.engine} onChange={e => patch('engine', e.target.value)} /></label>
        <label style={labelStyle}>Carroceria<input style={fieldStyle} value={value.body} onChange={e => patch('body', e.target.value)} /></label>
      </div>
      <label style={labelStyle}>Badges<input style={fieldStyle} value={badgesText} onChange={e => patch('badges', e.target.value.split(',').map(v => v.trim()).filter(Boolean))} placeholder="destacado, financia, permuta" /></label>
      <label style={labelStyle}>Descripcion<textarea style={{ ...fieldStyle, minHeight: 88, resize: 'vertical' }} value={value.desc} onChange={e => patch('desc', e.target.value)} /></label>
      <label style={labelStyle}>Fotos, una URL por linea<textarea style={{ ...fieldStyle, minHeight: 96, resize: 'vertical' }} value={photosText} onChange={e => patch('photoUrls', e.target.value.split('\n').map(v => v.trim()).filter(Boolean))} /></label>
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

        <section style={{ display: 'grid', gap: 10 }}>
          {loading ? <div style={{ color: 'var(--at-ink-2)' }}>Cargando stock...</div> : sortedCars.map(car => (
            <article key={car.id} style={{
              display: 'grid',
              gridTemplateColumns: '88px 1fr',
              gap: 12,
              background: 'var(--at-surface)',
              border: '1px solid var(--at-border)',
              borderRadius: 10,
              padding: 10,
            }}>
              <img src={car.thumbUrl} alt="" style={{ width: 88, aspectRatio: '4/3', objectFit: 'cover', borderRadius: 8, background: 'var(--at-bg-2)' }} />
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                  <div>
                    <strong style={{ fontFamily: 'var(--at-display)', fontSize: 16 }}>{car.brand} {car.model}</strong>
                    <div style={{ color: 'var(--at-ink-2)', fontSize: 12, marginTop: 2 }}>{car.version}</div>
                    <div style={{ color: 'var(--at-ink-3)', fontSize: 11, marginTop: 4 }}>{car.year} / {fmtKm(car.km)} / {fmtPrice(car.price)} / {car.status}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                    <button style={{ ...buttonStyle, background: 'var(--at-bg-2)', color: 'var(--at-ink)' }} onClick={() => setEditing(car)}>Editar</button>
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
