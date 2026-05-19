import { hasSupabaseConfig, supabase } from '../lib/supabase';

const pageViewCache = new Map();
const minPageViewInterval = 10_000;

const titleForCar = (car) => car ? `${car.brand} ${car.model} ${car.version}`.trim() : null;

async function safeInsert(table, payload) {
  if (!hasSupabaseConfig || !supabase) return;
  try {
    const { error } = await supabase.from(table).insert(payload);
    if (error && error.code !== 'PGRST205' && !String(error.message || '').includes('schema cache')) {
      console.warn(`Analytics ${table}:`, error.message);
    }
  } catch (error) {
    console.warn(`Analytics ${table}:`, error.message);
  }
}

export function trackPageView(path, pageType) {
  const now = Date.now();
  const last = pageViewCache.get(path) || 0;
  if (now - last < minPageViewInterval) return;
  pageViewCache.set(path, now);

  queueMicrotask(() => {
    safeInsert('page_views', {
      path,
      page_type: pageType,
      referrer: document.referrer || null,
      user_agent: navigator.userAgent || null,
    });
  });
}

export function trackCarView(car) {
  if (!car?.id) return;
  queueMicrotask(() => {
    safeInsert('car_views', {
      car_id: car.id,
      slug: car.id,
      title: titleForCar(car),
    });
  });
}

export function trackWhatsappClick(car, source = 'unknown') {
  queueMicrotask(() => {
    safeInsert('whatsapp_clicks', {
      car_id: car?.id || null,
      slug: car?.id || null,
      title: titleForCar(car),
      source,
    });
  });
}

export function trackEvent(eventType, payload = {}) {
  if (!eventType) return;
  queueMicrotask(() => {
    const car = payload.car || null;
    safeInsert('site_events', {
      event_type: eventType,
      source: payload.source || null,
      car_id: car?.id || payload.car_id || null,
      slug: car?.id || payload.slug || null,
      title: titleForCar(car) || payload.title || null,
      metadata: payload.metadata || {},
    });
  });
}

const countBy = (rows, key) => rows.reduce((acc, row) => {
  const value = row[key] || 'sin-dato';
  acc[value] = (acc[value] || 0) + 1;
  return acc;
}, {});

const topEntries = (counts, limit = 6) => Object.entries(counts)
  .map(([key, count]) => ({ key, count }))
  .sort((a, b) => b.count - a.count)
  .slice(0, limit);

export async function getAdminAnalytics() {
  if (!hasSupabaseConfig || !supabase) {
    return {
      configured: false,
      totalPageViews: 0,
      pageViews7d: 0,
      totalWhatsappClicks: 0,
      topCars: [],
      topWhatsappCars: [],
      topPages: [],
      ranking: [],
    };
  }

  try {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const [pageViewsRes, recentPageViewsRes, carViewsRes, whatsappRes] = await Promise.all([
      supabase.from('page_views').select('path, page_type, created_at').limit(1000),
      supabase.from('page_views').select('path, created_at').gte('created_at', since).limit(1000),
      supabase.from('car_views').select('car_id, slug, title, created_at').limit(1000),
      supabase.from('whatsapp_clicks').select('car_id, slug, title, source, created_at').limit(1000),
    ]);

    for (const result of [pageViewsRes, recentPageViewsRes, carViewsRes, whatsappRes]) {
      if (result.error) throw result.error;
    }

    const eventsRes = await supabase
      .from('site_events')
      .select('event_type, source, slug, title, metadata, created_at')
      .limit(1000);

    const pageViews = pageViewsRes.data || [];
    const recentPageViews = recentPageViewsRes.data || [];
    const carViews = carViewsRes.data || [];
    const whatsappClicks = whatsappRes.data || [];
    const events = eventsRes.error ? [] : eventsRes.data || [];
    const carViewCounts = countBy(carViews, 'slug');
    const whatsappCounts = countBy(whatsappClicks, 'slug');
    const titleBySlug = [...carViews, ...whatsappClicks].reduce((acc, row) => {
      if (row.slug && row.title) acc[row.slug] = row.title;
      return acc;
    }, {});

    const slugs = [...new Set([...Object.keys(carViewCounts), ...Object.keys(whatsappCounts)])];
    const ranking = slugs.map((slug) => {
      const views = carViewCounts[slug] || 0;
      const clicks = whatsappCounts[slug] || 0;
      return {
        slug,
        title: titleBySlug[slug] || slug,
        views,
        clicks,
        conversion: views ? Math.round((clicks / views) * 100) : 0,
      };
    }).sort((a, b) => b.views - a.views || b.clicks - a.clicks);

    return {
      configured: true,
      totalPageViews: pageViews.length,
      pageViews7d: recentPageViews.length,
      totalWhatsappClicks: whatsappClicks.length,
      topCars: topEntries(carViewCounts).map(item => ({ ...item, title: titleBySlug[item.key] || item.key })),
      topWhatsappCars: topEntries(whatsappCounts).map(item => ({ ...item, title: titleBySlug[item.key] || item.key })),
      topPages: topEntries(countBy(pageViews, 'path')),
      topEvents: topEntries(countBy(events, 'event_type'), 10),
      topEventSources: topEntries(countBy(events, 'source'), 10),
      ranking,
    };
  } catch (error) {
    console.warn('Admin analytics:', error.message);
    return null;
  }
}
