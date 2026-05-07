import { NavLink, useNavigate } from 'react-router-dom';
import { ATLogo } from './ATLogo';
import { IconWhatsapp, IconHeart } from './Icons';
import { buildWhatsapp } from '../lib/utils';

const navItems = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/catalogo', label: 'Catálogo' },
  { to: '/vender', label: 'Vender mi auto' },
];

export function DesktopNav({ favCount = 0 }) {
  const navigate = useNavigate();

  return (
    <div className="hidden md:block">
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(250,250,247,.97)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderBottom: '1px solid var(--at-border)',
        boxShadow: '0 1px 0 0 var(--at-border)',
      }}>
        <div style={{
          maxWidth: '80rem', margin: '0 auto',
          padding: '0 32px', height: 64,
          display: 'flex', alignItems: 'center', gap: 28,
        }}>
          {/* Logo */}
          <button onClick={() => navigate('/')}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}>
            <ATLogo size={24} />
          </button>

          {/* Divider */}
          <div style={{ width: 1, height: 20, background: 'var(--at-border-strong)', flexShrink: 0 }} />

          {/* Nav links */}
          <nav style={{ display: 'flex', gap: 1, flex: 1, alignItems: 'center' }}>
            {navItems.map(({ to, label, end }) => (
              <NavLink key={to} to={to} end={end}
                style={({ isActive }) => ({
                  padding: '7px 13px', borderRadius: 8,
                  fontSize: 13.5, fontWeight: isActive ? 600 : 450,
                  color: isActive ? 'var(--at-ink)' : 'var(--at-ink-2)',
                  textDecoration: 'none',
                  background: isActive ? 'var(--at-bg-2)' : 'transparent',
                  transition: 'color .15s, background .15s',
                  letterSpacing: '-.01em',
                })}>
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* Favorites */}
            <button onClick={() => navigate('/favoritos')}
              style={{
                position: 'relative', width: 38, height: 38, borderRadius: 9,
                background: 'var(--at-bg-2)', border: '1px solid var(--at-border)',
                display: 'grid', placeItems: 'center', cursor: 'pointer',
                transition: 'border-color .15s, background .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--at-border)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--at-bg-2)'; }}>
              <IconHeart size={16} sw={1.8} stroke="var(--at-ink-2)" />
              {favCount > 0 && (
                <span style={{
                  position: 'absolute', top: -5, right: -5,
                  minWidth: 17, height: 17, padding: '0 4px',
                  borderRadius: 999, background: 'var(--at-accent)',
                  color: '#fff', fontSize: 9.5, fontWeight: 700,
                  display: 'grid', placeItems: 'center',
                  border: '2px solid var(--at-bg)',
                }}>{favCount}</span>
              )}
            </button>

            {/* WhatsApp CTA */}
            <a href={buildWhatsapp(null, 'contact')} target="_blank" rel="noopener noreferrer"
              style={{
                padding: '9px 18px', borderRadius: 9,
                background: 'var(--at-accent)', color: '#fff',
                fontWeight: 600, fontSize: 13, textDecoration: 'none',
                display: 'inline-flex', alignItems: 'center', gap: 6,
                letterSpacing: '-.01em',
                boxShadow: '0 3px 10px -4px rgba(0,68,255,.4)',
                transition: 'opacity .15s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '.88'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
              <IconWhatsapp size={14} fill="#fff" />Consultar
            </a>
          </div>
        </div>
      </header>
    </div>
  );
}
