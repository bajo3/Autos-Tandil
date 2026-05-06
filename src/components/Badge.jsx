import { IconStar, IconCalc, IconBolt } from './Icons';

const map = {
  destacado: { label: 'Destacado', bg: 'var(--at-accent-soft)', fg: 'var(--at-accent-strong)', icon: <IconStar size={10} sw={2} filled stroke="currentColor" /> },
  financia:  { label: 'Financia',  bg: 'rgba(255,255,255,.92)', fg: 'var(--at-ink)',           icon: <IconCalc size={10} sw={2} /> },
  permuta:   { label: 'Permuta',   bg: 'rgba(255,255,255,.92)', fg: 'var(--at-ink)',           icon: null },
  nuevo:     { label: 'Nuevo',     bg: 'var(--at-ink)',         fg: '#fff',                    icon: <IconBolt size={10} sw={0} fill="#fff" stroke="#fff" /> },
};

export function Badge({ kind, sm }) {
  const m = map[kind] || { label: kind, bg: '#eee', fg: '#000', icon: null };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: sm ? '2px 7px' : '3px 9px',
      borderRadius: 999,
      background: m.bg, color: m.fg,
      fontSize: sm ? 9.5 : 10.5, fontWeight: 600,
      letterSpacing: '0.02em', textTransform: 'uppercase',
      whiteSpace: 'nowrap',
      backdropFilter: 'blur(6px)',
      WebkitBackdropFilter: 'blur(6px)',
    }}>
      {m.icon}{m.label}
    </span>
  );
}
