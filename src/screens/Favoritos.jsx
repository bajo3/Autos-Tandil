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
      <div className="hidden md:block" style={{ borderBottom: '1px solid var(--at-border)', padding: '28px 0 20px' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 32px' }}>
          <h1 style={{
            margin: 0, fontFamily: 'var(--at-display)',
            fontSize: 36, fontWeight: 500, letterSpacing: '-.03em', color: 'var(--at-ink)',
          }}>Favoritos</h1>
        </div>
      </div>

      <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
        {cars.length === 0 ? (
          <div style={{ padding: '40px 20px' }}>
            <EmptyState
              title="Aún no guardaste autos"
              desc="Tocá el corazón en cualquier auto para guardarlo y verlo después."
              cta={{ label: 'Ir al catálogo', onClick: () => navigate('/catalogo') }}
              icon={<IconHeart size={32} sw={1.4} stroke="var(--at-ink-3)" />}
            />
          </div>
        ) : (
          <>
            <div style={{ padding: '8px 20px 0', fontSize: 12, color: 'var(--at-ink-3)', fontFamily: 'var(--at-mono)' }}>
              {cars.length} {cars.length === 1 ? 'auto guardado' : 'autos guardados'}
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3" style={{ padding: '14px 14px 24px' }}>
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
