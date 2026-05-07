import { Badge } from './Badge';
import { IconHeart, IconGauge, IconFuel, IconGear, IconWhatsapp } from './Icons';
import { fmtPrice, fmtKm, buildWhatsapp } from '../lib/utils';

const specStyle = {
  display: 'inline-flex', alignItems: 'center', gap: 3,
  fontSize: 11, color: 'var(--at-ink-2)', fontWeight: 500,
  whiteSpace: 'nowrap',
};

export function CarCard({ car, onOpen, onFav, isFav, radius = 14 }) {
  return (
    <article
      data-testid="car-card"
      onClick={onOpen}
      style={{
        background: 'var(--at-surface)',
        borderRadius: radius,
        overflow: 'hidden',
        border: '1px solid var(--at-border)',
        boxShadow: '0 1px 3px rgba(15,23,42,.05)',
        cursor: 'pointer',
        transition: 'transform .18s ease, box-shadow .18s ease, border-color .18s ease',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = '0 12px 30px -8px rgba(15,23,42,.14)';
        e.currentTarget.style.borderColor = 'var(--at-border-strong)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(15,23,42,.05)';
        e.currentTarget.style.borderColor = 'var(--at-border)';
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', background: 'var(--at-bg-2)', flexShrink: 0 }}>
        <img src={car.thumbUrl} alt={car.brand + ' ' + car.model} loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform .3s ease' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        />
        {/* Badges */}
        <div style={{ position: 'absolute', top: 10, left: 10, right: 44, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {car.badges.slice(0, 2).map(b => <Badge key={b} kind={b} sm />)}
        </div>
        {/* Fav button */}
        <button
          onClick={e => { e.stopPropagation(); onFav?.(car.id); }}
          aria-label="Favorito"
          style={{
            position: 'absolute', top: 8, right: 8, width: 34, height: 34,
            borderRadius: 999, border: 'none',
            background: 'rgba(255,255,255,.92)',
            backdropFilter: 'blur(8px)',
            display: 'grid', placeItems: 'center', cursor: 'pointer',
            color: isFav ? '#e11d48' : 'var(--at-ink)',
            transition: 'transform .15s',
            boxShadow: '0 1px 4px rgba(0,0,0,.1)',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <IconHeart filled={isFav} size={17} sw={1.8} stroke={isFav ? '#e11d48' : 'currentColor'} />
        </button>
        {/* Year pill */}
        <div style={{
          position: 'absolute', bottom: 10, left: 10,
          padding: '3px 8px', borderRadius: 6,
          background: 'rgba(15,23,42,.78)', color: '#fff',
          fontSize: 11, fontWeight: 600, letterSpacing: '.03em',
          backdropFilter: 'blur(8px)',
        }}>{car.year}</div>
      </div>

      {/* Body */}
      <div style={{ padding: '12px 14px 0', flex: 1 }}>
        <div style={{
          fontFamily: 'var(--at-display)',
          fontSize: 16, fontWeight: 600,
          letterSpacing: '-.015em',
          color: 'var(--at-ink)', lineHeight: 1.2,
        }}>
          {car.brand} {car.model}
        </div>
        <div style={{
          fontSize: 11.5, color: 'var(--at-ink-2)', marginTop: 2,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{car.version}</div>

        <div style={{
          marginTop: 10, fontSize: 20, fontWeight: 700,
          color: 'var(--at-ink)', letterSpacing: '-.02em',
          fontFamily: 'var(--at-display)',
        }}>{fmtPrice(car.price)}</div>

        <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={specStyle}><IconGauge size={11} sw={1.8} />{fmtKm(car.km)}</span>
          <span style={specStyle}><IconFuel size={11} sw={1.8} />{car.fuel}</span>
          <span style={specStyle}><IconGear size={11} sw={1.8} />{car.trans === 'Automática' ? 'Aut.' : 'Man.'}</span>
        </div>

        <div style={{
          marginTop: 9, paddingTop: 9, borderTop: '1px solid var(--at-border)',
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 11, color: 'var(--at-ink-3)',
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: 999,
            background: '#22c55e', flexShrink: 0,
            boxShadow: '0 0 0 3px rgba(34,197,94,.15)',
          }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Disponible · Gestionado por AutosTandil
          </span>
        </div>
      </div>

      {/* CTAs */}
      <div style={{ padding: '10px 14px 14px', display: 'flex', gap: 6 }}>
        <button
          onClick={e => { e.stopPropagation(); onOpen?.(); }}
          style={{
            flex: 1, padding: '9px 10px', borderRadius: 9,
            background: 'var(--at-bg-2)', border: '1px solid var(--at-border)',
            fontSize: 12, fontWeight: 600, color: 'var(--at-ink)',
            cursor: 'pointer', fontFamily: 'inherit',
            transition: 'background .15s',
          }}
        >
          Ver detalle
        </button>
        <a
          href={buildWhatsapp(car)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          style={{
            flex: 1, padding: '9px 10px', borderRadius: 9,
            background: '#25D366', color: '#fff',
            fontSize: 12, fontWeight: 600, textDecoration: 'none',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            boxShadow: '0 3px 10px -4px rgba(37,211,102,.5)',
            transition: 'opacity .15s',
          }}
        >
          <IconWhatsapp size={13} fill="#fff" /> WhatsApp
        </a>
      </div>
    </article>
  );
}

export function SkeletonCard({ radius = 14 }) {
  return (
    <div style={{
      background: 'var(--at-surface)', borderRadius: radius,
      border: '1px solid var(--at-border)', overflow: 'hidden',
    }}>
      <div className="skel" style={{ aspectRatio: '4/3' }} />
      <div style={{ padding: 14 }}>
        <div className="skel" style={{ width: '60%', height: 14, borderRadius: 4 }} />
        <div className="skel" style={{ width: '85%', height: 10, borderRadius: 4, marginTop: 6 }} />
        <div className="skel" style={{ width: '40%', height: 20, borderRadius: 4, marginTop: 12 }} />
        <div className="skel" style={{ width: '70%', height: 10, borderRadius: 4, marginTop: 10 }} />
        <div style={{ display: 'flex', gap: 6, marginTop: 14 }}>
          <div className="skel" style={{ flex: 1, height: 34, borderRadius: 8 }} />
          <div className="skel" style={{ flex: 1, height: 34, borderRadius: 8 }} />
        </div>
      </div>
    </div>
  );
}
