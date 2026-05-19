function trimTrailingSlash(value) {
  return String(value || '').trim().replace(/\/+$/, '');
}

export function getPublicSiteUrl() {
  const configured = trimTrailingSlash(
    import.meta.env.VITE_SITE_URL || import.meta.env.VITE_PUBLIC_SITE_URL,
  );

  if (configured) return configured;

  if (typeof window !== 'undefined' && window.location?.origin) {
    return trimTrailingSlash(window.location.origin);
  }

  return '';
}

export function getAuthRedirectTo(path = '/subastas') {
  const siteUrl = getPublicSiteUrl();
  if (!siteUrl) return undefined;

  const cleanPath = String(path || '/subastas').startsWith('/')
    ? String(path || '/subastas')
    : `/${path}`;

  return `${siteUrl}${cleanPath}`;
}
