import { useEffect, useState } from 'react';

export function Splash({ onDone }) {
  const [phase, setPhase] = useState('in'); // 'in' | 'out'

  useEffect(() => {
    // Start fade-out at 1.7s
    const t1 = setTimeout(() => setPhase('out'), 1700);
    // Remove from DOM at 2.25s (after 0.55s fade)
    const t2 = setTimeout(() => onDone(), 2250);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: '#0c1120',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        transition: phase === 'out' ? 'opacity .55s cubic-bezier(.4,0,1,1)' : 'none',
        opacity: phase === 'out' ? 0 : 1,
        pointerEvents: phase === 'out' ? 'none' : 'auto',
        userSelect: 'none',
      }}
    >
      {/* Ambient glow behind logo */}
      <div style={{
        position: 'absolute',
        width: 320, height: 320,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,68,255,.22) 0%, transparent 70%)',
        animation: 'splashLogoIn .7s cubic-bezier(.25,.8,.25,1) both',
      }} />

      {/* Logo mark */}
      <div style={{
        position: 'relative', zIndex: 1,
        animation: 'splashLogoIn .6s cubic-bezier(.25,.8,.25,1) .05s both',
        marginBottom: 24,
      }}>
        {/* Outer ring */}
        <div style={{
          width: 108, height: 108, borderRadius: 26,
          background: 'rgba(255,255,255,.06)',
          border: '1px solid rgba(255,255,255,.12)',
          display: 'grid', placeItems: 'center',
          boxShadow: '0 0 0 1px rgba(0,68,255,.25), 0 24px 64px -16px rgba(0,68,255,.5)',
        }}>
          <img
            src="/logo-autostandil-mark.png"
            alt=""
            style={{ width: 68, height: 68, objectFit: 'contain', display: 'block' }}
          />
        </div>
      </div>

      {/* Wordmark */}
      <div style={{
        fontFamily: '"Inter", system-ui, sans-serif',
        fontWeight: 800, fontSize: 30, letterSpacing: '-0.03em', fontStyle: 'italic',
        color: '#fff', lineHeight: 1,
        animation: 'splashTagIn .5s cubic-bezier(.25,.8,.25,1) .25s both',
        position: 'relative', zIndex: 1,
      }}>
        Autos<span style={{ color: '#4d7dff' }}>Tandil</span>
      </div>

      {/* Tagline */}
      <div style={{
        marginTop: 10,
        fontFamily: '"JetBrains Mono", ui-monospace, monospace',
        fontSize: 10.5, letterSpacing: '.22em',
        textTransform: 'uppercase', color: 'rgba(255,255,255,.35)',
        animation: 'splashTagIn .5s cubic-bezier(.25,.8,.25,1) .42s both',
        position: 'relative', zIndex: 1,
      }}>
        Tandil · Buenos Aires
      </div>

      {/* Progress bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
        background: 'rgba(255,255,255,.06)',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          background: 'linear-gradient(90deg, #0044ff 0%, #4d7dff 60%, #00cfff 100%)',
          animation: 'splashBarFill 1.55s cubic-bezier(.4,0,.6,1) .12s both',
        }} />
      </div>
    </div>
  );
}
