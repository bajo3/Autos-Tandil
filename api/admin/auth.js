const ADMIN_USER = process.env.VITE_ADMIN_USER;
const ADMIN_PASSWORD = process.env.VITE_ADMIN_PASSWORD;

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const { user, password } = body;

  if (!ADMIN_USER || !ADMIN_PASSWORD) {
    return res.status(503).json({ error: 'AUTH_NOT_CONFIGURED' });
  }

  if (user !== ADMIN_USER || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'INVALID_CREDENTIALS' });
  }

  return res.status(200).json({ ok: true });
}
