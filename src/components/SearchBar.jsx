import { useEffect, useMemo, useRef, useState } from 'react';
import { IconClose, IconSearch } from './Icons';

const RECENT_KEY = 'autostandil-recent-searches';
const MAX_RECENT = 5;

const readRecent = () => {
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw).filter(Boolean).slice(0, MAX_RECENT) : [];
  } catch { return []; }
};

const writeRecent = (entries) => {
  try { window.localStorage.setItem(RECENT_KEY, JSON.stringify(entries.slice(0, MAX_RECENT))); }
  catch { /* ignore */ }
};

const norm = (str) => String(str || '').toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '');

/**
 * Builds a flat list of unique suggestion tokens from the inventory.
 * Each suggestion includes a `kind` so we can render differentiated chips.
 */
function buildSuggestionPool(cars) {
  const brands = new Map();
  const models = new Map();
  const types = new Set();

  for (const car of cars || []) {
    if (car.brand) {
      const key = norm(car.brand);
      brands.set(key, { kind: 'brand', label: car.brand, value: car.brand });
    }
    if (car.brand && car.model) {
      const key = norm(`${car.brand} ${car.model}`);
      models.set(key, { kind: 'model', label: `${car.brand} ${car.model}`, value: `${car.brand} ${car.model}` });
    }
    if (car.type) types.add(car.type);
  }

  return [
    ...models.values(),
    ...brands.values(),
    ...[...types].map(type => ({ kind: 'type', label: type, value: type })),
  ];
}

const styles = {
  root: { position: 'relative', width: '100%' },
  shellLight: {
    display: 'flex', alignItems: 'center', gap: 10,
    background: '#fff', color: 'var(--at-ink)',
    border: '1px solid transparent', borderRadius: 999,
    padding: '12px 14px',
    boxShadow: '0 12px 30px -10px rgba(0,0,0,.35)',
    transition: 'border-color .15s ease, box-shadow .15s ease',
  },
  shellSurface: {
    display: 'flex', alignItems: 'center', gap: 10,
    background: 'var(--at-surface)', color: 'var(--at-ink)',
    border: '1px solid var(--at-border)', borderRadius: 999,
    padding: '12px 14px',
    boxShadow: '0 10px 24px rgba(15,23,42,.06)',
    transition: 'border-color .15s ease, box-shadow .15s ease',
  },
  input: {
    flex: 1, border: 'none', outline: 'none', background: 'transparent',
    fontSize: 14, color: 'var(--at-ink)', fontFamily: 'inherit', minWidth: 0,
  },
  iconBtn: {
    background: 'transparent', border: 'none', cursor: 'pointer',
    display: 'grid', placeItems: 'center', padding: 4, borderRadius: 999,
    color: 'var(--at-ink-2)',
  },
  submit: {
    padding: '6px 14px', borderRadius: 999,
    background: 'var(--at-accent)', color: '#fff',
    fontSize: 12, fontWeight: 800, border: 'none', cursor: 'pointer',
    fontFamily: 'inherit', flexShrink: 0,
  },
  panel: {
    position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, zIndex: 30,
    background: 'var(--at-surface)', color: 'var(--at-ink)',
    border: '1px solid var(--at-border)', borderRadius: 16,
    boxShadow: '0 20px 60px rgba(15,23,42,.18)',
    padding: 12, maxHeight: 360, overflowY: 'auto',
  },
  sectionLabel: {
    fontSize: 10, color: 'var(--at-ink-3)',
    fontFamily: 'var(--at-mono)', letterSpacing: '.12em', textTransform: 'uppercase',
    fontWeight: 700, padding: '6px 8px 4px',
  },
  row: (active) => ({
    display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px',
    borderRadius: 10, cursor: 'pointer', fontSize: 13.5,
    background: active ? 'var(--at-bg-2)' : 'transparent',
    border: 'none', width: '100%', textAlign: 'left',
    fontFamily: 'inherit', color: 'var(--at-ink)',
  }),
  kindChip: (kind) => {
    const palette = {
      brand: { bg: 'var(--at-accent-soft)', fg: 'var(--at-accent)' },
      model: { bg: 'rgba(15,23,42,.08)', fg: 'var(--at-ink)' },
      type:  { bg: '#fef3c7', fg: '#92400e' },
      recent:{ bg: 'var(--at-bg-2)', fg: 'var(--at-ink-2)' },
    }[kind] || { bg: 'var(--at-bg-2)', fg: 'var(--at-ink-2)' };
    return {
      fontSize: 9.5, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase',
      padding: '3px 7px', borderRadius: 999,
      background: palette.bg, color: palette.fg, flexShrink: 0,
      fontFamily: 'var(--at-mono)',
    };
  },
};

const kindLabel = { brand: 'Marca', model: 'Modelo', type: 'Tipo', recent: 'Reciente' };

/**
 * Unified SearchBar used in the Hero and the Catalogo screen.
 *
 * Props:
 *  - value, onChange, onSubmit: standard controlled input behaviour
 *  - cars: array used to build live suggestions (brand / model / type)
 *  - variant: 'light' (hero, on dark backgrounds) | 'surface' (catalog rows)
 *  - showSubmit: whether to render the inline "Buscar" submit button
 *  - placeholder: custom placeholder text
 *  - storeRecent: when true, submitting persists the query to localStorage
 */
export function SearchBar({
  value, onChange, onSubmit, cars = [],
  variant = 'surface', showSubmit = false,
  placeholder = 'Buscar marca, modelo o año',
  storeRecent = true,
  autoFocus = false,
}) {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(-1);
  const [recents, setRecents] = useState(() => readRecent());
  const inputRef = useRef(null);
  const wrapRef = useRef(null);

  const pool = useMemo(() => buildSuggestionPool(cars), [cars]);

  const suggestions = useMemo(() => {
    const q = norm(value).trim();
    if (!q) return [];
    return pool.filter(item => norm(item.label).includes(q)).slice(0, 6);
  }, [pool, value]);

  const showRecents = open && !value && recents.length > 0;
  const showSuggestions = open && value && suggestions.length > 0;
  const rows = showRecents
    ? recents.map(r => ({ kind: 'recent', label: r, value: r }))
    : suggestions;

  // Reset hover when query changes (handled inside onChange below).

  useEffect(() => {
    if (!open) return;
    const onDocClick = (event) => {
      if (!wrapRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const persistRecent = (text) => {
    if (!storeRecent || !text) return;
    const next = [text, ...recents.filter(r => norm(r) !== norm(text))].slice(0, MAX_RECENT);
    setRecents(next);
    writeRecent(next);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const final = value.trim();
    persistRecent(final);
    setOpen(false);
    onSubmit?.(final);
  };

  const pickSuggestion = (item) => {
    onChange?.(item.value);
    persistRecent(item.value);
    setOpen(false);
    onSubmit?.(item.value);
  };

  const handleKey = (event) => {
    if (!rows.length) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHover(prev => (prev + 1) % rows.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHover(prev => (prev <= 0 ? rows.length - 1 : prev - 1));
    } else if (event.key === 'Enter' && hover >= 0) {
      event.preventDefault();
      pickSuggestion(rows[hover]);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  };

  const clearRecents = () => {
    setRecents([]);
    writeRecent([]);
  };

  const shellStyle = variant === 'light' ? styles.shellLight : styles.shellSurface;

  return (
    <form ref={wrapRef} style={styles.root} onSubmit={handleSubmit} role="search">
      <div style={shellStyle}>
        <IconSearch size={16} sw={1.8} stroke="var(--at-ink-2)" />
        <input
          ref={inputRef}
          value={value}
          onChange={(event) => { onChange?.(event.target.value); setOpen(true); setHover(-1); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKey}
          placeholder={placeholder}
          aria-label="Buscar autos"
          autoComplete="off"
          style={styles.input}
        />
        {value && (
          <button
            type="button"
            onClick={() => { onChange?.(''); inputRef.current?.focus(); }}
            aria-label="Limpiar búsqueda"
            style={styles.iconBtn}
          >
            <IconClose size={14} stroke="currentColor" />
          </button>
        )}
        {showSubmit && (
          <button type="submit" style={styles.submit}>Buscar</button>
        )}
      </div>

      {(showRecents || showSuggestions) && (
        <div style={styles.panel} role="listbox">
          {showRecents && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={styles.sectionLabel}>Búsquedas recientes</span>
              <button
                type="button" onClick={clearRecents}
                style={{ ...styles.iconBtn, fontSize: 11, padding: '4px 8px', color: 'var(--at-ink-3)' }}
              >
                Limpiar
              </button>
            </div>
          )}
          {showSuggestions && (
            <div style={styles.sectionLabel}>Sugerencias</div>
          )}
          <div style={{ display: 'grid', gap: 2 }}>
            {rows.map((row, idx) => (
              <button
                key={`${row.kind}-${row.value}`}
                type="button"
                role="option"
                aria-selected={hover === idx}
                onMouseEnter={() => setHover(idx)}
                onClick={() => pickSuggestion(row)}
                style={styles.row(hover === idx)}
              >
                <span style={styles.kindChip(row.kind)}>{kindLabel[row.kind]}</span>
                <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {row.label}
                </span>
                <span style={{ color: 'var(--at-ink-3)', fontSize: 11, fontFamily: 'var(--at-mono)' }}>↵</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </form>
  );
}
