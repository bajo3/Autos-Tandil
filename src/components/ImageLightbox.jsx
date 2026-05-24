import { useEffect, useRef, useState } from 'react';
import { IconClose, IconBack, IconChevron } from './Icons';

export function ImageLightbox({ images, index, onClose, onIndex }) {
  const [zoom, setZoom] = useState(1);
  const [touchStart, setTouchStart] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const gestureRef = useRef(null);
  const safeImages = images || [];
  const url = safeImages[index];
  const canPrev = index > 0;
  const canNext = index < safeImages.length - 1;

  // Detect mobile / coarse pointer
  useEffect(() => {
    const query = window.matchMedia('(max-width: 760px), (pointer: coarse)');
    const sync = () => setIsMobile(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  // Lock body scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const clampZoom = (v) => Math.min(4, Math.max(1, Number(v.toFixed(2))));

  const getTouchDistance = (touches) => {
    const [a, b] = touches;
    if (!a || !b) return 0;
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
  };

  const go = (dir) => {
    const next = index + dir;
    if (next < 0 || next >= safeImages.length) return;
    setZoom(1);
    onIndex(next);
  };

  const onTouchStart = (e) => {
    if (e.touches.length >= 2) {
      gestureRef.current = { type: 'pinch', distance: getTouchDistance(e.touches), zoom };
      setTouchStart(null);
      return;
    }
    gestureRef.current = { type: 'swipe' };
    setTouchStart(e.touches[0].clientX);
  };

  const onTouchMove = (e) => {
    if (e.touches.length < 2 || gestureRef.current?.type !== 'pinch') return;
    e.preventDefault();
    const d = getTouchDistance(e.touches);
    if (!gestureRef.current.distance || !d) return;
    setZoom(clampZoom(gestureRef.current.zoom * (d / gestureRef.current.distance)));
  };

  const onTouchEnd = (e) => {
    if (gestureRef.current?.type === 'pinch') {
      if (e.touches.length < 2) gestureRef.current = null;
      return;
    }
    if (touchStart === null) return;
    const delta = e.changedTouches[0].clientX - touchStart;
    setTouchStart(null);
    gestureRef.current = null;
    if (Math.abs(delta) < 42 || zoom > 1.05) return;
    go(delta < 0 ? 1 : -1);
  };

  if (!url) return null;

  const arrowBtn = {
    position: 'absolute', top: '50%', transform: 'translateY(-50%)',
    width: 44, height: 44, borderRadius: 999,
    background: 'rgba(255,255,255,.14)', border: '1px solid rgba(255,255,255,.22)',
    color: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer',
    backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
    zIndex: 4, transition: 'background .15s',
  };

  return (
    <div
      data-testid="image-lightbox"
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        display: 'flex', flexDirection: 'column',
        background: '#000',
        // Animate in
        animation: 'fadeInBg .18s ease forwards',
      }}
    >
      {/* ── Blurred backdrop image ── */}
      <img
        src={url}
        aria-hidden="true"
        key={`blur-${url}`}
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover',
          filter: 'blur(36px) brightness(0.22) saturate(0.5)',
          transform: 'scale(1.14)',
          pointerEvents: 'none', userSelect: 'none',
        }}
      />

      {/* ── Top bar ── */}
      <div style={{
        position: 'relative', zIndex: 3,
        padding: 'calc(env(safe-area-inset-top, 0px) + 12px) 16px 12px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'linear-gradient(to bottom, rgba(0,0,0,.55) 0%, transparent 100%)',
        pointerEvents: 'none',
      }}>
        <span style={{
          color: 'rgba(255,255,255,.72)', fontFamily: 'var(--at-mono)',
          fontSize: 12, letterSpacing: '.06em', pointerEvents: 'none',
        }}>
          {index + 1} / {safeImages.length}
        </span>

        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          style={{
            width: 38, height: 38, borderRadius: 999,
            background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.2)',
            color: '#fff', display: 'grid', placeItems: 'center',
            cursor: 'pointer', pointerEvents: 'auto',
            backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <IconClose size={16} sw={2.2} stroke="#fff" />
        </button>
      </div>

      {/* ── Main image ── */}
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          flex: 1, position: 'relative', zIndex: 2,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          minHeight: 0, overflow: 'hidden',
          padding: isMobile ? '0 12px' : '0 60px',
          touchAction: 'none',
        }}
      >
        <img
          key={url}
          src={url}
          alt=""
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            borderRadius: 10,
            boxShadow: '0 32px 80px rgba(0,0,0,.6)',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            WebkitTouchCallout: 'none',
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
            transition: zoom === 1 ? 'transform .2s ease' : 'none',
            display: 'block',
          }}
        />

        {/* Desktop arrows */}
        {!isMobile && (
          <>
            <button type="button" onClick={() => go(-1)} disabled={!canPrev}
              style={{ ...arrowBtn, left: 14, opacity: canPrev ? 1 : .25 }}>
              <IconBack size={18} stroke="#fff" sw={2.2} />
            </button>
            <button type="button" onClick={() => go(1)} disabled={!canNext}
              style={{ ...arrowBtn, right: 14, opacity: canNext ? 1 : .25 }}>
              <IconChevron size={18} stroke="#fff" sw={2.2} />
            </button>
          </>
        )}
      </div>

      {/* ── Thumbnail strip ── */}
      {safeImages.length > 1 && (
        <div style={{
          position: 'relative', zIndex: 3,
          background: 'linear-gradient(to top, rgba(0,0,0,.65) 0%, transparent 100%)',
          padding: 'calc(env(safe-area-inset-bottom, 0px) + 14px) 16px calc(env(safe-area-inset-bottom, 0px) + 16px)',
        }}>
          <div style={{
            display: 'flex', gap: 6, overflowX: 'auto', justifyContent: 'center',
            scrollbarWidth: 'none',
          }}
            className="hide-scroll"
          >
            {safeImages.map((item, i) => (
              <button
                key={`${item}-${i}`}
                type="button"
                onClick={() => { setZoom(1); onIndex(i); }}
                style={{
                  flex: '0 0 52px', height: 38,
                  borderRadius: 6, overflow: 'hidden',
                  border: '2px solid ' + (i === index ? '#fff' : 'rgba(255,255,255,.25)'),
                  padding: 0, cursor: 'pointer',
                  opacity: i === index ? 1 : 0.5,
                  transition: 'opacity .15s, border-color .15s',
                  background: 'rgba(255,255,255,.08)',
                }}
              >
                <img
                  src={item}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
