import { supabase, hasSupabaseConfig } from '../lib/supabase';

export async function listPublicAuctions() {
  if (!hasSupabaseConfig) return [];
  const { data, error } = await supabase
    .from('auctions')
    .select('*')
    .neq('status', 'draft')
    .order('starts_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function listAllAuctions() {
  if (!hasSupabaseConfig) return [];
  const { data, error } = await supabase
    .from('auctions').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getAuction(id) {
  if (!hasSupabaseConfig) return null;
  const { data, error } = await supabase.from('auctions').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function listBids(auctionId, limit = 30) {
  if (!hasSupabaseConfig) return [];
  const { data, error } = await supabase
    .from('auction_bids').select('*')
    .eq('auction_id', auctionId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

export async function getMyParticipation(auctionId, userId) {
  if (!hasSupabaseConfig || !userId) return null;
  const { data, error } = await supabase
    .from('auction_participants').select('*')
    .eq('auction_id', auctionId).eq('user_id', userId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function requestParticipation(auctionId, userId) {
  if (!hasSupabaseConfig) throw new Error('Supabase no configurado');
  const { data, error } = await supabase
    .from('auction_participants')
    .insert({ auction_id: auctionId, user_id: userId })
    .select().single();
  if (error && error.code !== '23505') throw error;
  return data || getMyParticipation(auctionId, userId);
}

export async function placeBid(auctionId, amount) {
  const { data, error } = await supabase.rpc('place_bid', { p_auction_id: auctionId, p_amount: amount });
  if (error) throw error;
  return data;
}

export function subscribeAuction(auctionId, { onAuction, onBid }) {
  if (!hasSupabaseConfig) return () => {};
  const channel = supabase.channel(`auction:${auctionId}`)
    .on('postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'auctions', filter: `id=eq.${auctionId}` },
      (payload) => onAuction?.(payload.new))
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'auction_bids', filter: `auction_id=eq.${auctionId}` },
      (payload) => onBid?.(payload.new))
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}

// ---- Admin ----
export async function createAuction(payload) {
  const { data, error } = await supabase.from('auctions').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateAuction(id, patch) {
  const { data, error } = await supabase.from('auctions').update(patch).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteAuction(id) {
  const { error } = await supabase.from('auctions').delete().eq('id', id);
  if (error) throw error;
}

export async function listAuctionParticipants(auctionId) {
  const { data, error } = await supabase
    .from('auction_participants')
    .select('*, profile:profiles!auction_participants_user_id_fkey(full_name,dni,phone,city)')
    .eq('auction_id', auctionId)
    .order('created_at');
  if (error) {
    // Fallback sin join si la FK no esta nombrada como espera PostgREST
    const { data: plain, error: e2 } = await supabase
      .from('auction_participants').select('*').eq('auction_id', auctionId).order('created_at');
    if (e2) throw e2;
    return plain || [];
  }
  return data || [];
}

export async function setParticipantStatus(participantId, status) {
  const patch = { deposit_status: status };
  if (status === 'authorized' || status === 'paid') patch.approved_at = new Date().toISOString();
  const { data, error } = await supabase
    .from('auction_participants').update(patch).eq('id', participantId).select().single();
  if (error) throw error;
  return data;
}

export async function closeAuction(id) {
  const { data, error } = await supabase.rpc('close_auction', { p_auction_id: id });
  if (error) throw error;
  return data;
}
