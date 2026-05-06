import { IconChevron } from './Icons';

export function SectionHeader({ eyebrow, title, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
      <div>
        <div style={{
          fontFamily: 'var(--at-mono)', fontSize: 10, letterSpacing: '.18em',
          textTransform: 'uppercase', color: 'var(--at-ink-3)',
        }}>{eyebrow}</div>
        <h2 style={{
          margin: '4px 0 0', fontFamily: 'var(--at-display)',
          fontSize: 22, fontWeight: 500, letterSpacing: '-.025em', color: 'var(--at-ink)',
          lineHeight: 1.1,
        }}>{title}</h2>
      </div>
      {action && (
        <button onClick={action.onClick} style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          fontSize: 12, fontWeight: 600, color: 'var(--at-ink)',
          display: 'inline-flex', alignItems: 'center', gap: 2,
          padding: '4px 0', whiteSpace: 'nowrap',
        }}>{action.label}<IconChevron size={13} sw={2} /></button>
      )}
    </div>
  );
}
