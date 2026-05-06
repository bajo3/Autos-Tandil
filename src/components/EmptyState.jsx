export function EmptyState({ title, desc, cta, icon }) {
  return (
    <div style={{
      padding: '50px 24px', textAlign: 'center',
      background: 'var(--at-surface)', border: '1px dashed var(--at-border-strong)',
      borderRadius: 16,
    }}>
      {icon && <div style={{ marginBottom: 14, display: 'grid', placeItems: 'center' }}>{icon}</div>}
      <h3 style={{ margin: 0, fontFamily: 'var(--at-display)', fontSize: 18, fontWeight: 600, letterSpacing: '-.02em' }}>{title}</h3>
      <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--at-ink-2)', lineHeight: 1.5 }}>{desc}</p>
      {cta && (
        <button onClick={cta.onClick} style={{
          marginTop: 14, padding: '10px 18px', borderRadius: 999,
          background: 'var(--at-ink)', color: '#fff', border: 'none',
          fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
        }}>{cta.label}</button>
      )}
    </div>
  );
}
