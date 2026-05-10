import { getServiceClient } from '../_supabase.js';

const MP_TOKEN = process.env.MP_ACCESS_TOKEN;

// Mapea status de MP a nuestro enum payment_status
function mapStatus(s) {
  switch (s) {
    case 'approved': return 'approved';
    case 'rejected': return 'rejected';
    case 'cancelled': return 'cancelled';
    case 'refunded': case 'charged_back': return 'refunded';
    default: return 'pending';
  }
}

export default async function handler(req, res) {
  if (req.method === 'GET') return res.status(200).json({ ok: true });
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
  }
  if (!MP_TOKEN) return res.status(503).json({ error: 'MP_NOT_CONFIGURED' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const type = body?.type || req.query?.type;
    const dataId = body?.data?.id || req.query?.['data.id'] || req.query?.id;

    // Solo nos interesan notificaciones de pagos
    if (type !== 'payment' || !dataId) return res.status(200).json({ ignored: true });

    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${dataId}`, {
      headers: { Authorization: `Bearer ${MP_TOKEN}` },
    });
    if (!mpRes.ok) return res.status(502).json({ error: 'MP_FETCH_FAILED' });
    const mp = await mpRes.json();

    const externalRef = mp.external_reference;
    if (!externalRef) return res.status(200).json({ ignored: 'no_external_ref' });

    const sb = getServiceClient();
    const status = mapStatus(mp.status);

    const { data: payment, error: payErr } = await sb.from('payments')
      .update({ status, provider_payment_id: String(mp.id), raw: mp })
      .eq('id', externalRef).select().maybeSingle();
    if (payErr || !payment) return res.status(404).json({ error: 'PAYMENT_NOT_FOUND' });

    if (status === 'approved' && payment.kind === 'deposit') {
      // Habilita al participante
      await sb.from('auction_participants')
        .update({ deposit_status: 'paid', deposit_payment_id: String(mp.id), approved_at: new Date().toISOString() })
        .eq('auction_id', payment.auction_id).eq('user_id', payment.user_id);
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: 'INTERNAL', detail: e?.message || String(e) });
  }
}
