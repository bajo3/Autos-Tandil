import { useMemo, useState } from 'react';

const urlPattern = /^https?:\/\/\S+\.\S+/i;

const cleanImages = (items) => {
  const seen = new Set();
  return (items || [])
    .map(item => String(item || '').trim())
    .filter(Boolean)
    .filter((item) => {
      const key = item.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
};

const isValidUrl = (value) => {
  if (!urlPattern.test(value)) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const panel = {
  border: '1px solid var(--at-border)',
  background: 'var(--at-bg)',
  borderRadius: 12,
  padding: 14,
};

const inputStyle = {
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

const buttonStyle = {
  border: 'none',
  borderRadius: 8,
  padding: '9px 11px',
  fontSize: 12,
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'inherit',
};

const ghostButton = {
  ...buttonStyle,
  padding: '7px 9px',
  fontSize: 11,
  background: 'var(--at-bg-2)',
  color: 'var(--at-ink)',
};

function ImageCard({ url, index, count, broken, onBroken, onSetCover, onMove, onRemove }) {
  const isCover = index === 0;

  return (
    <article style={{
      border: '1px solid var(--at-border)',
      borderRadius: 10,
      overflow: 'hidden',
      background: 'var(--at-surface)',
      boxShadow: isCover ? '0 0 0 2px rgba(15,23,42,.08)' : 'none',
    }}>
      <div style={{ position: 'relative', aspectRatio: '4/3', background: 'var(--at-bg-2)' }}>
        {broken ? (
          <div style={{
            height: '100%',
            display: 'grid',
            placeItems: 'center',
            padding: 16,
            textAlign: 'center',
            color: '#991b1b',
            fontSize: 12,
            background: '#fee2e2',
          }}>
            No se pudo cargar la imagen
          </div>
        ) : (
          <img
            src={url}
            alt=""
            onError={onBroken}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        )}
        {isCover && (
          <span style={{
            position: 'absolute',
            top: 8,
            left: 8,
            borderRadius: 999,
            padding: '4px 8px',
            background: 'rgba(15,23,42,.84)',
            color: '#fff',
            fontSize: 10,
            fontWeight: 800,
          }}>
            Portada
          </span>
        )}
        <span style={{
          position: 'absolute',
          right: 8,
          bottom: 8,
          borderRadius: 999,
          padding: '4px 7px',
          background: 'rgba(255,255,255,.92)',
          color: 'var(--at-ink)',
          fontSize: 10,
          fontWeight: 800,
        }}>
          {index + 1}/{count}
        </span>
      </div>

      <div style={{ padding: 9, display: 'grid', gap: 8 }}>
        <div style={{
          fontSize: 11,
          color: 'var(--at-ink-3)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {url}
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button type="button" style={ghostButton} onClick={onSetCover} disabled={isCover}>
            Portada
          </button>
          <button type="button" style={ghostButton} onClick={() => onMove(-1)} disabled={index === 0}>
            Mover arriba
          </button>
          <button type="button" style={ghostButton} onClick={() => onMove(1)} disabled={index === count - 1}>
            Mover abajo
          </button>
          <button type="button" style={{ ...ghostButton, background: '#fee2e2', color: '#991b1b' }} onClick={onRemove}>
            Eliminar
          </button>
        </div>
      </div>
    </article>
  );
}

export function ImageManager({ images, onChange }) {
  const cleanValue = useMemo(() => cleanImages(images), [images]);
  const [singleUrl, setSingleUrl] = useState('');
  const [bulkUrls, setBulkUrls] = useState('');
  const [error, setError] = useState('');
  const [brokenImages, setBrokenImages] = useState({});

  const commit = (nextImages) => {
    onChange(cleanImages(nextImages));
    setError('');
  };

  const addUrls = (rawUrls) => {
    const incoming = cleanImages(rawUrls);
    const invalid = incoming.filter(url => !isValidUrl(url));
    if (invalid.length) {
      setError(`URL no valida: ${invalid[0]}`);
      return false;
    }

    const existing = new Set(cleanValue.map(url => url.toLowerCase()));
    const duplicates = incoming.filter(url => existing.has(url.toLowerCase()));
    const uniqueIncoming = incoming.filter(url => !existing.has(url.toLowerCase()));

    if (duplicates.length && !uniqueIncoming.length) {
      setError('Esa imagen ya esta cargada.');
      return false;
    }

    commit([...cleanValue, ...uniqueIncoming]);
    if (duplicates.length) setError('Se omitieron URLs duplicadas.');
    return true;
  };

  const addSingle = () => {
    if (!singleUrl.trim()) return;
    if (addUrls([singleUrl])) setSingleUrl('');
  };

  const addBulk = () => {
    const rows = bulkUrls.split('\n');
    if (addUrls(rows)) setBulkUrls('');
  };

  const removeAt = (index) => {
    commit(cleanValue.filter((_, itemIndex) => itemIndex !== index));
  };

  const move = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= cleanValue.length) return;
    const nextImages = [...cleanValue];
    [nextImages[index], nextImages[target]] = [nextImages[target], nextImages[index]];
    commit(nextImages);
  };

  const setCover = (index) => {
    const nextImages = [...cleanValue];
    const [cover] = nextImages.splice(index, 1);
    commit([cover, ...nextImages]);
  };

  return (
    <section style={panel}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h3 style={{ margin: 0, fontFamily: 'var(--at-display)', fontSize: 18, fontWeight: 700 }}>
            Fotos
          </h3>
          <p style={{ margin: '5px 0 0', color: 'var(--at-ink-2)', fontSize: 12, lineHeight: 1.45 }}>
            La primera imagen sera la portada del auto en el catalogo.
          </p>
        </div>
        <span style={{ fontFamily: 'var(--at-mono)', fontSize: 11, color: 'var(--at-ink-3)' }}>
          {cleanValue.length} {cleanValue.length === 1 ? 'foto' : 'fotos'}
        </span>
      </div>

      {error && (
        <div style={{
          marginTop: 12,
          border: '1px solid #fecaca',
          background: '#fef2f2',
          color: '#991b1b',
          borderRadius: 8,
          padding: '9px 10px',
          fontSize: 12,
        }}>
          {error}
        </div>
      )}

      {cleanValue.length ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3" style={{ gap: 10, marginTop: 14 }}>
          {cleanValue.map((url, index) => (
            <ImageCard
              key={`${url}-${index}`}
              url={url}
              index={index}
              count={cleanValue.length}
              broken={Boolean(brokenImages[url])}
              onBroken={() => setBrokenImages(current => ({ ...current, [url]: true }))}
              onSetCover={() => setCover(index)}
              onMove={(direction) => move(index, direction)}
              onRemove={() => removeAt(index)}
            />
          ))}
        </div>
      ) : (
        <div style={{
          marginTop: 14,
          minHeight: 132,
          display: 'grid',
          placeItems: 'center',
          border: '1px dashed var(--at-border-strong)',
          borderRadius: 12,
          background: 'var(--at-surface)',
          color: 'var(--at-ink-2)',
          textAlign: 'center',
          padding: 20,
        }}>
          <div>
            <div style={{ fontFamily: 'var(--at-display)', color: 'var(--at-ink)', fontWeight: 700 }}>
              Todavia no cargaste fotos de este auto.
            </div>
            <div style={{ marginTop: 4, fontSize: 12 }}>
              Agrega URLs para ver previews y ordenar la galeria.
            </div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-[1fr_auto]" style={{ gap: 8, alignItems: 'end', marginTop: 14 }}>
        <label style={{ display: 'grid', gap: 6, fontSize: 11, color: 'var(--at-ink-3)', fontFamily: 'var(--at-mono)', textTransform: 'uppercase', letterSpacing: '.1em' }}>
          Agregar imagen por URL
          <input
            style={inputStyle}
            value={singleUrl}
            onChange={event => setSingleUrl(event.target.value)}
            placeholder="https://..."
          />
        </label>
        <button type="button" style={{ ...buttonStyle, background: 'var(--at-ink)', color: '#fff' }} onClick={addSingle}>
          Agregar foto
        </button>
      </div>

      <details style={{ marginTop: 10, border: '1px solid var(--at-border)', borderRadius: 10, padding: 12, background: 'var(--at-surface)' }}>
        <summary style={{ cursor: 'pointer', fontSize: 12, fontWeight: 800, color: 'var(--at-ink)' }}>
          Agregar varias URLs
        </summary>
        <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
          <textarea
            style={{ ...inputStyle, minHeight: 88, resize: 'vertical' }}
            value={bulkUrls}
            onChange={event => setBulkUrls(event.target.value)}
            placeholder="Una URL por linea"
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="button" style={{ ...buttonStyle, background: 'var(--at-bg-2)', color: 'var(--at-ink)' }} onClick={addBulk}>
              Agregar lote
            </button>
          </div>
        </div>
      </details>
    </section>
  );
}
