const SESSION_KEY = 'autostandil-admin-session';

export function getAdminCredentials() {
  return {
    user: import.meta.env.VITE_ADMIN_USER || 'admin',
    password: import.meta.env.VITE_ADMIN_PASSWORD || 'admin',
  };
}

export function isAdminSession() {
  return window.sessionStorage.getItem(SESSION_KEY) === 'ok';
}

export function setAdminSession(active) {
  if (active) window.sessionStorage.setItem(SESSION_KEY, 'ok');
  else window.sessionStorage.removeItem(SESSION_KEY);
}
