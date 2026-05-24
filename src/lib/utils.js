export const WA_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '5492494621182';

export const fmtPrice = (n, currency = 'ARS') => {
  const num = Number(n) || 0;
  return (currency === 'USD' ? 'USD ' : '$ ') + num.toLocaleString('es-AR');
};
export const fmtKm = (n) => n.toLocaleString('es-AR') + ' km';
export const fmtShort = (n) => {
  if (n >= 1e6) return '$ ' + (n / 1e6).toFixed(1).replace('.0', '') + 'M';
  if (n >= 1e3) return '$ ' + (n / 1e3).toFixed(0) + 'k';
  return '$ ' + n;
};

export const FINANCE_MIN_DOWN_PCT = 50;
export const FINANCE_MAX_LOAN_PCT = 50;
export const FINANCE_TERMS = [6, 12, 18, 24, 36];
export const AUCTION_MIN_DEPOSIT = 1000000;

export const estimateMonthlyPayment = (price, downPct = FINANCE_MIN_DOWN_PCT, months = 36) => {
  const amount = Number(price) || 0;
  if (!amount) return 0;
  const financed = amount * (1 - downPct / 100);
  const estimatedRateFactor = 1.95;
  return Math.round((financed * estimatedRateFactor) / months);
};

export function buildWhatsapp(car, kind) {
  const num = WA_NUMBER;
  let msg = 'Hola, vi este auto en AutosTandil y quiero más información.';
  if (kind === 'sell') {
    msg = 'Hola, quiero vender mi auto por consignación en AutosTandil.';
  } else if (kind === 'auctions') {
    msg = 'Hola, quiero que me avisen cuando lancen subastas en AutosTandil.';
  } else if (kind === 'auction-seller') {
    msg = 'Hola, quiero subastar mi auto con AutosTandil. Quiero conocer condiciones y próximos pasos.';
  } else if (kind === 'auction-help') {
    msg = 'Hola, necesito ayuda con mi cuenta o participacion en subastas de AutosTandil.';
  } else if (car) {
    const title = `${car.brand} ${car.model} ${car.version}`;
    msg = `Hola, vi en AutosTandil el ${title} (${car.year}) por ${fmtPrice(car.price)}. Quiero más información. - Gestionado por AutosTandil`;
  }
  return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
}
