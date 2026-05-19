import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BADGE_LABELS } from '../data/cars';
import { fmtShort } from '../lib/utils';
import { AppHeader, hdrBtn } from '../components/AppHeader';
import { CarCard, SkeletonCard } from '../components/CarCard';
import { EmptyState } from '../components/EmptyState';
import { FilterDrawer } from '../components/FilterDrawer';
import { FilterSidebar } from '../components/FilterSidebar';
import { SearchAlertForm } from '../components/SearchAlertForm';
import { IconClose, IconFilter, IconSearch } from '../components/Icons';
import { trackEvent } from '../services/analyticsService';

const unique = (cars, key, fallback = []) => {
  const values = [...new Set(cars.map(car => car[key]).filter(Boolean))].sort();
  return values.length ? values : fallback;
};

const emptyFilters = {
  type: null,
  brand: null,
  fuel: null,
  trans: null,
  badge: null,
  minPrice: null,
  maxPrice: null,
  minYear: null,
  maxYear: null,
};

export default function Catalogo({ favs, onFav, cars = [], loadingCars = false }) {
  const navigate = useNavigate();
  const { state } = useLocation();
  const initialFilters = useMemo(() => {
    if (!state) return {};
    return Object.fromEntries(Object.entries(state).filter(([key]) => key !== 'q' && key !== 'sort'));
  }, [state]);

  const [q, setQ] = useState(state?.q || '');
  const [filters, setFilters] = useState(() => ({ ...emptyFilters, ...initialFilters }));
  const [sort, setSort] = useState(state?.sort || 'featured');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const options = useMemo(() => ({
    brands: unique(cars, 'brand'),
    types: unique(cars, 'type', ['Auto', 'Camioneta', 'SUV', 'Utilitario']),
    fuels: unique(cars, 'fuel'),
    transmissions: unique(cars, 'trans'),
  }), [cars]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    const results = cars.filter(car => {
      if (query) {
        const haystack = `${car.brand} ${car.model} ${car.version} ${car.year}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      if (filters.type && car.type !== filters.type) return false;
      if (filters.brand && car.brand !== filters.brand) return false;
      if (filters.fuel && car.fuel !== filters.fuel) return false;
      if (filters.trans && car.trans !== filters.trans) return false;
      if (filters.badge && !car.badges.includes(filters.badge)) return false;
      if (filters.minPrice && car.price < filters.minPrice) return false;
      if (filters.maxPrice && car.price > filters.maxPrice) return false;
      if (filters.minYear && car.year < filters.minYear) return false;
      if (filters.maxYear && car.year > filters.maxYear) return false;
      return true;
    });

    if (sort === 'price-asc') results.sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') results.sort((a, b) => b.price - a.price);
    else if (sort === 'new') results.sort((a, b) => b.year - a.year);
    else if (sort === 'km') results.sort((a, b) => a.km - b.km);
    else results.sort((a, b) => (b.badges.includes('destacado') ? 1 : 0) - (a.badges.includes('destacado') ? 1 : 0));

    return results;
  }, [cars, filters, q, sort]);

  const activeChips = [];
  if (filters.type) activeChips.push({ key: 'type', label: filters.type });
  if (filters.brand) activeChips.push({ key: 'brand', label: filters.brand });
  if (filters.fuel) activeChips.push({ key: 'fuel', label: filters.fuel });
  if (filters.trans) activeChips.push({ key: 'trans', label: filters.trans });
  if (filters.badge) activeChips.push({ key: 'badge', label: BADGE_LABELS[filters.badge] });
  if (filters.maxPrice) activeChips.push({ key: 'maxPrice', label: `Hasta ${fmtShort(filters.maxPrice)}` });
  if (filters.minPrice) activeChips.push({ key: 'minPrice', label: `Desde ${fmtShort(filters.minPrice)}` });
  if (filters.minYear) activeChips.push({ key: 'minYear', label: `Desde ${filters.minYear}` });

  const clearChip = key => setFilters(current => ({ ...current, [key]: null }));
  const clearAll = () => {
    setFilters(emptyFilters);
    setQ('');
  };
  const hasActiveFilters = activeChips.length > 0 || q.trim().length > 0;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasActiveFilters) return;
      trackEvent('catalog_filters_changed', {
        source: 'catalog',
        metadata: { q, filters, sort, results: filtered.length },
      });
    }, 700);
    return () => clearTimeout(timer);
  }, [filters, filtered.length, hasActiveFilters, q, sort]);

  return (
    <div className="pb-[88px] md:pb-0">
      <AppHeader onBack={() => navigate('/')} title="Catálogo" right={
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Filtros"
          style={{ ...hdrBtn(false), background: 'var(--at-bg-2)', position: 'relative' }}
        >
          <IconFilter size={18} stroke="var(--at-ink)" />
          {activeChips.length > 0 && (
            <span style={{
              position: 'absolute',
              top: 4,
              right: 4,
              width: 8,
              height: 8,
              borderRadius: 999,
              background: 'var(--at-accent)',
            }} />
          )}
        </button>
      } />

      <div className="hidden md:block" style={{ borderBottom: '1px solid var(--at-border)', padding: '30px 0 22px' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 32px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <h1 style={{
              margin: 0,
              fontFamily: 'var(--at-display)',
              fontSize: 38,
              fontWeight: 550,
              letterSpacing: '-.035em',
              color: 'var(--at-ink)',
            }}>
              Catálogo
            </h1>
            <span style={{ fontFamily: 'var(--at-mono)', fontSize: 11, color: 'var(--at-ink-3)' }}>
              {filtered.length} autos disponibles
            </span>
          </div>
          <p style={{ margin: '8px 0 0', maxWidth: 540, fontSize: 13, lineHeight: 1.55, color: 'var(--at-ink-2)' }}>
            Unidades seleccionadas y gestionadas por AutosTandil. Filtrá por lo que necesitás y consultá directo por WhatsApp.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
        <div style={{ padding: '12px 14px 8px', background: 'var(--at-bg)', position: 'sticky', top: 0, zIndex: 12 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'var(--at-surface)',
            padding: '12px 14px',
            borderRadius: 999,
            border: '1px solid var(--at-border)',
            boxShadow: '0 10px 24px rgba(15,23,42,.06)',
          }}>
            <IconSearch size={16} sw={1.8} stroke="var(--at-ink-2)" />
            <input
              value={q}
              onChange={event => setQ(event.target.value)}
              placeholder="Buscar marca, modelo o año"
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: 14,
                color: 'var(--at-ink)',
                fontFamily: 'inherit',
              }}
            />
            {q && (
              <button
                type="button"
                onClick={() => setQ('')}
                aria-label="Limpiar búsqueda"
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center', padding: 0 }}
              >
                <IconClose size={14} stroke="var(--at-ink-2)" />
              </button>
            )}
          </div>
        </div>

        <div className="catalog-mobile-sort" style={{ padding: '7px 14px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <span style={{ fontSize: 11.5, color: 'var(--at-ink-3)', fontFamily: 'var(--at-mono)' }}>
            {filtered.length} resultados
          </span>
          <select
            value={sort}
            onChange={event => setSort(event.target.value)}
            style={{ border: 'none', background: 'transparent', fontSize: 12, color: 'var(--at-ink)', fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer' }}
          >
            <option value="featured">Destacados</option>
            <option value="new">Más nuevos</option>
            <option value="price-asc">Menor precio</option>
            <option value="price-desc">Mayor precio</option>
            <option value="km">Menor km</option>
          </select>
        </div>

        {hasActiveFilters && (
          <div style={{ display: 'flex', gap: 6, padding: '6px 14px 4px', overflowX: 'auto', alignItems: 'center' }} className="hide-scroll">
            {activeChips.map(chip => (
              <span key={chip.key} style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '6px 7px 6px 10px',
                borderRadius: 999,
                background: 'var(--at-ink)',
                color: '#fff',
                fontSize: 11,
                fontWeight: 700,
                whiteSpace: 'nowrap',
              }}>
                {chip.label}
                <button
                  type="button"
                  onClick={() => clearChip(chip.key)}
                  aria-label={`Quitar filtro ${chip.label}`}
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 999,
                    border: 'none',
                    background: 'rgba(255,255,255,.18)',
                    color: '#fff',
                    display: 'grid',
                    placeItems: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <IconClose size={9} sw={2.5} stroke="#fff" />
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={clearAll}
              style={{
                border: '1px solid var(--at-border)',
                background: 'var(--at-surface)',
                color: 'var(--at-ink-2)',
                borderRadius: 999,
                padding: '6px 10px',
                fontSize: 11,
                fontWeight: 800,
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Limpiar todo
            </button>
          </div>
        )}

        <div className="md:flex md:gap-8 md:items-start md:px-8 md:pt-6">
          <div className="hidden md:block">
            <FilterSidebar filters={filters} setFilters={setFilters} options={options} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="hidden md:flex md:items-center md:justify-between md:mb-4">
              <span style={{ fontFamily: 'var(--at-mono)', fontSize: 11, color: 'var(--at-ink-3)' }}>
                {filtered.length} resultados
              </span>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--at-ink-3)' }}>
                Ordenar
                <select
                  value={sort}
                  onChange={event => setSort(event.target.value)}
                  style={{
                    border: '1px solid var(--at-border)',
                    background: 'var(--at-surface)',
                    borderRadius: 10,
                    padding: '8px 10px',
                    fontSize: 12.5,
                    color: 'var(--at-ink)',
                    fontWeight: 700,
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                  }}
                >
                  <option value="featured">Destacados</option>
                  <option value="new">Más nuevos</option>
                  <option value="price-asc">Menor precio</option>
                  <option value="price-desc">Mayor precio</option>
                  <option value="km">Menor km</option>
                </select>
              </label>
            </div>

            <div data-testid="catalog-grid" className="grid gap-3 md:grid-cols-2 lg:grid-cols-3" style={{ padding: '12px 14px 24px' }}>
              {loading || loadingCars ? (
                [1, 2, 3, 4, 5, 6].map(item => <SkeletonCard key={item} />)
              ) : filtered.length === 0 ? (
                <div style={{ gridColumn: '1 / -1' }}>
                  <EmptyState
                    title="Sin resultados"
                    desc="Probá ajustar los filtros o buscar con otro término."
                    cta={{ label: 'Limpiar filtros', onClick: clearAll }}
                  />
                  <div style={{ marginTop: 14 }}>
                    <SearchAlertForm filters={filters} query={q} source="catalog_empty" />
                  </div>
                </div>
              ) : (
                filtered.map(car => (
                  <CarCard
                    key={car.id}
                    car={car}
                    onOpen={() => navigate(`/auto/${car.id}`)}
                    onFav={onFav}
                    isFav={favs.includes(car.id)}
                  />
                ))
              )}
            </div>
            {!loading && !loadingCars && filtered.length > 0 && (
              <div style={{ padding: '0 14px 28px' }}>
                <SearchAlertForm filters={filters} query={q} source="catalog_bottom" />
              </div>
            )}
          </div>
        </div>
      </div>

      {drawerOpen && (
        <FilterDrawer onClose={() => setDrawerOpen(false)} filters={filters} setFilters={setFilters} options={options} />
      )}
    </div>
  );
}
