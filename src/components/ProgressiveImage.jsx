import { useState } from 'react';

export function ProgressiveImage({
  src,
  alt = '',
  fallback,
  className,
  style,
  imgStyle,
  loading = 'lazy',
  objectFit = 'cover',
  onError,
}) {
  return (
    <ProgressiveImageFrame
      key={src || 'empty'}
      src={src}
      alt={alt}
      fallback={fallback}
      className={className}
      style={style}
      imgStyle={imgStyle}
      loading={loading}
      objectFit={objectFit}
      onError={onError}
    />
  );
}

function ProgressiveImageFrame({
  src,
  alt,
  fallback,
  className,
  style,
  imgStyle,
  loading,
  objectFit,
  onError,
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className={className} style={{ position: 'relative', overflow: 'hidden', ...style }}>
        {fallback || (
          <div className="at-image-fallback">
            <span>Foto no disponible</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={className} style={{ position: 'relative', overflow: 'hidden', background: 'var(--at-bg-2)', ...style }}>
      {!loaded && <div className="at-image-loading" aria-hidden="true" />}
      <img
        src={src}
        alt={alt}
        loading={loading}
        onLoad={() => setLoaded(true)}
        onError={(event) => {
          setFailed(true);
          onError?.(event);
        }}
        style={{
          width: '100%',
          height: '100%',
          objectFit,
          display: 'block',
          opacity: loaded ? 1 : 0,
          transform: loaded ? 'scale(1)' : 'scale(1.015)',
          transition: 'opacity .26s ease, transform .36s ease',
          ...imgStyle,
        }}
      />
    </div>
  );
}
