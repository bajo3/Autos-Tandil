export function ATLogo({ size = 28, color = 'currentColor', dark = false, full = false }) {
  if (full) {
    return (
      <img src="/logo-autostandil-trim.png" alt="AutosTandil"
        style={{
          height: size * 1.6, width: 'auto', display: 'block',
          filter: dark ? 'brightness(0) invert(1)' : 'none',
        }} />
    );
  }
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.36 }}>
      <img src="/logo-autostandil-mark.png" alt=""
        style={{
          height: size, width: 'auto', display: 'block', flexShrink: 0,
          filter: dark ? 'brightness(0) invert(1)' : 'none',
        }} />
      <span style={{
        fontFamily: '"Inter", system-ui, sans-serif',
        fontWeight: 800,
        fontSize: size * 0.62,
        letterSpacing: '-0.02em',
        lineHeight: 1,
        color,
        whiteSpace: 'nowrap',
        fontStyle: 'italic',
      }}>
        Autos<span style={{ color: 'var(--at-accent)' }}>Tandil</span>
      </span>
    </div>
  );
}
