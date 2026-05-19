import { useEffect, useState } from 'react';
import { FINANCE_MIN_DOWN_PCT, FINANCE_TERMS, fmtPrice, WA_NUMBER } from '../lib/utils';
import { IconClose, IconCalc, IconWhatsapp } from './Icons';
import { trackWhatsappClick } from '../services/analyticsService';

const FEATURED_PLAZOS = FINANCE_TERMS;
const QUICK_ADVANCES = [50, 60, 70, 80];

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

async function fetchCreditCar(monto, modelo) {
  const url = `https://api.cotizadorcreditcar.com.ar/2?monto=${Math.round(monto)}&modelo=${modelo}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('API error');
  return response.json();
}

function PlanCard({ plan, selected, onSelect }) {
  const cuota = Math.round(+plan.cuota);

  return (
    <button
      type="button"
      onClick={() => onSelect(Number(plan.plazo))}
      style={{
        padding: '15px 13px',
        borderRadius: 14,
        border: `2px solid ${selected ? 'var(--at-accent)' : 'var(--at-border)'}`,
        background: selected ? 'var(--at-accent-soft)' : 'var(--at-surface)',
        cursor: 'pointer',
        textAlign: 'left',
        fontFamily: 'inherit',
        transition: 'border-color .15s ease, background .15s ease, transform .15s ease',
        width: '100%',
        boxShadow: selected ? '0 12px 26px rgba(0,68,255,.12)' : 'none',
      }}
    >
      <div style={{
        fontSize: 10.5,
        fontWeight: 800,
        letterSpacing: '.1em',
        textTransform: 'uppercase',
        color: selected ? 'var(--at-accent)' : 'var(--at-ink-3)',
        fontFamily: 'var(--at-mono)',
        marginBottom: 7,
      }}>
        {plan.plazo} cuotas fijas
      </div>
      <div style={{
        fontFamily: 'var(--at-display)',
        fontSize: 22,
        fontWeight: 700,
        letterSpacing: '-.025em',
        color: 'var(--at-ink)',
        lineHeight: 1.05,
      }}>
        {fmtPrice(cuota)}
      </div>
      <div style={{ fontSize: 11, color: 'var(--at-ink-3)', marginTop: 4 }}>
        cuota estimada por mes
      </div>
    </button>
  );
}

function SkelCard() {
  return (
    <div style={{
      padding: '15px 13px',
      borderRadius: 14,
      border: '2px solid var(--at-border)',
      background: 'var(--at-surface)',
    }}>
      <div className="skel" style={{ height: 11, borderRadius: 6, width: '55%', marginBottom: 10 }} />
      <div className="skel" style={{ height: 22, borderRadius: 6, width: '75%', marginBottom: 6 }} />
      <div className="skel" style={{ height: 10, borderRadius: 4, width: '45%' }} />
    </div>
  );
}

function StepCard({ number, label }) {
  return (
    <div style={{
      border: '1px solid var(--at-border)',
      borderRadius: 12,
      padding: '10px 8px',
      background: 'var(--at-surface)',
      textAlign: 'center',
    }}>
      <div style={{
        width: 22,
        height: 22,
        borderRadius: 999,
        background: 'var(--at-accent-soft)',
        color: 'var(--at-accent)',
        display: 'grid',
        placeItems: 'center',
        margin: '0 auto 6px',
        fontSize: 11,
        fontWeight: 900,
      }}>
        {number}
      </div>
      <div style={{ fontSize: 11, color: 'var(--at-ink-2)', lineHeight: 1.25, fontWeight: 800 }}>
        {label}
      </div>
    </div>
  );
}

export function FinanceCalc({ car, onClose }) {
  const [pct, setPct] = useState(FINANCE_MIN_DOWN_PCT);
  const [downPaymentInput, setDownPaymentInput] = useState('');
  const [plans, setPlans] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [selectedPlazo, setSelectedPlazo] = useState(36);

  const price = Number(car.price) || 0;
  const minDownPayment = Math.round(price * FINANCE_MIN_DOWN_PCT / 100);
  const typedDownPayment = Number(String(downPaymentInput).replace(/\D/g, '')) || 0;
  const downPayment = downPaymentInput ? Math.max(minDownPayment, Math.min(price, typedDownPayment)) : Math.round(price * pct / 100);
  const effectivePct = price ? Math.round((downPayment / price) * 100) : FINANCE_MIN_DOWN_PCT;
  const typedBelowMin = downPaymentInput && typedDownPayment > 0 && typedDownPayment < minDownPayment;
  const loan = (car.price || 0) - downPayment;
  const debouncedLoan = useDebounce(loan, 600);

  useEffect(() => {
    if (!debouncedLoan || !car.year) return;
    let cancelled = false;

    Promise.resolve()
      .then(() => {
        if (cancelled) return null;
        setLoading(true);
        setError(false);
        return fetchCreditCar(debouncedLoan, car.year);
      })
      .then(data => {
        if (cancelled || !data) return;
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

  const visiblePlans = plans?.filter(plan => FINANCE_TERMS.includes(Number(plan.plazo))) || [];
  const featuredPlans = visiblePlans.filter(plan => FEATURED_PLAZOS.includes(Number(plan.plazo)));
  const selectedPlan = visiblePlans.find(plan => Number(plan.plazo) === selectedPlazo) || visiblePlans[visiblePlans.length - 1];
  const selectedTerm = selectedPlan?.plazo || selectedPlazo;

  const waHref = (() => {
    if (!selectedPlan) {
      const msg = `Hola! Me interesa el ${car.brand} ${car.model} y quiero consultar sobre financiacion.`;
      return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
    }

    const cuota = fmtPrice(Math.round(+selectedPlan.cuota));
    const msg = `Hola! Me interesa el ${car.brand} ${car.model} ${car.version || ''}. Quiero financiar con anticipo de ${fmtPrice(downPayment)} y ${selectedTerm} cuotas de ${cuota} por mes. Me pueden confirmar disponibilidad?`;
    return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
  })();

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) onClose();
  };

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 80,
          background: 'rgba(10,15,30,.65)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          animation: 'fadeInBg .2s ease both',
        }}
      />

      <div
        className="fixed inset-0 z-[81] flex items-end justify-center md:items-center"
        style={{ pointerEvents: 'none' }}
        onClick={handleBackdropClick}
      >
        <div
          className="rounded-t-[24px] md:rounded-[20px]"
          style={{
            width: '100%',
            maxWidth: 560,
            background: 'var(--at-bg)',
            overflow: 'hidden',
            pointerEvents: 'auto',
            boxShadow: '0 -4px 40px rgba(0,0,0,.18), 0 0 0 1px rgba(0,0,0,.06)',
            animation: 'sheetUp .32s cubic-bezier(.25,.8,.25,1) both',
          }}
        >
          <div className="hide-scroll" style={{ maxHeight: '90dvh', overflowY: 'auto' }}>
            <div style={{
              background: 'linear-gradient(135deg, var(--at-ink), #13213d)',
              color: '#fff',
              padding: '16px 20px 20px',
              position: 'relative',
            }}>
              <div className="md:hidden" style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
                <span style={{ width: 38, height: 4, borderRadius: 2, background: 'rgba(255,255,255,.2)', display: 'block' }} />
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  width: 32,
                  height: 32,
                  borderRadius: 999,
                  background: 'rgba(255,255,255,.12)',
                  border: 'none',
                  display: 'grid',
                  placeItems: 'center',
                  cursor: 'pointer',
                  color: '#fff',
                }}
              >
                <IconClose size={13} stroke="#fff" sw={2.2} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, paddingRight: 42 }}>
                <span style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: 'rgba(0,68,255,.42)',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                  border: '1px solid rgba(143,179,255,.35)',
                }}>
                  <IconCalc size={18} stroke="#b9ccff" sw={1.8} />
                </span>
                <div>
                  <div style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '.12em',
                    textTransform: 'uppercase',
                    opacity: .64,
                    fontFamily: 'var(--at-mono)',
                  }}>
                    Simulador de financiacion
                  </div>
                  <div style={{
                    fontFamily: 'var(--at-display)',
                    fontSize: 19,
                    fontWeight: 600,
                    letterSpacing: '-.02em',
                    marginTop: 2,
                    lineHeight: 1.1,
                  }}>
                    Calcula una cuota para el {car.brand} {car.model}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, borderRadius: 14, overflow: 'hidden' }}>
                <div style={{ background: 'rgba(255,255,255,.08)', padding: '13px 14px' }}>
                  <div style={{ fontSize: 9.5, opacity: .58, fontFamily: 'var(--at-mono)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 4 }}>
                    Precio del auto
                  </div>
                  <div style={{ fontFamily: 'var(--at-display)', fontSize: 21, fontWeight: 700, letterSpacing: '-.025em' }}>
                    {fmtPrice(car.price)}
                  </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,.08)', padding: '13px 14px' }}>
                  <div style={{ fontSize: 9.5, opacity: .58, fontFamily: 'var(--at-mono)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 4 }}>
                    A financiar
                  </div>
                  <div style={{ fontFamily: 'var(--at-display)', fontSize: 21, fontWeight: 700, letterSpacing: '-.025em', color: '#b9ccff' }}>
                    {fmtPrice(loan)}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: '22px 20px 28px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 18 }}>
                <StepCard number="1" label="Elegis anticipo" />
                <StepCard number="2" label="Ves cuotas" />
                <StepCard number="3" label="Consultas facil" />
              </div>

              <div style={{ marginBottom: 26 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, gap: 14 }}>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--at-ink)', letterSpacing: '-.01em' }}>
                      1. Cuánto entregás de anticipo
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--at-ink-3)', marginTop: 3 }}>
                      Financiamos hasta el 50% del valor publicado.
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--at-display)', fontSize: 34, fontWeight: 800, letterSpacing: '-.04em', color: 'var(--at-accent)', lineHeight: 1 }}>
                      {effectivePct}%
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--at-ink-3)', marginTop: 2 }}>
                      {fmtPrice(downPayment)}
                    </div>
                  </div>
                </div>

                <input
                  type="range"
                  min="50"
                  max="80"
                  step="5"
                  value={effectivePct}
                  onChange={event => {
                    const nextPct = Number(event.target.value);
                    setPct(nextPct);
                    setDownPaymentInput(String(Math.round(price * nextPct / 100)));
                  }}
                  style={{ width: '100%' }}
                />
                <label style={{
                  display: 'grid',
                  gap: 6,
                  marginTop: 12,
                  fontSize: 10,
                  color: 'var(--at-ink-3)',
                  fontFamily: 'var(--at-mono)',
                  letterSpacing: '.11em',
                  textTransform: 'uppercase',
                }}>
                  Cuánto querés entregar
                  <input
                    inputMode="numeric"
                    aria-label="Cuánto querés entregar"
                    value={downPaymentInput}
                    onChange={event => setDownPaymentInput(event.target.value.replace(/\D/g, ''))}
                    placeholder=""
                    style={{
                      width: '100%',
                      border: `1px solid ${typedBelowMin ? '#f59e0b' : 'var(--at-border)'}`,
                      background: 'var(--at-surface)',
                      color: 'var(--at-ink)',
                      borderRadius: 12,
                      padding: '13px 14px',
                      fontSize: 16,
                      fontWeight: 800,
                      fontFamily: 'var(--at-sans)',
                      letterSpacing: 0,
                      outline: 'none',
                    }}
                  />
                </label>
                <div style={{ marginTop: 7, fontSize: 12, color: 'var(--at-ink-3)' }}>
                  Mínimo permitido para este auto: {fmtPrice(minDownPayment)}.
                </div>
                {typedBelowMin && (
                  <div style={{ marginTop: 7, fontSize: 12, color: '#92400e', lineHeight: 1.45 }}>
                    Para financiar como máximo el 50%, el anticipo mínimo es {fmtPrice(minDownPayment)}.
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 12 }}>
                  {QUICK_ADVANCES.map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setPct(option);
                        setDownPaymentInput(String(Math.round(price * option / 100)));
                      }}
                      style={{
                        border: `1px solid ${effectivePct === option ? 'var(--at-accent)' : 'var(--at-border)'}`,
                        background: effectivePct === option ? 'var(--at-accent-soft)' : 'var(--at-surface)',
                        color: effectivePct === option ? 'var(--at-accent)' : 'var(--at-ink-2)',
                        borderRadius: 999,
                        padding: '9px 8px',
                        fontWeight: 900,
                        fontSize: 12,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      {option}%
                    </button>
                  ))}
                </div>

                <div style={{
                  marginTop: 14,
                  borderRadius: 14,
                  border: '1px solid var(--at-border)',
                  background: 'var(--at-bg-2)',
                  padding: 14,
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 12,
                }}>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--at-ink-3)', textTransform: 'uppercase', letterSpacing: '.1em', fontFamily: 'var(--at-mono)' }}>
                      Entregas
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--at-ink)', marginTop: 4 }}>
                      {fmtPrice(downPayment)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--at-ink-3)', textTransform: 'uppercase', letterSpacing: '.1em', fontFamily: 'var(--at-mono)' }}>
                      Te financiamos
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--at-accent)', marginTop: 4 }}>
                      {fmtPrice(loan)}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--at-ink)', letterSpacing: '-.01em', marginBottom: 12 }}>
                  2. Elegi una cuota estimada
                  {loading && (
                    <span style={{ fontWeight: 500, fontSize: 11.5, color: 'var(--at-ink-3)', marginLeft: 8 }}>
                      Consultando...
                    </span>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {loading ? (
                    FEATURED_PLAZOS.map(plazo => <SkelCard key={plazo} />)
                  ) : error ? (
                    <div style={{
                      gridColumn: '1 / -1',
                      padding: '18px 16px',
                      borderRadius: 14,
                      background: 'var(--at-bg-2)',
                      border: '1px solid var(--at-border)',
                      textAlign: 'center',
                      fontSize: 13,
                      color: 'var(--at-ink-3)',
                      lineHeight: 1.5,
                    }}>
                      No pudimos obtener los planes ahora.
                      <br />
                      Igual podes consultarnos por WhatsApp.
                    </div>
                  ) : (
                    featuredPlans.map(plan => (
                      <PlanCard
                        key={plan.plazo}
                        plan={plan}
                        selected={selectedPlazo === Number(plan.plazo)}
                        onSelect={setSelectedPlazo}
                      />
                    ))
                  )}
                </div>
              </div>

              {!loading && !error && visiblePlans.length > 0 && (
                <div style={{ marginBottom: 22 }}>
                  {selectedPlan && (
                    <div style={{
                      marginBottom: 12,
                      borderRadius: 16,
                      padding: 16,
                      background: 'linear-gradient(135deg, var(--at-accent), #082fb8)',
                      color: '#fff',
                      boxShadow: '0 18px 40px rgba(0,68,255,.22)',
                    }}>
                      <div style={{ fontSize: 11, opacity: .78, textTransform: 'uppercase', letterSpacing: '.1em', fontFamily: 'var(--at-mono)' }}>
                        Plan seleccionado
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'end', marginTop: 8 }}>
                        <div>
                          <div style={{ fontFamily: 'var(--at-display)', fontSize: 29, fontWeight: 900, letterSpacing: '-.035em', lineHeight: 1 }}>
                            {fmtPrice(Math.round(+selectedPlan.cuota))}
                          </div>
                          <div style={{ fontSize: 12, opacity: .84, marginTop: 4 }}>
                            por mes, estimado
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: 13, fontWeight: 900 }}>
                          {selectedTerm} cuotas
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowAll(value => !value)}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: 10,
                      border: '1px solid var(--at-border)',
                      background: showAll ? 'var(--at-bg-2)' : 'var(--at-surface)',
                      cursor: 'pointer',
                      fontSize: 12.5,
                      fontWeight: 800,
                      color: 'var(--at-ink-2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontFamily: 'inherit',
                      transition: 'background .15s',
                    }}
                  >
                    <span>{showAll ? 'Ocultar otros plazos' : 'Ver mas opciones de cuotas'}</span>
                    <span style={{ fontSize: 14, transition: 'transform .2s', transform: showAll ? 'rotate(180deg)' : 'rotate(0deg)', display: 'block' }}>
                      v
                    </span>
                  </button>

                  {showAll && (
                    <div style={{ marginTop: 8, borderRadius: 12, border: '1px solid var(--at-border)', overflow: 'hidden' }}>
                      {visiblePlans.map((plan, itemIndex) => {
                        const isSelected = selectedPlazo === Number(plan.plazo);
                        return (
                          <button
                            key={plan.plazo}
                            type="button"
                            onClick={() => setSelectedPlazo(Number(plan.plazo))}
                            style={{
                              width: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 12,
                              padding: '12px 14px',
                              border: 'none',
                              borderBottom: itemIndex < visiblePlans.length - 1 ? '1px solid var(--at-border)' : 'none',
                              background: isSelected ? 'var(--at-accent-soft)' : 'var(--at-surface)',
                              cursor: 'pointer',
                              transition: 'background .12s',
                              fontFamily: 'inherit',
                              textAlign: 'left',
                            }}
                          >
                            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              {isSelected && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--at-accent)', display: 'block', flexShrink: 0 }} />}
                              <span style={{ fontSize: 13, fontWeight: isSelected ? 800 : 500, color: isSelected ? 'var(--at-accent)' : 'var(--at-ink)' }}>
                                {plan.plazo} cuotas
                              </span>
                            </span>
                            <span style={{ fontFamily: 'var(--at-display)', fontSize: 15, fontWeight: 800, letterSpacing: '-.02em', color: isSelected ? 'var(--at-accent)' : 'var(--at-ink)' }}>
                              {fmtPrice(Math.round(+plan.cuota))}
                              <span style={{ fontSize: 10.5, fontWeight: 500, color: 'var(--at-ink-3)', fontFamily: 'inherit' }}> /mes</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <a
                href={waHref}
                onClick={() => trackWhatsappClick(car, 'finance_calc')}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  width: '100%',
                  padding: '16px 20px',
                  borderRadius: 14,
                  background: '#25D366',
                  color: '#fff',
                  textDecoration: 'none',
                  fontWeight: 900,
                  fontSize: 15,
                  letterSpacing: '-.01em',
                  boxShadow: '0 10px 28px -6px rgba(37,211,102,.5)',
                  marginBottom: 12,
                  transition: 'box-shadow .15s',
                }}
              >
                <IconWhatsapp size={20} fill="#fff" />
                {selectedPlan ? 'Quiero consultar este plan' : 'Consultar financiacion'}
              </a>

              <p style={{
                margin: 0,
                fontSize: 10.8,
                color: 'var(--at-ink-3)',
                lineHeight: 1.55,
                textAlign: 'center',
                padding: '0 8px',
              }}>
                Valores orientativos provistos por CreditCar. La aprobacion y las condiciones finales dependen de cada entidad financiera.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
