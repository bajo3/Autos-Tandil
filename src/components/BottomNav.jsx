import { useNavigate, useLocation } from 'react-router-dom';
import { IconHome, IconCar, IconHandshake, IconHeart } from './Icons';

const items = [
  { id: 'home',     path: '/',         label: 'Inicio',   Icon: IconHome },
  { id: 'catalogo', path: '/catalogo', label: 'Catálogo', Icon: IconCar },
  { id: 'vender',   path: '/vender',   label: 'Vender',   Icon: IconHandshake },
  { id: 'favoritos',path: '/favoritos',label: 'Favoritos',Icon: IconHeart },
];

export function BottomNav({ favCount = 0 }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <div className="md:hidden">
      <nav style={{
        position: 'fixed', left: 0, right: 0, width: '100%', bottom: 0,
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 6px)',
        paddingTop: 6,
        background: 'rgba(250,250,247,.96)',
        backdropFilter: 'blur(20px) saturate(160%)',
        WebkitBackdropFilter: 'blur(20px) saturate(160%)',
        borderTop: '1px solid var(--at-border)',
        display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
        zIndex: 40,
      }}>
        {items.map(({ id, path, label, Icon }) => {
          const active = pathname === path || (path !== '/' && pathname.startsWith(path));
          return (
            <button key={id} onClick={() => navigate(path)}
              style={{
                border: 'none', background: 'transparent', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                padding: '6px 0 4px', position: 'relative',
                color: active ? 'var(--at-ink)' : 'var(--at-ink-3)',
                transition: 'color .15s',
              }}>
              <span style={{ position: 'relative' }}>
                <Icon size={22} sw={active ? 2 : 1.6} filled={id === 'favoritos' && active} stroke="currentColor" />
                {id === 'favoritos' && favCount > 0 && (
                  <span style={{
                    position: 'absolute', top: -4, right: -7,
                    minWidth: 16, height: 16, padding: '0 4px',
                    borderRadius: 999, background: 'var(--at-accent)',
                    color: '#fff', fontSize: 9.5, fontWeight: 700,
                    display: 'grid', placeItems: 'center',
                    border: '2px solid var(--at-bg)',
                  }}>{favCount}</span>
                )}
              </span>
              <span style={{ fontSize: 10.5, fontWeight: active ? 600 : 500, letterSpacing: '.01em' }}>{label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
