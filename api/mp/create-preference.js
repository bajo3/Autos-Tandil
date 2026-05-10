import { getServiceClient, getUserFromAuthHeader } from '../_supabase.js';

const MP_TOKEN = process.env.MP_ACCESS_TOKEN;
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || '';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
  }
  if (!MP_TOKEN) return res.status(503).json({ error: 'MP_NOT_CONFIGURED' });

  try {
    const user = await getUserFromAuthHeader(req);
    if (!user) return res.status(401).json({ error: 'AUTH_REQUIRED' });

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const { auction_id, amount, kind = 'deposit' } = body;
    if (!auction_id || !amount) return res.status(400).json({ error: 'INVALID_PAYLOAD' });

    const sb = getServiceClient();

    const { data: auction, error: auctionErr } = await sb
      .from('auctions').select('id, title, deposit_amount, status').eq('id', auction_id).maybeSingle();
    if (auctionErr || !auction) return res.status(404).json({ error: 'AUCTION_NOT_FOUND' });
    if (auction.status === 'cancelled' || auction.status === 'ended') {
      return res.status(400).json({ error: 'AUCTION_CLOSED' });
    }

    const expected = Number(auction.deposit_amount);
    if (kind === 'deposit' && Number(amount) !== expected) {
      return res.status(400).json({ error: 'AMOUNT_MISMATCH', expected });
    }

    const { data: payment, error: payErr } = await sb.from('payments').insert({
      user_id: user.id, auction_id, kind, amount,
      provider: 'mercadopago', status: 'pending',
    }).select().single();
    if (payErr) return res.status(500).json({ error: 'DB_ERROR', detail: payErr.message });

    const back = PUBLIC_BASE_URL || `https://${req.headers.host}`;
    const preference = {
      items: [{
        id: auction.id,
        title: `Seña subasta: ${auction.title}`,
        quantity: 1,
        unit_price: Number(amount),
        currency_id: 'ARS',
      }],
      payer: { email: user.email },
      external_reference: payment.id,
      metadata: { auction_id, user_id: user.id, kind },
      back_urls: {
        success: `${back}/subastas?mp=success`,
        failure: `${back}/subastas?mp=failure`,
        pending: `${back}/subastas?mp=pending`,
      },
      auto_return: 'approved',
      notification_url: `${back}/api/mp/webhook`,
    };

    const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${MP_TOKEN}`,
      },
      body: JSON.stringify(preference),
    });
    const mpData = await mpRes.json();
    if (!mpRes.ok) {
      await sb.from('payments').update({ status: 'rejected', raw: mpData }).eq('id', payment.id);
      return res.status(502).json({ error: 'MP_ERROR', detail: mpData });
    }

    await sb.from('payments').update({ preference_id: mpData.id, raw: mpData }).eq('id', payment.id);

    return res.status(200).json({
      payment_id: payment.id,
      preference_id: mpData.id,
      init_point: mpData.init_point || mpData.sandbox_init_point,
    });
  } catch (e) {
    return res.status(500).json({ error: 'INTERNAL', detail: e?.message || String(e) });
  }
}
