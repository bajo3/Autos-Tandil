import { useNavigate } from 'react-router-dom';
import { ATLogo } from './ATLogo';
import { IconBack } from './Icons';

const hdrBtn = (transparent) => ({
  width: 36, height: 36, borderRadius: 999,
  background: transparent ? 'rgba(255,255,255,.92)' : 'transparent',
  border: 'none', display: 'grid', placeItems: 'center', cursor: 'pointer',
  flexShrink: 0,
  boxShadow: transparent ? '0 2px 6px rgba(0,0,0,.12)' : 'none',
});

export function AppHeader({ title, onBack, right, transparent, dark, showLogo = true }) {
  const navigate = useNavigate();
  const fg = dark ? '#fff' : 'var(--at-ink)';
  const handleBack = onBack || (() => navigate(-1));

  return (
    <div className="md:hidden">
      <header style={{
        position: 'sticky', top: 0, zIndex: 30,
        background: transparent ? 'transparent' : 'var(--at-bg)',
        borderBottom: transparent ? 'none' : '1px solid var(--at-border)',
        padding: '8px 14px',
        display: 'flex', alignItems: 'center', gap: 10,
        minHeight: 52,
        color: fg,
      }}>
        {onBack !== undefined ? (
          <button onClick={handleBack} aria-label="Volver" style={hdrBtn(transparent)}>
            <IconBack size={20} stroke={fg} />
          </button>
        ) : showLogo ? (
          <ATLogo size={22} color={fg} dark={dark} />
        ) : null}

        {title && (
          <div style={{
            flex: 1, fontFamily: 'var(--at-display)', fontWeight: 600,
            fontSize: 15, letterSpacing: '-.01em', color: fg,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{title}</div>
        )}
        {!title && <div style={{ flex: 1 }} />}
        {right}
      </header>
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export { hdrBtn };
