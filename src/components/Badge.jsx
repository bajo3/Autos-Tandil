import { IconStar, IconCalc, IconBolt } from './Icons';

// Colores fijos (no dependientes del tema) para que los badges sean legibles
// siempre: sobre fotos y sobre fondos claros u oscuros. Antes usaban
// var(--at-ink), que en modo oscuro se vuelve casi blanco → texto invisible.
const map = {
  destacado: { label: 'Destacado', bg: '#0044ff',               fg: '#fff',    icon: <IconStar size={10} sw={2} filled stroke="currentColor" /> },
  financia:  { label: 'Financia',  bg: 'rgba(255,255,255,.94)', fg: '#0f172a', icon: <IconCalc size={10} sw={2} /> },
  permuta:   { label: 'Permuta',   bg: 'rgba(255,255,255,.94)', fg: '#0f172a', icon: null },
  nuevo:     { label: 'Nuevo',     bg: '#0f172a',               fg: '#fff',    icon: <IconBolt size={10} sw={0} fill="#fff" stroke="#fff" /> },
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
