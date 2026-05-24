import { NavLink, useNavigate } from 'react-router-dom';
import { ATLogo } from './ATLogo';
import { IconWhatsapp, IconHeart, IconMoon, IconSun } from './Icons';
import { buildWhatsapp } from '../lib/utils';
import { useDarkMode } from '../hooks/useDarkMode';

const navItems = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/catalogo', label: 'Catálogo' },
  { to: '/subastas', label: 'Subastas' },
];

export function DesktopNav({ favCount = 0 }) {
  const navigate = useNavigate();
  const { dark, toggle } = useDarkMode();

  return (
    <div className="hidden md:block">
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'color-mix(in srgb, var(--at-bg) 95%, transparent)',
        backdropFilter: 'blur(20px) saturate(160%)',
        WebkitBackdropFilter: 'blur(20px) saturate(160%)',
        borderBottom: '1px solid var(--at-border)',
      }}>
        <div style={{
          maxWidth: '80rem', margin: '0 auto',
          padding: '0 32px', height: 64,
          display: 'flex', alignItems: 'center', gap: 32,
        }}>
          <button onClick={() => navigate('/')}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
            <ATLogo size={22} />
          </button>

          <nav style={{ display: 'flex', gap: 2, flex: 1 }}>
            {navItems.map(({ to, label, end }) => (
              <NavLink key={to} to={to} end={end}
                style={({ isActive }) => ({
                  padding: '7px 12px', borderRadius: 8,
                  fontSize: 13.5, fontWeight: isActive ? 600 : 450,
                  color: isActive ? 'var(--at-ink)' : 'var(--at-ink-2)',
                  textDecoration: 'none',
                  background: isActive ? 'var(--at-bg-2)' : 'transparent',
                  transition: 'color .15s, background .15s',
                })}>
                {label}
              </NavLink>
            ))}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={toggle} aria-label={dark ? 'Modo claro' : 'Modo oscuro'}
              style={{
                width: 36, height: 36, borderRadius: 8,
                background: 'var(--at-bg-2)', border: '1px solid var(--at-border)',
                display: 'grid', placeItems: 'center', cursor: 'pointer',
              }}>
              {dark ? <IconSun size={16} sw={1.8} stroke="var(--at-ink-2)" /> : <IconMoon size={16} sw={1.8} stroke="var(--at-ink-2)" />}
            </button>

            <button onClick={() => navigate('/favoritos')}
              style={{
                position: 'relative', width: 36, height: 36, borderRadius: 8,
                background: 'var(--at-bg-2)', border: '1px solid var(--at-border)',
                display: 'grid', placeItems: 'center', cursor: 'pointer',
              }}>
              <IconHeart size={16} sw={1.8} stroke="var(--at-ink-2)" />
              {favCount > 0 && (
                <span style={{
                  position: 'absolute', top: -5, right: -5,
                  minWidth: 16, height: 16, padding: '0 4px',
                  borderRadius: 999, background: 'var(--at-accent)',
                  color: '#fff', fontSize: 9, fontWeight: 700,
                  display: 'grid', placeItems: 'center',
                  border: '2px solid var(--at-bg)',
                }}>{favCount}</span>
              )}
            </button>

            <button onClick={() => navigate('/vender')}
              style={{
                padding: '8px 16px', borderRadius: 8,
                background: 'var(--at-bg-2)', border: '1px solid var(--at-border)',
                fontSize: 13, fontWeight: 600, color: 'var(--at-ink)',
                cursor: 'pointer', fontFamily: 'inherit',
              }}>
              Vender mi auto
            </button>

            <a href={buildWhatsapp(null, 'contact')} target="_blank" rel="noopener noreferrer"
              style={{
                padding: '8px 16px', borderRadius: 8,
                background: 'var(--at-accent)', color: '#fff',
                fontWeight: 600, fontSize: 13, textDecoration: 'none',
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}>
              <IconWhatsapp size={13} fill="#fff" />WhatsApp
            </a>
          </div>
        </div>
      </header>
    </div>
  );
}
