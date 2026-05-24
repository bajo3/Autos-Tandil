import { useEffect } from 'react';

const BASE_TITLE = 'AutosTandil';
const BASE_DESC = 'AutosTandil: compra, venta y consignación de autos usados en Tandil. Stock seleccionado, atención por WhatsApp.';
const BASE_OG_TITLE = 'AutosTandil — Autos en Tandil';

function setMeta(sel, attr, val) {
  const el = document.querySelector(sel);
  if (el && val) el.setAttribute(attr, val);
}

/**
 * Actualiza dinámicamente title, meta description y Open Graph por ruta.
 * Se revierte al desmontar para no dejar meta sucia entre navegaciones.
 */
export function useSEO({ title, description, image } = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} — ${BASE_TITLE}` : BASE_OG_TITLE;
    const desc = description || BASE_DESC;

    document.title = fullTitle;
    setMeta('meta[name="description"]', 'content', desc);
    setMeta('meta[property="og:title"]', 'content', fullTitle);
    setMeta('meta[property="og:description"]', 'content', desc);
    if (image) setMeta('meta[property="og:image"]', 'content', image);

    return () => {
      document.title = BASE_OG_TITLE;
      setMeta('meta[name="description"]', 'content', BASE_DESC);
      setMeta('meta[property="og:title"]', 'content', BASE_OG_TITLE);
      setMeta('meta[property="og:description"]', 'content', BASE_DESC);
    };
  }, [title, description, image]);
}
