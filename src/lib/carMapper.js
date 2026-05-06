const photo = (id, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=70`;

const normalizePhotos = (row) => {
  const photoUrls = Array.isArray(row.photo_urls)
    ? row.photo_urls.filter(Boolean)
    : Array.isArray(row.photos)
      ? row.photos.map((p) => String(p).startsWith('http') ? p : photo(p))
      : [];

  return {
    photoUrls,
    thumbUrl: row.thumb_url || photoUrls[0] || '/logo-autostandil.png',
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
    photo_urls: car.photoUrls || [],
    thumb_url: car.thumbUrl || car.photoUrls?.[0] || null,
    status: car.status || 'draft',
  };
}
