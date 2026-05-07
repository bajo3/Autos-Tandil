import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BADGE_LABELS } from '../data/cars';
import { fmtShort } from '../lib/utils';
import { AppHeader, hdrBtn } from '../components/AppHeader';
import { CarCard, SkeletonCard } from '../components/CarCard';
import { FilterDrawer } from '../components/FilterDrawer';
import { FilterSidebar } from '../components/FilterSidebar';
import { EmptyState } from '../components/EmptyState';
import { IconFilter, IconSearch, IconClose } from '../components/Icons';

const unique = (cars, key, fallback = []) => {
  const values = [...new Set(cars.map(c => c[key]).filter(Boolean))].sort();
  return values.length ? values : fallback;
};

export default function Catalogo({ favs, onFav, cars = [], loadingCars = false }) {
  const navigate = useNavigate();
  const { state } = useLocation();

  const [q, setQ] = useState('');
  const [filters, setFilters] = useState(() => ({
    type: null, brand: null, fuel: null, trans: null, badge: null,
    minPrice: null, maxPrice: null, minYear: null, maxYear: null,
    ...(state || {}),
  }));
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
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => {
    let r = cars.filter(c => {
      if (q) {
        const s = (c.brand + ' ' + c.model + ' ' + c.version + ' ' + c.year).toLowerCase();
        if (!s.includes(q.toLowerCase())) return false;
      }
      if (filters.type && c.type !== filters.type) return false;
      if (filters.brand && c.brand !== filters.brand) return false;
      if (filters.fuel && c.fuel !== filters.fuel) return false;
      if (filters.trans && c.trans !== filters.trans) return false;
      if (filters.badge && !c.badges.includes(filters.badge)) return false;
      if (filters.minPrice && c.price < filters.minPrice) return false;
      if (filters.maxPrice && c.price > filters.maxPrice) return false;
      if (filters.minYear && c.year < filters.minYear) return false;
      if (filters.maxYear && c.year > filters.maxYear) return false;
      return true;
    });
    if (sort === 'price-asc') r.sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') r.sort((a, b) => b.price - a.price);
    else if (sort === 'new') r.sort((a, b) => b.year - a.year);
    else if (sort === 'km') r.sort((a, b) => a.km - b.km);
    else r.sort((a, b) => (b.badges.includes('destacado') ? 1 : 0) - (a.badges.includes('destacado') ? 1 : 0));
    return r;
  }, [cars, q, filters, sort]);

  const activeChips = [];
  if (filters.type) activeChips.push({ k: 'type', l: filters.type });
  if (filters.brand) activeChips.push({ k: 'brand', l: filters.brand });
  if (filters.fuel) activeChips.push({ k: 'fuel', l: filters.fuel });
  if (filters.trans) activeChips.push({ k: 'trans', l: filters.trans });
  if (filters.badge) activeChips.push({ k: 'badge', l: BADGE_LABELS[filters.badge] });
  if (filters.maxPrice) activeChips.push({ k: 'maxPrice', l: 'Hasta ' + fmtShort(filters.maxPrice) });
  if (filters.minPrice) activeChips.push({ k: 'minPrice', l: 'Desde ' + fmtShort(filters.minPrice) });
  if (filters.minYear) activeChips.push({ k: 'minYear', l: 'Desde ' + filters.minYear });

  const clearChip = (k) => setFilters(f => ({ ...f, [k]: null }));
  const clearAll = () => { setFilters({ type: null, brand: null, fuel: null, trans: null, badge: null, minPrice: null, maxPrice: null, minYear: null, maxYear: null }); setQ(''); };

  return (
    <div className="pb-[88px] md:pb-0">

      {/* Mobile header */}
      <AppHeader onBack={() => navigate('/')} title="Catálogo" right={
        <button onClick={() => setDrawerOpen(true)} aria-label="Filtros"
          style={{ ...hdrBtn(false), background: 'var(--at-bg-2)', border: '1px solid var(--at-border)', position: 'relative' }}>
          <IconFilter size={18} stroke="var(--at-ink)" />
          {activeChips.length > 0 && (
            <span style={{
              position: 'absolute', top: 3, right: 3,
              width: 9, height: 9, borderRadius: 999, background: 'var(--at-accent)',
              border: '1.5px solid var(--at-bg)',
            }} />
          )}
        </button>
      } />

      {/* Desktop page header */}
      <div className="hidden md:block" style={{ borderBottom: '1px solid var(--at-border)', background: 'var(--at-bg)', padding: '24px 0 0' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 32px' }}>
          {/* Title + search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 20, flexWrap: 'wrap' }}>
            <div>
              <h1 style={{
                margin: 0, fontFamily: 'var(--at-display)',
                fontSize: 34, fontWeight: 500, letterSpacing: '-.03em', color: 'var(--at-ink)',
                lineHeight: 1,
              }}>Catálogo</h1>
              <div style={{ fontFamily: 'var(--at-mono)', fontSize: 11, color: 'var(--at-ink-3)', marginTop: 4 }}>
                {filtered.length} autos disponibles
              </div>
            </div>
            {/* Desktop search */}
            <div style={{ flex: 1, maxWidth: 420, display: 'flex', alignItems: 'center', gap: 8, background: 'var(--at-surface)', padding: '10px 16px', borderRadius: 999, border: '1px solid var(--at-border)' }}>
              <IconSearch size={16} sw={1.8} stroke="var(--at-ink-3)" />
              <input value={q} onChange={e => setQ(e.target.value)}
                placeholder="Buscar marca, modelo, año…"
                style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13.5, color: 'var(--at-ink)', fontFamily: 'inherit' }} />
              {q && (
                <button onClick={() => setQ('')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center', padding: 0 }}>
                  <IconClose size={14} stroke="var(--at-ink-3)" />
                </button>
              )}
            </div>
            {/* Desktop sort */}
            <select value={sort} onChange={e => setSort(e.target.value)} style={{
              border: '1px solid var(--at-border)', background: 'var(--at-surface)', borderRadius: 8,
              padding: '9px 12px', fontSize: 13, color: 'var(--at-ink)', fontWeight: 500,
              fontFamily: 'inherit', cursor: 'pointer', flexShrink: 0,
            }}>
              <option value="featured">Destacados primero</option>
              <option value="new">Más nuevos</option>
              <option value="price-asc">Menor precio</option>
              <option value="price-desc">Mayor precio</option>
              <option value="km">Menor km</option>
            </select>
          </div>
          {/* Active chips (desktop) */}
          {activeChips.length > 0 && (
            <div style={{ display: 'flex', gap: 6, paddingBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              {activeChips.map(ch => (
                <span key={ch.k} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '5px 6px 5px 11px', borderRadius: 999,
                  background: 'var(--at-ink)', color: '#fff',
                  fontSize: 11.5, fontWeight: 500, whiteSpace: 'nowrap',
                }}>
                  {ch.l}
                  <button onClick={() => clearChip(ch.k)} style={{
                    width: 18, height: 18, borderRadius: 999, border: 'none',
                    background: 'rgba(255,255,255,.15)', color: '#fff',
                    display: 'grid', placeItems: 'center', cursor: 'pointer',
                  }}><IconClose size={9} sw={2.5} stroke="#fff"/></button>
                </span>
              ))}
              <button onClick={clearAll} style={{
                padding: '5px 12px', borderRadius: 999, border: '1px solid var(--at-border)',
                background: 'transparent', fontSize: 11.5, color: 'var(--at-ink-2)', cursor: 'pointer', fontFamily: 'inherit',
              }}>Limpiar todo</button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile: search + sort bar */}
      <div className="md:hidden">
        <div style={{ padding: '10px 14px 4px', background: 'var(--at-bg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--at-surface)', padding: '11px 14px', borderRadius: 999, border: '1px solid var(--at-border)' }}>
            <IconSearch size={16} sw={1.8} stroke="var(--at-ink-3)" />
            <input value={q} onChange={e => setQ(e.target.value)}
              placeholder="Marca, modelo, año…"
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13.5, color: 'var(--at-ink)', fontFamily: 'inherit' }} />
            {q && (
              <button onClick={() => setQ('')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center', padding: 0 }}>
                <IconClose size={14} stroke="var(--at-ink-3)" />
              </button>
            )}
          </div>
        </div>
        <div style={{ padding: '4px 14px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11.5, color: 'var(--at-ink-3)', fontFamily: 'var(--at-mono)' }}>{filtered.length} resultados</span>
          <select value={sort} onChange={e => setSort(e.target.value)}
            style={{ border: 'none', background: 'transparent', fontSize: 12.5, color: 'var(--at-ink)', fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>
            <option value="featured">Destacados</option>
            <option value="new">Más nuevos</option>
            <option value="price-asc">Menor precio</option>
            <option value="price-desc">Mayor precio</option>
            <option value="km">Menor km</option>
          </select>
        </div>
        {/* Mobile active chips */}
        {activeChips.length > 0 && (
          <div className="hide-scroll" style={{ display: 'flex', gap: 6, padding: '0 14px 6px', overflowX: 'auto' }}>
            {activeChips.map(ch => (
              <span key={ch.k} style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '5px 6px 5px 10px', borderRadius: 999,
                background: 'var(--at-ink)', color: '#fff',
                fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap',
              }}>
                {ch.l}
                <button onClick={() => clearChip(ch.k)} style={{
                  width: 16, height: 16, borderRadius: 999, border: 'none',
                  background: 'rgba(255,255,255,.18)', color: '#fff',
                  display: 'grid', placeItems: 'center', cursor: 'pointer',
                }}><IconClose size={9} sw={2.5} stroke="#fff"/></button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Main content */}
      <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
        <div className="md:flex md:gap-8 md:items-start md:px-8 md:pt-6">
          {/* Sidebar — desktop only */}
          <div className="hidden md:block" style={{ flexShrink: 0 }}>
            <FilterSidebar filters={filters} setFilters={setFilters} options={options} />
          </div>

          {/* Grid */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Desktop: result count (below header) */}
            <div className="hidden md:block md:mb-4">
              <span style={{ fontFamily: 'var(--at-mono)', fontSize: 11, color: 'var(--at-ink-3)' }}>
                {filtered.length} {filtered.length === 1 ? 'auto' : 'autos'} encontrados
              </span>
            </div>

            <div data-testid="catalog-grid"
              className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
              style={{ padding: '12px 14px 32px' }}>
              {loading || loadingCars ? (
                [1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)
              ) : filtered.length === 0 ? (
                <div style={{ gridColumn: '1 / -1' }}>
                  <EmptyState
                    title="Sin resultados"
                    desc="Probá ajustar los filtros o buscar con otro término."
                    cta={{ label: 'Limpiar filtros', onClick: clearAll }}
                  />
                </div>
              ) : (
                filtered.map(c => (
                  <CarCard key={c.id} car={c}
                    onOpen={() => navigate(`/auto/${c.id}`)}
                    onFav={onFav} isFav={favs.includes(c.id)} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {drawerOpen && (
        <FilterDrawer onClose={() => setDrawerOpen(false)} filters={filters} setFilters={setFilters} options={options} />
      )}
    </div>
  );
}
