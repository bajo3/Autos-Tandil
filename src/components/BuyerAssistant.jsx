import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fmtPrice, fmtShort, WA_NUMBER } from '../lib/utils';
import { VEHICLE_USE_OPTIONS as useOptions, defaultUseTagsForType } from '../lib/vehicleUse';
import { saveSalesLead } from '../services/leadService';
import { trackEvent } from '../services/analyticsService';
import { IconArrowRight, IconCheck, IconWhatsapp } from './Icons';
import { CarCard } from './CarCard';

const budgetOptions = [
  { label: 'Hasta $18M', value: 18000000 },
  { label: 'Hasta $25M', value: 25000000 },
  { label: 'Hasta $35M', value: 35000000 },
  { label: 'Más de $35M', value: 60000000 },
];

const pill = (active) => ({
  border: `1px solid ${active ? 'rgba(255,255,255,.95)' : 'rgba(255,255,255,.2)'}`,
  background: active ? '#fff' : 'rgba(255,255,255,.08)',
  color: active ? 'var(--at-ink)' : '#f8fafc',
  borderRadius: 999,
  padding: '9px 12px',
  cursor: 'pointer',
  fontSize: 12,
  fontWeight: 900,
  boxShadow: active ? '0 12px 30px rgba(0,0,0,.18)' : 'none',
});

function scoreCar(car, answers) {
  let score = 0;
  if (!answers.budget || car.price <= answers.budget) score += 30;
  else score -= 40;
  const carUseTags = car.usageTags?.length ? car.usageTags : defaultUseTagsForType(car.type);
  const selectedUse = useOptions.find(item => item.id === answers.use);
  if (carUseTags.includes(answers.use)) score += 28;
  else if (selectedUse?.types.includes(car.type)) score += 18;
  if (answers.trans === 'any' || !answers.trans || car.trans === answers.trans) score += 16;
  if (answers.finance && car.badges?.includes('financia')) score += 18;
  if (car.badges?.includes('destacado')) score += 8;
  if (car.badges?.includes('nuevo')) score += 4;
  score += Math.max(0, Math.min(10, (new Date().getFullYear() - car.year) * -1 + 10));
  return score;
}

export function BuyerAssistant({ cars = [], favs = [], onFav, source = 'home' }) {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({ budget: 25000000, use: 'family', trans: 'any', finance: true });
  const [contact, setContact] = useState({ full_name: '', phone: '' });
  const [sent, setSent] = useState(false);

  const results = useMemo(() => [...cars]
    .map(car => ({ car, score: scoreCar(car, answers) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(item => item.car), [cars, answers]);

  const patch = (key, value) => {
    setAnswers(current => ({ ...current, [key]: value }));
    trackEvent('assistant_answer_changed', { source, metadata: { key, value } });
  };

  const submitLead = async () => {
    if (!contact.phone.trim()) return;
    await saveSalesLead({
      lead_type: 'buyer_assistant',
      full_name: contact.full_name,
      phone: contact.phone,
      budget_max: answers.budget,
      preferences: { ...answers, recommended: results.map(car => car.id) },
      notes: `Asistente recomendó: ${results.map(car => `${car.brand} ${car.model}`).join(', ')}`,
      source,
    });
    trackEvent('assistant_lead_created', { source, metadata: { ...answers, count: results.length } });
    setSent(true);
  };

  const waText = `Hola! Usé el asistente de AutosTandil. Busco algo para ${useOptions.find(item => item.id === answers.use)?.label || 'comprar'}, presupuesto ${fmtShort(answers.budget)}${answers.finance ? ', con financiación' : ''}. Me interesaron: ${results.map(car => `${car.brand} ${car.model}`).join(', ')}.`;

  return (
    <section className="at-assistant-panel" style={{
      background: 'linear-gradient(145deg, #0f172a 0%, #111827 48%, #0b1220 100%)',
      color: '#fff',
      borderRadius: 18,
      padding: 18,
      display: 'grid',
      gap: 16,
      overflow: 'hidden',
      boxShadow: '0 24px 70px rgba(15,23,42,.22)',
      border: '1px solid rgba(255,255,255,.08)',
    }}>
      <div className="lg:grid lg:grid-cols-[.9fr_1.1fr]" style={{ gap: 18, alignItems: 'start' }}>
        <div>
          <div style={{ fontFamily: 'var(--at-mono)', fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--at-accent-soft-fg)' }}>
            Asistente de compra
          </div>
          <h2 style={{ margin: '6px 0 0', fontFamily: 'var(--at-display)', fontSize: 30, lineHeight: 1, fontWeight: 500, letterSpacing: '-.035em' }}>
            Decime qué necesitás y te mostramos candidatos reales.
          </h2>
          <p style={{ margin: '10px 0 0', color: 'rgba(255,255,255,.72)', fontSize: 13.5, lineHeight: 1.55 }}>
            No es un buscador más: prioriza uso, presupuesto y financiación sobre el stock actual.
          </p>

          <div style={{ display: 'grid', gap: 13, marginTop: 18 }}>
            <div>
              <div style={stepLabel}>Presupuesto</div>
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                {budgetOptions.map(option => (
                  <button key={option.value} type="button" onClick={() => patch('budget', option.value)} style={pill(answers.budget === option.value)}>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div style={stepLabel}>Uso principal</div>
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                {useOptions.map(option => (
                  <button key={option.id} type="button" onClick={() => patch('use', option.id)} style={pill(answers.use === option.id)}>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div style={stepLabel}>Caja</div>
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                {[
                  ['any', 'Cualquiera'],
                  ['Automática', 'Automática'],
                  ['Manual', 'Manual'],
                ].map(([value, label]) => (
                  <button key={value} type="button" onClick={() => patch('trans', value)} style={pill(answers.trans === value)}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <button type="button" onClick={() => patch('finance', !answers.finance)} style={{
              ...pill(answers.finance),
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}>
              <IconCheck size={13} sw={2.4} />
              Quiero opciones con financiación
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            color: '#fff',
          }}>
            <strong style={{ fontFamily: 'var(--at-display)', fontSize: 18 }}>Recomendados ahora</strong>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,.62)' }}>{fmtPrice(answers.budget)}</span>
          </div>
          <div className="grid md:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3" style={{ gap: 10 }}>
            {results.map(car => (
              <CarCard
                key={car.id}
                car={car}
                onOpen={() => navigate(`/auto/${car.id}`)}
                onFav={onFav}
                isFav={favs.includes(car.id)}
                radius={12}
              />
            ))}
          </div>
          <div style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 14, padding: 12 }}>
            {sent ? (
              <div style={{ display: 'flex', gap: 9, color: '#dcfce7', fontSize: 13, alignItems: 'center' }}>
                <IconCheck size={16} sw={2.4} /> Listo, quedó guardado para seguimiento.
              </div>
            ) : (
              <div className="grid md:grid-cols-[1fr_1fr_auto]" style={{ gap: 8 }}>
                <input value={contact.full_name} onChange={e => setContact(current => ({ ...current, full_name: e.target.value }))} placeholder="Nombre" style={assistantInput} />
                <input value={contact.phone} onChange={e => setContact(current => ({ ...current, phone: e.target.value }))} placeholder="WhatsApp" style={assistantInput} />
                <button type="button" onClick={submitLead} style={assistantBtn}>Guardar</button>
              </div>
            )}
            <a href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(waText)}`} target="_blank" rel="noopener noreferrer"
              onClick={() => trackEvent('assistant_whatsapp_click', { source, metadata: answers })}
              style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 8, color: '#fff', textDecoration: 'none', fontWeight: 900, fontSize: 13 }}>
              <IconWhatsapp size={16} fill="#fff" /> Consultar recomendación <IconArrowRight size={13} sw={2.4} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

const stepLabel = {
  fontFamily: 'var(--at-mono)',
  fontSize: 10,
  letterSpacing: '.13em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,.58)',
  marginBottom: 7,
};

const assistantInput = {
  width: '100%',
  border: '1px solid rgba(255,255,255,.16)',
  background: 'rgba(255,255,255,.1)',
  color: '#fff',
  borderRadius: 10,
  padding: '11px 12px',
  outline: 'none',
  fontSize: 13,
};

const assistantBtn = {
  border: 'none',
  borderRadius: 10,
  padding: '11px 14px',
  background: '#fff',
  color: 'var(--at-ink)',
  fontWeight: 900,
  cursor: 'pointer',
};
