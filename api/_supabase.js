import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function getServiceClient() {
  if (!url || !serviceRole) throw new Error('Supabase server env missing');
  return createClient(url, serviceRole, { auth: { persistSession: false } });
}

export async function getUserFromAuthHeader(req) {
  const auth = req.headers.authorization || req.headers.Authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return null;
  const sb = getServiceClient();
  const { data, error } = await sb.auth.getUser(token);
  if (error) return null;
  return data.user || null;
}
