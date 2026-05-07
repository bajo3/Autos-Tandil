import { useNavigate } from 'react-router-dom';
import { CARS as MOCK_CARS } from '../data/cars';
import { AppHeader } from '../components/AppHeader';
import { CarCard } from '../components/CarCard';
import { EmptyState } from '../components/EmptyState';
import { IconHeart } from '../components/Icons';

export default function Favoritos({ favs, onFav, cars: inventoryCars = MOCK_CARS }) {
  const navigate = useNavigate();
  const cars = favs.map(id => inventoryCars.find(c => c.id === id)).filter(Boolean);

  return (
    <div className="pb-[88px] md:pb-0">
      <AppHeader onBack={() => navigate('/')} title="Tus favoritos" />

      {/* Desktop page title */}
      <div className="hidden md:block" style={{ borderBottom: '1px solid var(--at-border)', background: 'var(--at-bg)', padding: '24px 0 20px' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 32px' }}>
          <h1 style={{
            margin: '0 0 4px', fontFamily: 'var(--at-display)',
            fontSize: 34, fontWeight: 500, letterSpacing: '-.03em', color: 'var(--at-ink)',
            lineHeight: 1,
          }}>Favoritos</h1>
          <div style={{ fontFamily: 'var(--at-mono)', fontSize: 11, color: 'var(--at-ink-3)' }}>
            {cars.length === 0
              ? 'Ningún auto guardado todavía'
              : `${cars.length} ${cars.length === 1 ? 'auto guardado' : 'autos guardados'}`}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
        {cars.length === 0 ? (
          <div style={{ padding: '48px 20px' }}>
            <EmptyState
              title="Aún no guardaste autos"
              desc="Tocá el corazón en cualquier auto para guardarlo y compararlo después."
              cta={{ label: 'Ir al catálogo', onClick: () => navigate('/catalogo') }}
              icon={<IconHeart size={32} sw={1.4} stroke="var(--at-ink-3)" />}
            />
          </div>
        ) : (
          <>
            {/* Mobile count */}
            <div className="md:hidden" style={{ padding: '10px 14px 0', fontSize: 11.5, color: 'var(--at-ink-3)', fontFamily: 'var(--at-mono)' }}>
              {cars.length} {cars.length === 1 ? 'auto guardado' : 'autos guardados'}
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" style={{ padding: '12px 14px 32px' }}>
              {cars.map(c => (
                <CarCard key={c.id} car={c}
                  onOpen={() => navigate(`/auto/${c.id}`)}
                  onFav={onFav} isFav={true} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
