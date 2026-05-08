import { useState, useEffect } from 'react';
import { fmtPrice } from '../lib/utils';
import { IconClose, IconCalc, IconWhatsapp } from './Icons';
import { trackWhatsappClick } from '../services/analyticsService';

const WA_NUMBER = '5492494621182';
const FEATURED_PLAZOS = [12, 18, 24, 36];

/* ─── Debounce hook ─── */
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/* ─── API ─── */
async function fetchCreditCar(monto, modelo) {
  const url = `https://api.cotizadorcreditcar.com.ar/2?monto=${Math.round(monto)}&modelo=${modelo}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('API error');
  return res.json();
}

/* ─── Plan card ─── */
function PlanCard({ plan, selected, onSelect }) {
  const cuota = Math.round(+plan.cuota);
  return (
    <button
      onClick={() => onSelect(plan.plazo)}
      style={{
        padding: '14px 12px', borderRadius: 14,
        border: `2px solid ${selected ? 'var(--at-accent)' : 'var(--at-border)'}`,
        background: selected ? 'var(--at-accent-soft)' : 'var(--at-surface)',
        cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
        transition: 'border-color .15s ease, background .15s ease',
        width: '100%',
      }}
    >
      <div style={{
        fontSize: 10.5, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
        color: selected ? 'var(--at-accent)' : 'var(--at-ink-3)',
        fontFamily: 'var(--at-mono)', marginBottom: 6,
      }}>
        {plan.plazo} cuotas
      </div>
      <div style={{
        fontFamily: 'var(--at-display)', fontSize: 21, fontWeight: 600,
        letterSpacing: '-.025em', color: 'var(--at-ink)', lineHeight: 1.1,
      }}>
        {fmtPrice(cuota)}
      </div>
      <div style={{ fontSize: 10.5, color: 'var(--at-ink-3)', marginTop: 3 }}>por mes</div>
    </button>
  );
}

/* ─── Skeleton plan card ─── */
function SkelCard() {
  return (
    <div style={{ padding: '14px 12px', borderRadius: 14, border: '2px solid var(--at-border)', background: 'var(--at-surface)' }}>
      <div className="skel" style={{ height: 11, borderRadius: 6, width: '55%', marginBottom: 10 }} />
      <div className="skel" style={{ height: 22, borderRadius: 6, width: '75%', marginBottom: 6 }} />
      <div className="skel" style={{ height: 10, borderRadius: 4, width: '35%' }} />
    </div>
  );
}

/* ─── Main component ─── */
export function FinanceCalc({ car, onClose }) {
  const [pct, setPct] = useState(30);
  const [plans, setPlans] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [selectedPlazo, setSelectedPlazo] = useState(24);

  const downPayment = Math.round((car.price || 0) * pct / 100);
  const loan = (car.price || 0) - downPayment;
  const debouncedLoan = useDebounce(loan, 600);

  /* Fetch plans whenever loan or year changes */
  useEffect(() => {
    if (!debouncedLoan || !car.year) return;
    let cancelled = false;
    setLoading(true);
    setError(false);
    fetchCreditCar(debouncedLoan, car.year)
      .then(data => {
        if (cancelled) return;
        setPlans(data);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError(true);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [debouncedLoan, car.year]);

  const featuredPlans = plans?.filter(p => FEATURED_PLAZOS.includes(p.plazo)) || [];
  const selectedPlan = plans?.find(p => p.plazo === selectedPlazo);

  /* Build WhatsApp URL */
  const waHref = (() => {
    if (!selectedPlan) {
      const msg = `Hola! Me interesa el ${car.brand} ${car.model} y quiero consultar sobre financiación.`;
      return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
    }
    const cuota = fmtPrice(Math.round(+selectedPlan.cuota));
    const msg = `Hola! Me interesa el ${car.brand} ${car.model} ${car.version || ''}. Quiero financiar con anticipo de ${fmtPrice(downPayment)} y ${selectedPlazo} cuotas de ${cuota} por mes. ¿Me pueden confirmar disponibilidad?`;
    return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
  })();

  /* Handle click outside (on backdrop) */
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 80,
          background: 'rgba(10,15,30,.65)',
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          animation: 'fadeInBg .2s ease both',
        }}
      />

      {/* ── Positioner: bottom on mobile, center on desktop ── */}
      <div
        className="fixed inset-0 z-[81] flex items-end justify-center md:items-center"
        style={{ pointerEvents: 'none' }}
        onClick={handleBackdropClick}
      >
        {/* ── Outer wrapper: clips rounded corners ── */}
        <div
          className="rounded-t-[24px] md:rounded-[20px]"
          style={{
            width: '100%', maxWidth: 520,
            background: 'var(--at-bg)',
            overflow: 'hidden',
            pointerEvents: 'auto',
            boxShadow: '0 -4px 40px rgba(0,0,0,.18), 0 0 0 1px rgba(0,0,0,.06)',
            animation: 'sheetUp .32s cubic-bezier(.25,.8,.25,1) both',
          }}
        >
          {/* ── Inner scroll area ── */}
          <div className="hide-scroll" style={{ maxHeight: '90dvh', overflowY: 'auto' }}>

            {/* ── Header (dark) ── */}
            <div style={{
              background: 'var(--at-ink)', color: '#fff',
              padding: '16px 20px 20px', position: 'relative',
            }}>
              {/* Drag handle — mobile only */}
              <div className="md:hidden" style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
                <span style={{ width: 38, height: 4, borderRadius: 2, background: 'rgba(255,255,255,.2)', display: 'block' }} />
              </div>

              {/* Close button */}
              <button
                onClick={onClose}
                aria-label="Cerrar"
                style={{
                  position: 'absolute', top: 16, right: 16,
                  width: 30, height: 30, borderRadius: 999,
                  background: 'rgba(255,255,255,.1)', border: 'none',
                  display: 'grid', placeItems: 'center', cursor: 'pointer',
                  color: '#fff',
                }}
              >
                <IconClose size={13} stroke="#fff" sw={2.2} />
              </button>

              {/* Title row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 18 }}>
                <span style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: 'rgba(0,68,255,.4)',
                  display: 'grid', placeItems: 'center', flexShrink: 0,
                  border: '1px solid rgba(0,68,255,.5)',
                }}>
                  <IconCalc size={17} stroke="#8fb3ff" sw={1.7} />
                </span>
                <div>
                  <div style={{
                    fontSize: 10, fontWeight: 600, letterSpacing: '.12em',
                    textTransform: 'uppercase', opacity: .55, fontFamily: 'var(--at-mono)',
                  }}>
                    Calculadora CreditCar
                  </div>
                  <div style={{
                    fontFamily: 'var(--at-display)', fontSize: 17, fontWeight: 500,
                    letterSpacing: '-.02em', marginTop: 1,
                  }}>
                    {car.brand} {car.model}
                  </div>
                </div>
              </div>

              {/* Price summary */}
              <div style={{ display: 'flex', gap: 0, borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ flex: 1, background: 'rgba(255,255,255,.07)', padding: '12px 14px' }}>
                  <div style={{ fontSize: 9.5, opacity: .55, fontFamily: 'var(--at-mono)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 3 }}>
                    Precio
                  </div>
                  <div style={{ fontFamily: 'var(--at-display)', fontSize: 20, fontWeight: 600, letterSpacing: '-.025em' }}>
                    {fmtPrice(car.price)}
                  </div>
                </div>
                <div style={{ width: 1, background: 'rgba(255,255,255,.08)' }} />
                <div style={{ flex: 1, background: 'rgba(255,255,255,.07)', padding: '12px 14px' }}>
                  <div style={{ fontSize: 9.5, opacity: .55, fontFamily: 'var(--at-mono)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 3 }}>
                    A financiar
                  </div>
                  <div style={{
                    fontFamily: 'var(--at-display)', fontSize: 20, fontWeight: 600,
                    letterSpacing: '-.025em', color: '#8fb3ff',
                  }}>
                    {fmtPrice(loan)}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Body ── */}
            <div style={{ padding: '22px 20px 28px' }}>

              {/* Anticipo slider */}
              <div style={{ marginBottom: 26 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--at-ink)', letterSpacing: '-.01em' }}>
                      Anticipo
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--at-ink-3)', marginTop: 2, fontFamily: 'var(--at-mono)' }}>
                      {fmtPrice(downPayment)}
                    </div>
                  </div>
                  <div style={{
                    fontFamily: 'var(--at-display)', fontSize: 34, fontWeight: 700,
                    letterSpacing: '-.04em', color: 'var(--at-accent)', lineHeight: 1,
                  }}>
                    {pct}%
                  </div>
                </div>
                <input
                  type="range" min="20" max="70" step="5" value={pct}
                  onChange={e => setPct(+e.target.value)}
                  style={{ width: '100%' }}
                />
                <div style={{
                  display: 'flex', justifyContent: 'space-between', marginTop: 5,
                  fontSize: 10.5, color: 'var(--at-ink-3)', fontFamily: 'var(--at-mono)',
                }}>
                  <span>20%</span><span>70%</span>
                </div>
              </div>

              {/* Plan chooser */}
              <div style={{ marginBottom: 20 }}>
                <div style={{
                  fontSize: 12.5, fontWeight: 700, color: 'var(--at-ink)',
                  letterSpacing: '-.01em', marginBottom: 12,
                }}>
                  Elegí tu plan{loading && (
                    <span style={{ fontWeight: 400, fontSize: 11.5, color: 'var(--at-ink-3)', marginLeft: 8 }}>
                      Consultando…
                    </span>
                  )}
                </div>

                {/* 2×2 grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {loading ? (
                    FEATURED_PLAZOS.map(p => <SkelCard key={p} />)
                  ) : error ? (
                    <div style={{
                      gridColumn: '1 / -1', padding: '18px 16px', borderRadius: 14,
                      background: 'var(--at-bg-2)', border: '1px solid var(--at-border)',
                      textAlign: 'center', fontSize: 13, color: 'var(--at-ink-3)', lineHeight: 1.5,
                    }}>
                      No se pudo obtener los planes en este momento.<br />
                      Consultanos directamente por WhatsApp.
                    </div>
                  ) : (
                    featuredPlans.map(plan => (
                      <PlanCard
                        key={plan.plazo}
                        plan={plan}
                        selected={selectedPlazo === plan.plazo}
                        onSelect={setSelectedPlazo}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* All plans accordion */}
              {!loading && !error && plans && plans.length > 0 && (
                <div style={{ marginBottom: 22 }}>
                  <button
                    onClick={() => setShowAll(v => !v)}
                    style={{
                      width: '100%', padding: '10px 14px',
                      borderRadius: 10, border: '1px solid var(--at-border)',
                      background: showAll ? 'var(--at-bg-2)' : 'var(--at-surface)',
                      cursor: 'pointer', fontSize: 12.5, fontWeight: 600,
                      color: 'var(--at-ink-2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      fontFamily: 'inherit', transition: 'background .15s',
                    }}
                  >
                    <span>{showAll ? 'Ocultar todos los plazos' : 'Ver todos los plazos disponibles'}</span>
                    <span style={{ fontSize: 14, transition: 'transform .2s', transform: showAll ? 'rotate(180deg)' : 'rotate(0deg)', display: 'block' }}>
                      ▾
                    </span>
                  </button>

                  {showAll && (
                    <div style={{
                      marginTop: 8, borderRadius: 12,
                      border: '1px solid var(--at-border)', overflow: 'hidden',
                    }}>
                      {plans.map((plan, i) => {
                        const isSel = selectedPlazo === plan.plazo;
                        return (
                          <div
                            key={plan.plazo}
                            onClick={() => setSelectedPlazo(plan.plazo)}
                            style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              padding: '11px 14px',
                              borderBottom: i < plans.length - 1 ? '1px solid var(--at-border)' : 'none',
                              background: isSel ? 'var(--at-accent-soft)' : 'var(--at-surface)',
                              cursor: 'pointer',
                              transition: 'background .12s',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              {isSel && (
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--at-accent)', display: 'block', flexShrink: 0 }} />
                              )}
                              <span style={{
                                fontSize: 13, fontWeight: isSel ? 600 : 400,
                                color: isSel ? 'var(--at-accent)' : 'var(--at-ink)',
                              }}>
                                {plan.plazo} cuotas
                              </span>
                            </div>
                            <div style={{
                              fontFamily: 'var(--at-display)', fontSize: 15, fontWeight: 600,
                              letterSpacing: '-.02em',
                              color: isSel ? 'var(--at-accent)' : 'var(--at-ink)',
                            }}>
                              {fmtPrice(Math.round(+plan.cuota))}
                              <span style={{ fontSize: 10.5, fontWeight: 400, color: 'var(--at-ink-3)', fontFamily: 'inherit' }}> /mes</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* WhatsApp CTA */}
              <a
                href={waHref}
                onClick={() => trackWhatsappClick(car, 'finance_calc')}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  width: '100%', padding: '16px 20px', borderRadius: 14,
                  background: '#25D366', color: '#fff',
                  textDecoration: 'none', fontWeight: 700, fontSize: 15,
                  letterSpacing: '-.01em',
                  boxShadow: '0 10px 28px -6px rgba(37,211,102,.5)',
                  marginBottom: 12,
                  transition: 'box-shadow .15s',
                }}
              >
                <IconWhatsapp size={20} fill="#fff" />
                {selectedPlan
                  ? `Consultar plan de ${selectedPlazo} cuotas`
                  : 'Consultar financiación'
                }
              </a>

              {/* Disclaimer */}
              <p style={{
                margin: 0, fontSize: 10.5, color: 'var(--at-ink-3)',
                lineHeight: 1.55, textAlign: 'center', padding: '0 8px',
              }}>
                Valores orientativos provistos por CreditCar. La aprobación y las condiciones finales dependen de cada entidad financiera.
              </p>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
