export function ATLogo({ size = 28, color = 'currentColor', dark = false, full = false, variant }) {
  const isDark = variant ? variant === 'dark' : dark;
  if (full) {
    return (
      <img src="/logo-autostandil-trim.png" alt="AutosTandil"
        data-testid="app-logo"
        style={{
          height: size * 1.6, width: 'auto', display: 'block',
          filter: isDark ? 'brightness(0) invert(1)' : 'none',
        }} />
    );
  }
  return (
    <div data-testid="app-logo" style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.36 }}>
      <span style={{
        width: size * 1.22,
        height: size * 1.22,
        borderRadius: size * 0.28,
        background: isDark ? 'rgba(255,255,255,.96)' : '#fff',
        border: '1px solid ' + (isDark ? 'rgba(255,255,255,.24)' : 'var(--at-border)'),
        display: 'grid',
        placeItems: 'center',
        boxShadow: isDark ? '0 8px 24px -14px rgba(0,0,0,.55)' : '0 8px 18px -16px rgba(15,23,42,.45)',
        flexShrink: 0,
      }}>
        <img src="/logo-autostandil-mark.png" alt=""
        style={{
          height: size * 0.82, width: 'auto', display: 'block',
        }} />
      </span>
      <span style={{
        fontFamily: '"Inter", system-ui, sans-serif',
        fontWeight: 800,
        fontSize: size * 0.62,
        letterSpacing: '-0.02em',
        lineHeight: 1,
        color: isDark ? '#fff' : color,
        whiteSpace: 'nowrap',
        fontStyle: 'italic',
      }}>
        Autos<span style={{ color: 'var(--at-accent)' }}>Tandil</span>
      </span>
    </div>
  );
}
