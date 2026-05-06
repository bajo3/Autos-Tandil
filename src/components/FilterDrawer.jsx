import { useState } from 'react';
import { BRANDS, TYPES, FUELS, TRANSMISSIONS } from '../data/cars';

function FilterGroup({ label, children }) {
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{
        fontFamily: 'var(--at-mono)', fontSize: 10, letterSpacing: '.16em',
        textTransform: 'uppercase', color: 'var(--at-ink-3)', marginBottom: 8,
      }}>{label}</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{children}</div>
    </div>
  );
}

function Pill({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      padding: '8px 13px', borderRadius: 999,
      background: active ? 'var(--at-ink)' : 'var(--at-surface)',
      color: active ? '#fff' : 'var(--at-ink)',
      border: '1px solid ' + (active ? 'var(--at-ink)' : 'var(--at-border)'),
      fontSize: 12, fontWeight: 500, cursor: 'pointer',
      fontFamily: 'inherit',
    }}>{children}</button>
  );
}

export function FilterDrawer({ onClose, filters, setFilters, options }) {
  const [local, setLocal] = useState(filters);
  const brands = options?.brands?.length ? options.brands : BRANDS;
  const types = options?.types?.length ? options.types : TYPES;
  const fuels = options?.fuels?.length ? options.fuels : FUELS;
  const transmissions = options?.transmissions?.length ? options.transmissions : TRANSMISSIONS;
  const set = (k, v) => setLocal(f => ({ ...f, [k]: f[k] === v ? null : v }));
  const apply = () => { setFilters(local); onClose(); };
  const reset = () => setLocal({});

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 80,
      display: 'flex', flexDirection: 'column',
    }}>
      <div onClick={onClose} style={{ flex: 1, background: 'rgba(15,23,42,.45)' }} />
      <div style={{
        background: 'var(--at-bg)',
        borderRadius: '20px 20px 0 0',
        maxHeight: '82%',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 -10px 40px rgba(0,0,0,.18)',
      }}>
        <div style={{ display: 'grid', placeItems: 'center', padding: '8px 0 4px' }}>
          <span style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--at-border-strong)' }} />
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '6px 18px 12px',
        }}>
          <h3 style={{ margin: 0, fontFamily: 'var(--at-display)', fontSize: 18, fontWeight: 600, letterSpacing: '-.02em' }}>Filtros</h3>
          <button onClick={reset} style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            fontSize: 12, color: 'var(--at-ink-2)', fontWeight: 500,
          }}>Limpiar</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 18px 18px' }}>
          <FilterGroup label="Tipo de vehículo">
            {types.map(t => (
              <Pill key={t} active={local.type === t} onClick={() => set('type', t)}>{t}</Pill>
            ))}
          </FilterGroup>
          <FilterGroup label="Marca">
            {brands.map(b => (
              <Pill key={b} active={local.brand === b} onClick={() => set('brand', b)}>{b}</Pill>
            ))}
          </FilterGroup>
          <FilterGroup label="Combustible">
            {fuels.map(f => (
              <Pill key={f} active={local.fuel === f} onClick={() => set('fuel', f)}>{f}</Pill>
            ))}
          </FilterGroup>
          <FilterGroup label="Transmisión">
            {transmissions.map(t => (
              <Pill key={t} active={local.trans === t} onClick={() => set('trans', t)}>{t}</Pill>
            ))}
          </FilterGroup>
          <FilterGroup label="Precio máximo">
            {[15, 20, 25, 30, 40, 50].map(p => (
              <Pill key={p} active={local.maxPrice === p * 1e6}
                onClick={() => set('maxPrice', p * 1e6)}>${p}M</Pill>
            ))}
          </FilterGroup>
          <FilterGroup label="Año desde">
            {[2018, 2020, 2021, 2022, 2023].map(y => (
              <Pill key={y} active={local.minYear === y} onClick={() => set('minYear', y)}>{y}</Pill>
            ))}
          </FilterGroup>
          <FilterGroup label="Otros">
            <Pill active={local.badge === 'financia'} onClick={() => set('badge', 'financia')}>Financiación</Pill>
            <Pill active={local.badge === 'permuta'} onClick={() => set('badge', 'permuta')}>Permuta</Pill>
            <Pill active={local.badge === 'destacado'} onClick={() => set('badge', 'destacado')}>Destacados</Pill>
            <Pill active={local.badge === 'nuevo'} onClick={() => set('badge', 'nuevo')}>Nuevo ingreso</Pill>
          </FilterGroup>
        </div>

        <div style={{
          padding: '12px 18px calc(env(safe-area-inset-bottom, 0px) + 14px)',
          background: 'var(--at-bg)', borderTop: '1px solid var(--at-border)',
        }}>
          <button onClick={apply} style={{
            width: '100%', padding: '14px',
            background: 'var(--at-ink)', color: '#fff', border: 'none',
            borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer',
            fontFamily: 'inherit',
          }}>
            Aplicar filtros
          </button>
        </div>
      </div>
    </div>
  );
}
