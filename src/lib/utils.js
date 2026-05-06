export const WA_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '5492494621182';

export const fmtPrice = (n) => '$ ' + n.toLocaleString('es-AR');
export const fmtKm = (n) => n.toLocaleString('es-AR') + ' km';
export const fmtShort = (n) => {
  if (n >= 1e6) return '$ ' + (n / 1e6).toFixed(1).replace('.0', '') + 'M';
  if (n >= 1e3) return '$ ' + (n / 1e3).toFixed(0) + 'k';
  return '$ ' + n;
};

export function buildWhatsapp(car, kind) {
  const num = WA_NUMBER;
  let msg = 'Hola, vi este auto en AutosTandil y quiero más información.';
  if (kind === 'sell') {
    msg = 'Hola, quiero vender mi auto por consignación en AutosTandil.';
  } else if (kind === 'auctions') {
    msg = 'Hola, quiero que me avisen cuando lancen subastas en AutosTandil.';
  } else if (car) {
    const title = `${car.brand} ${car.model} ${car.version}`;
    msg = `Hola, vi en AutosTandil el ${title} (${car.year}) por ${fmtPrice(car.price)}. Quiero más información. — Gestionado por AutosTandil`;
  }
  return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
}
