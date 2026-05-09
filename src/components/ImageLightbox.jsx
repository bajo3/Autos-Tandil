import { useState } from 'react';

const btn = {
  border: 'none',
  borderRadius: 10,
  padding: '9px 12px',
  background: 'rgba(255,255,255,.92)',
  color: '#0f172a',
  fontSize: 12,
  fontWeight: 800,
  cursor: 'pointer',
  fontFamily: 'inherit',
};

export function ImageLightbox({ images, index, onClose, onIndex }) {
  const [zoom, setZoom] = useState(1);
  const [touchStart, setTouchStart] = useState(null);
  const safeImages = images || [];
  const url = safeImages[index];
  const canPrev = index > 0;
  const canNext = index < safeImages.length - 1;

  const go = (direction) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= safeImages.length) return;
    setZoom(1);
    onIndex(nextIndex);
  };

  const onTouchEnd = (event) => {
    if (touchStart === null) return;
    const delta = event.changedTouches[0].clientX - touchStart;
    setTouchStart(null);
    if (Math.abs(delta) < 42) return;
    go(delta < 0 ? 1 : -1);
  };

  if (!url) return null;

  return (
    <div
      data-testid="image-lightbox"
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(2,6,23,.94)',
        display: 'grid',
        gridTemplateRows: 'auto 1fr auto',
        padding: 14,
        color: '#fff',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
        <div style={{ fontFamily: 'var(--at-mono)', fontSize: 12, letterSpacing: '.08em' }}>
          {index + 1} / {safeImages.length}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <button type="button" style={btn} onClick={() => setZoom(z => Math.max(1, Number((z - .25).toFixed(2))))}>- Zoom</button>
          <button type="button" style={btn} onClick={() => setZoom(1)}>100%</button>
          <button type="button" style={btn} onClick={() => setZoom(z => Math.min(3, Number((z + .25).toFixed(2))))}>+ Zoom</button>
          <button type="button" style={btn} onClick={onClose}>Cerrar</button>
        </div>
      </div>

      <div
        onTouchStart={event => setTouchStart(event.touches[0].clientX)}
        onTouchEnd={onTouchEnd}
        style={{ position: 'relative', minHeight: 0, display: 'grid', placeItems: 'center', overflow: 'auto', touchAction: 'pan-y' }}
      >
        <button type="button" onClick={() => go(-1)} disabled={!canPrev} style={{ ...btn, position: 'absolute', left: 4, top: '50%', transform: 'translateY(-50%)', opacity: canPrev ? 1 : .35, zIndex: 2 }}>
          Anterior
        </button>
        <img
          src={url}
          alt=""
          style={{
            maxWidth: zoom === 1 ? '100%' : `${zoom * 100}%`,
            maxHeight: zoom === 1 ? '100%' : 'none',
            width: zoom === 1 ? 'auto' : `${zoom * 100}%`,
            borderRadius: 12,
            boxShadow: '0 24px 80px rgba(0,0,0,.45)',
          }}
        />
        <button type="button" onClick={() => go(1)} disabled={!canNext} style={{ ...btn, position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', opacity: canNext ? 1 : .35, zIndex: 2 }}>
          Siguiente
        </button>
      </div>

      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingTop: 10 }}>
        {safeImages.map((item, itemIndex) => (
          <button key={item} type="button" onClick={() => { setZoom(1); onIndex(itemIndex); }} style={{ flex: '0 0 72px', height: 54, borderRadius: 8, overflow: 'hidden', border: '2px solid ' + (itemIndex === index ? '#fff' : 'transparent'), padding: 0, background: 'rgba(255,255,255,.12)' }}>
            <img src={item} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </button>
        ))}
      </div>
    </div>
  );
}
