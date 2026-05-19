import { hasSupabaseConfig, supabase } from '../lib/supabase';

const localKey = 'at_growth_leads';

function readLocal() {
  try {
    return JSON.parse(localStorage.getItem(localKey) || '[]');
  } catch {
    return [];
  }
}

function writeLocal(rows) {
  try {
    localStorage.setItem(localKey, JSON.stringify(rows.slice(0, 80)));
  } catch {
    // Local persistence is only a development fallback.
  }
}

function localInsert(table, payload) {
  const row = {
    id: `${table}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    table,
    status: payload.status || 'new',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...payload,
  };
  const next = [row, ...readLocal()];
  writeLocal(next);
  return row;
}

async function insert(table, payload) {
  if (!hasSupabaseConfig || !supabase) return localInsert(table, payload);
  const { data, error } = await supabase.from(table).insert(payload).select('*').single();
  if (error) {
    if (error.code === 'PGRST205' || String(error.message || '').includes('schema cache')) {
      return localInsert(table, payload);
    }
    throw error;
  }
  return data;
}

export async function saveSalesLead(payload) {
  return insert('sales_leads', {
    lead_type: payload.lead_type || 'seller',
    status: payload.status || 'new',
    full_name: payload.full_name || '',
    phone: payload.phone || '',
    email: payload.email || '',
    car_id: payload.car_id || null,
    car_title: payload.car_title || '',
    vehicle_brand: payload.vehicle_brand || '',
    vehicle_model: payload.vehicle_model || '',
    vehicle_year: payload.vehicle_year ? Number(payload.vehicle_year) : null,
    vehicle_km: payload.vehicle_km ? Number(payload.vehicle_km) : null,
    budget_min: payload.budget_min ? Number(payload.budget_min) : null,
    budget_max: payload.budget_max ? Number(payload.budget_max) : null,
    preferences: payload.preferences || {},
    notes: payload.notes || '',
    source: payload.source || 'web',
  });
}

export async function saveBuyerAlert(payload) {
  return insert('buyer_alerts', {
    status: 'active',
    full_name: payload.full_name || '',
    phone: payload.phone || '',
    email: payload.email || '',
    query: payload.query || '',
    brand: payload.brand || null,
    type: payload.type || null,
    fuel: payload.fuel || null,
    transmission: payload.transmission || null,
    budget_max: payload.budget_max ? Number(payload.budget_max) : null,
    year_min: payload.year_min ? Number(payload.year_min) : null,
    source: payload.source || 'catalog',
  });
}

export async function listGrowthLeads() {
  if (!hasSupabaseConfig || !supabase) {
    const rows = readLocal();
    return {
      leads: rows.filter(row => row.table === 'sales_leads'),
      alerts: rows.filter(row => row.table === 'buyer_alerts'),
      configured: false,
    };
  }

  const [leadsRes, alertsRes] = await Promise.all([
    supabase.from('sales_leads').select('*').order('created_at', { ascending: false }).limit(200),
    supabase.from('buyer_alerts').select('*').order('created_at', { ascending: false }).limit(200),
  ]);

  const missingTable = [leadsRes.error, alertsRes.error].some(error =>
    error && (error.code === 'PGRST205' || String(error.message || '').includes('schema cache')));
  if (missingTable) {
    const rows = readLocal();
    return {
      leads: rows.filter(row => row.table === 'sales_leads'),
      alerts: rows.filter(row => row.table === 'buyer_alerts'),
      configured: false,
    };
  }

  if (leadsRes.error) throw leadsRes.error;
  if (alertsRes.error) throw alertsRes.error;
  return { leads: leadsRes.data || [], alerts: alertsRes.data || [], configured: true };
}

export async function updateGrowthLead(table, id, patch) {
  if (!hasSupabaseConfig || !supabase) {
    const rows = readLocal().map(row => row.table === table && row.id === id
      ? { ...row, ...patch, updated_at: new Date().toISOString() }
      : row);
    writeLocal(rows);
    return rows.find(row => row.table === table && row.id === id);
  }

  const { data, error } = await supabase.from(table).update(patch).eq('id', id).select('*').single();
  if (error) throw error;
  return data;
}
