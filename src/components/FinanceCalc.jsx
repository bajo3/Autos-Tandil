import { useState } from 'react';
import { fmtPrice } from '../lib/utils';

function SliderRow({ label, value, sub, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--at-ink)' }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--at-ink)', fontFamily: 'var(--at-display)' }}>{value}</span>
      </div>
      {children}
      {sub && <div style={{ fontSize: 11, color: 'var(--at-ink-3)', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export function FinanceCalc({ car, onClose }) {
  const [pct, setPct] = useState(40);
  const [months, setMonths] = useState(36);
  const downPayment = Math.round(car.price * pct / 100);
  const loan = car.price - downPayment;
  const rate = 0.045;
  const monthly = Math.round(loan * (rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1));

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 80, display: 'flex', flexDirection: 'column',
      maxWidth: 480, left: '50%', transform: 'translateX(-50%)',
    }}>
      <div onClick={onClose} style={{ flex: 1, background: 'rgba(15,23,42,.5)' }} />
      <div style={{
        background: 'var(--at-bg)', borderRadius: '20px 20px 0 0',
        padding: '14px 20px 24px',
      }}>
        <div style={{ display: 'grid', placeItems: 'center', marginBottom: 4 }}>
          <span style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--at-border-strong)' }} />
        </div>
        <h3 style={{ margin: '8px 0 0', fontFamily: 'var(--at-display)', fontSize: 22, fontWeight: 500, letterSpacing: '-.025em' }}>
          Calculadora de cuotas
        </h3>
        <div style={{ fontSize: 12, color: 'var(--at-ink-3)', marginTop: 4 }}>
          Estimación referencial · {car.brand} {car.model}
        </div>

        <div style={{ marginTop: 18 }}>
          <SliderRow label="Anticipo" value={pct + '%'} sub={fmtPrice(downPayment)}>
            <input type="range" min="20" max="80" step="5" value={pct}
              onChange={e => setPct(+e.target.value)} style={{ width: '100%' }} />
          </SliderRow>
          <SliderRow label="Plazo" value={months + ' meses'} sub={`Tasa ref. ${(rate*100).toFixed(1)}% mensual`}>
            <input type="range" min="12" max="60" step="6" value={months}
              onChange={e => setMonths(+e.target.value)} style={{ width: '100%' }} />
          </SliderRow>
        </div>

        <div style={{
          marginTop: 18, padding: 16, borderRadius: 12,
          background: 'var(--at-ink)', color: '#fff',
        }}>
          <div style={{ fontSize: 10.5, letterSpacing: '.16em', textTransform: 'uppercase', opacity: .65, fontFamily: 'var(--at-mono)' }}>
            Cuota mensual estimada
          </div>
          <div style={{ fontFamily: 'var(--at-display)', fontSize: 32, fontWeight: 600, letterSpacing: '-.025em', marginTop: 4 }}>
            {fmtPrice(monthly)}
          </div>
          <div style={{ marginTop: 8, fontSize: 11.5, color: 'rgba(255,255,255,.7)' }}>
            Anticipo {fmtPrice(downPayment)} · {months} cuotas de {fmtPrice(monthly)}
          </div>
        </div>

        <button onClick={onClose} style={{
          marginTop: 14, width: '100%', padding: 12,
          border: '1px solid var(--at-border)', background: 'var(--at-surface)',
          borderRadius: 10, fontWeight: 600, fontSize: 13.5,
          color: 'var(--at-ink)', cursor: 'pointer', fontFamily: 'inherit',
        }}>Cerrar</button>
      </div>
    </div>
  );
}
