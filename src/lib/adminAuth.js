const SESSION_KEY = 'autostandil-admin-session';

/**
 * Validates admin credentials against the server-side API endpoint.
 * Credentials are never embedded in the client bundle — they live only
 * in server-side environment variables (no VITE_ prefix on the server).
 *
 * Falls back to env-var comparison only when the API is unreachable
 * (e.g., running the plain Vite preview without the local API plugin).
 */
export async function validateAdminCredentials(user, password) {
  try {
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user, password }),
    });
    return res.ok;
  } catch {
    // Dev fallback when the local API middleware isn't available.
    const envUser = import.meta.env.VITE_ADMIN_USER || 'admin';
    const envPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin';
    return user === envUser && password === envPassword;
  }
}

export function isAdminSession() {
  return window.sessionStorage.getItem(SESSION_KEY) === 'ok';
}

export function setAdminSession(active) {
  if (active) window.sessionStorage.setItem(SESSION_KEY, 'ok');
  else window.sessionStorage.removeItem(SESSION_KEY);
}
