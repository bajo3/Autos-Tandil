const photo = (id, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=70`;

const toImageArray = (value) => {
  if (Array.isArray(value)) return value.map(item => String(item || '').trim()).filter(Boolean);
  if (typeof value !== 'string') return [];

  const trimmed = value.trim();
  if (!trimmed) return [];

  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) return parsed.map(item => String(item || '').trim()).filter(Boolean);
  } catch {
    // Some legacy rows may contain one plain URL instead of a JSON array.
  }

  return [trimmed];
};

const normalizePhotos = (row) => {
  const images = toImageArray(row.images);
  const legacyUrls = toImageArray(row.photo_urls);
  const mockPhotos = Array.isArray(row.photos)
    ? row.photos.map((p) => String(p).startsWith('http') ? p : photo(p))
    : [];
  const photoUrls = images.length ? images : legacyUrls.length ? legacyUrls : mockPhotos;

  return {
    images: photoUrls,
    photoUrls,
    thumbUrl: photoUrls[0] || row.thumb_url || '/logo-autostandil.png',
  };
};

export function normalizeCar(row) {
  const photos = normalizePhotos(row);
  return {
    id: row.id,
    brand: row.brand || '',
    model: row.model || '',
    version: row.version || '',
    year: Number(row.year) || new Date().getFullYear(),
    km: Number(row.km) || 0,
    price: Number(row.price) || 0,
    currency: row.currency || 'ARS',
    fuel: row.fuel || '',
    trans: row.trans || '',
    engine: row.engine || '',
    color: row.color || '',
    type: row.type || 'Auto',
    body: row.body || '',
    badges: Array.isArray(row.badges) ? row.badges.filter(Boolean) : [],
    desc: row.desc || row.description || '',
    status: row.status || 'published',
    ...photos,
  };
}

export function carToRow(car) {
  const images = toImageArray(car.images || car.photoUrls);
  return {
    id: car.id,
    brand: car.brand,
    model: car.model,
    version: car.version,
    year: Number(car.year) || null,
    km: Number(car.km) || 0,
    price: Number(car.price) || 0,
    currency: car.currency || 'ARS',
    fuel: car.fuel,
    trans: car.trans,
    engine: car.engine,
    color: car.color,
    type: car.type,
    body: car.body,
    badges: car.badges || [],
    description: car.desc,
    images,
    status: car.status || 'draft',
  };
}
