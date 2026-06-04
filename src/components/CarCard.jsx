import { Badge } from './Badge';
import { IconHeart, IconGauge, IconFuel, IconGear, IconChevron, IconCalc, IconWhatsapp } from './Icons';
import { estimateMonthlyPayment, fmtPrice, fmtKm, buildWhatsapp } from '../lib/utils';
import { ProgressiveImage } from './ProgressiveImage';

const specStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 3,
  fontSize: 11,
  color: 'var(--at-ink-2)',
  fontWeight: 600,
  whiteSpace: 'nowrap',
};

const transLabel = (value) => {
  const text = String(value || '').toLowerCase();
  return text.startsWith('auto') ? 'Aut.' : 'Man.';
};

export function CarCard({ car, onOpen, onFav, isFav, radius = 14 }) {
  const badges = car.badges || [];
  const extraBadges = Math.max(0, badges.length - 2);
  const estimatedMonthly = estimateMonthlyPayment(car.price);

  return (
    <article
      data-testid="car-card"
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpen?.();
        }
      }}
      style={{
        background: 'var(--at-surface)',
        borderRadius: radius,
        overflow: 'hidden',
        border: '1px solid var(--at-border)',
        boxShadow: '0 1px 2px rgba(15,23,42,.04)',
        cursor: 'pointer',
        transition: 'transform .18s ease, box-shadow .18s ease, border-color .18s ease',
        outline: 'none',
      }}
      onMouseEnter={event => {
        event.currentTarget.style.transform = 'translateY(-3px)';
        event.currentTarget.style.boxShadow = '0 18px 36px rgba(15,23,42,.10)';
        event.currentTarget.style.borderColor = 'var(--at-border-strong)';
      }}
      onMouseLeave={event => {
        event.currentTarget.style.transform = 'none';
        event.currentTarget.style.boxShadow = '0 1px 2px rgba(15,23,42,.04)';
        event.currentTarget.style.borderColor = 'var(--at-border)';
      }}
    >
      <div className="at-card-media" style={{ position: 'relative', overflow: 'hidden', background: 'var(--at-bg-2)' }}>
        <ProgressiveImage
          src={car.thumbUrl}
          alt={`${car.brand} ${car.model}`}
          style={{ width: '100%', height: '100%' }}
          fallback={(
          <div style={{
            width: '100%',
            height: '100%',
            display: 'grid',
            placeItems: 'center',
            padding: 18,
            background: 'linear-gradient(135deg, var(--at-bg-2), var(--at-surface))',
            color: 'var(--at-ink-2)',
            textAlign: 'center',
          }}>
            <div>
              <div style={{ fontFamily: 'var(--at-display)', fontSize: 18, fontWeight: 800, color: 'var(--at-ink)' }}>
                {car.brand} {car.model}
              </div>
              <div style={{ marginTop: 4, fontSize: 12, color: 'var(--at-ink-3)' }}>
                Foto no disponible
              </div>
            </div>
          </div>
          )}
        />
        <div style={{ position: 'absolute', top: 10, left: 10, right: 44, display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {badges.slice(0, 2).map(badge => <Badge key={badge} kind={badge} sm />)}
          {extraBadges > 0 && (
            <span style={{
              borderRadius: 999,
              padding: '4px 7px',
              background: 'rgba(255,255,255,.92)',
              color: 'var(--at-ink)',
              fontSize: 10,
              fontWeight: 800,
              backdropFilter: 'blur(8px)',
            }}>
              +{extraBadges}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={event => { event.stopPropagation(); onFav?.(car.id); }}
          aria-label={isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 36,
            height: 36,
            borderRadius: 999,
            border: 'none',
            background: 'rgba(255,255,255,.94)',
            backdropFilter: 'blur(6px)',
            display: 'grid',
            placeItems: 'center',
            cursor: 'pointer',
            color: isFav ? '#e11d48' : 'var(--at-ink)',
            boxShadow: '0 8px 20px rgba(15,23,42,.14)',
          }}
        >
          <IconHeart filled={isFav} size={17} sw={1.8} stroke={isFav ? '#e11d48' : 'currentColor'} />
        </button>
        <div style={{
          position: 'absolute',
          bottom: 10,
          left: 10,
          padding: '4px 8px',
          borderRadius: 8,
          background: 'rgba(15,23,42,.78)',
          color: '#fff',
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: '.02em',
          backdropFilter: 'blur(8px)',
        }}>
          {car.year}
        </div>
      </div>

      <div style={{ padding: '13px 14px 14px' }}>
        <div style={{
          fontFamily: 'var(--at-display)',
          fontSize: 17,
          fontWeight: 650,
          letterSpacing: '-.015em',
          color: 'var(--at-ink)',
          lineHeight: 1.2,
        }}>
          {car.brand} {car.model}
        </div>
        <div style={{
          fontSize: 11.5,
          color: 'var(--at-ink-2)',
          marginTop: 2,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {car.version}
        </div>

        <div style={{ marginTop: 11, display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: 10 }}>
          <div>
            <div style={{
              fontSize: 9.5,
              color: 'var(--at-ink-3)',
              textTransform: 'uppercase',
              letterSpacing: '.1em',
              fontFamily: 'var(--at-mono)',
            }}>
              Precio publicado
            </div>
            <div style={{
              marginTop: 2,
              fontSize: 20,
              fontWeight: 800,
              color: 'var(--at-ink)',
              letterSpacing: '-.015em',
              fontFamily: 'var(--at-display)',
            }}>
              {fmtPrice(car.price, car.currency)}
            </div>
          </div>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '5px 8px',
            borderRadius: 999,
            background: 'var(--at-accent-soft)',
            color: 'var(--at-accent)',
            fontSize: 10.5,
            fontWeight: 800,
            whiteSpace: 'nowrap',
          }}>
            <IconCalc size={11} sw={2} />
            Desde {fmtPrice(estimatedMonthly)}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={specStyle}><IconGauge size={11} sw={1.8} />{fmtKm(car.km)}</span>
          <span style={specStyle}><IconFuel size={11} sw={1.8} />{car.fuel}</span>
          <span style={specStyle}><IconGear size={11} sw={1.8} />{transLabel(car.trans)}</span>
        </div>

        <div style={{
          marginTop: 10,
          paddingTop: 10,
          borderTop: '1px solid var(--at-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          fontSize: 11,
          color: 'var(--at-ink-2)',
        }}>
          <a
            href={buildWhatsapp(car)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '6px 10px', borderRadius: 8,
              background: '#25D366', color: '#fff',
              fontSize: 11, fontWeight: 700,
              textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0,
            }}
          >
            <IconWhatsapp size={13} fill="#fff" />Consultar
          </a>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, color: 'var(--at-accent)', fontWeight: 800, whiteSpace: 'nowrap' }}>
            Ver detalle <IconChevron size={12} sw={2.4} />
          </span>
        </div>
      </div>
    </article>
  );
}

export function SkeletonCard({ radius = 14 }) {
  return (
    <div style={{
      background: 'var(--at-surface)',
      borderRadius: radius,
      border: '1px solid var(--at-border)',
      overflow: 'hidden',
    }}>
      <div className="skel at-card-media" />
      <div style={{ padding: 14 }}>
        <div className="skel" style={{ width: '60%', height: 14, borderRadius: 4 }} />
        <div className="skel" style={{ width: '85%', height: 10, borderRadius: 4, marginTop: 6 }} />
        <div className="skel" style={{ width: '40%', height: 18, borderRadius: 4, marginTop: 12 }} />
        <div className="skel" style={{ width: '70%', height: 10, borderRadius: 4, marginTop: 10 }} />
      </div>
    </div>
  );
}
