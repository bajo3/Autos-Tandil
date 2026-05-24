import { BRANDS, TYPES, FUELS, TRANSMISSIONS } from '../data/cars';

function FilterGroup({ label, children }) {
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{
        fontFamily: 'var(--at-mono)', fontSize: 9.5, letterSpacing: '.16em',
        textTransform: 'uppercase', color: 'var(--at-ink-3)', marginBottom: 7,
      }}>{label}</div>
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>{children}</div>
    </div>
  );
}

function Pill({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      padding: '6px 10px', borderRadius: 999,
      background: active ? 'var(--at-ink)' : 'var(--at-surface)',
      color: active ? '#fff' : 'var(--at-ink)',
      border: '1px solid ' + (active ? 'var(--at-ink)' : 'var(--at-border)'),
      fontSize: 11.5, fontWeight: 500, cursor: 'pointer',
      fontFamily: 'inherit', transition: 'all .12s',
    }}>{children}</button>
  );
}

export function FilterSidebar({ filters, setFilters, options }) {
  const set = (k, v) => setFilters(f => ({ ...f, [k]: f[k] === v ? null : v }));
  const hasFilters = Object.values(filters).some(Boolean);
  const brands = options?.brands?.length ? options.brands : BRANDS;
  const types = options?.types?.length ? options.types : TYPES;
  const fuels = options?.fuels?.length ? options.fuels : FUELS;
  const transmissions = options?.transmissions?.length ? options.transmissions : TRANSMISSIONS;

  return (
    <aside style={{
      width: 220, flexShrink: 0,
      position: 'sticky', top: 80,
      maxHeight: 'calc(100vh - 96px)', overflowY: 'auto',
      background: 'var(--at-surface)',
      borderRadius: 14, border: '1px solid var(--at-border)',
      padding: '14px 14px 18px',
    }} className="hide-scroll">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{
          margin: 0, fontFamily: 'var(--at-display)',
          fontSize: 15, fontWeight: 600, letterSpacing: '-.015em',
        }}>Filtros</h3>
        {hasFilters && (
          <button onClick={() => setFilters({})} style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            fontSize: 11, color: 'var(--at-accent)', fontWeight: 600,
            fontFamily: 'inherit',
          }}>Limpiar</button>
        )}
      </div>

      <FilterGroup label="Tipo">
        {types.map(t => <Pill key={t} active={filters.type === t} onClick={() => set('type', t)}>{t}</Pill>)}
      </FilterGroup>
      <FilterGroup label="Marca">
        {brands.map(b => <Pill key={b} active={filters.brand === b} onClick={() => set('brand', b)}>{b}</Pill>)}
      </FilterGroup>
      <FilterGroup label="Combustible">
        {fuels.map(f => <Pill key={f} active={filters.fuel === f} onClick={() => set('fuel', f)}>{f}</Pill>)}
      </FilterGroup>
      <FilterGroup label="Transmisión">
        {transmissions.map(t => <Pill key={t} active={filters.trans === t} onClick={() => set('trans', t)}>{t}</Pill>)}
      </FilterGroup>
      <FilterGroup label="Precio máximo">
        {[15, 20, 25, 30, 40, 50].map(p => (
          <Pill key={p} active={filters.maxPrice === p * 1e6}
            onClick={() => set('maxPrice', p * 1e6)}>${p}M</Pill>
        ))}
      </FilterGroup>
      <FilterGroup label="Año desde">
        {[2018, 2020, 2021, 2022, 2023].map(y => (
          <Pill key={y} active={filters.minYear === y} onClick={() => set('minYear', y)}>{y}</Pill>
        ))}
      </FilterGroup>
      <FilterGroup label="Kilómetros máx.">
        {[30000, 50000, 80000, 100000, 150000].map(km => (
          <Pill key={km} active={filters.maxKm === km}
            onClick={() => set('maxKm', km)}>{km >= 1000 ? `${km / 1000}k` : km}</Pill>
        ))}
      </FilterGroup>
      <FilterGroup label="Otros">
        <Pill active={filters.badge === 'financia'} onClick={() => set('badge', 'financia')}>Financiación</Pill>
        <Pill active={filters.badge === 'permuta'} onClick={() => set('badge', 'permuta')}>Permuta</Pill>
        <Pill active={filters.badge === 'destacado'} onClick={() => set('badge', 'destacado')}>Destacados</Pill>
        <Pill active={filters.badge === 'nuevo'} onClick={() => set('badge', 'nuevo')}>Nuevo ingreso</Pill>
      </FilterGroup>
    </aside>
  );
}
