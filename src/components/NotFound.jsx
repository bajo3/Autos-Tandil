import { useNavigate } from 'react-router-dom';
import { ATLogo } from './ATLogo';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--at-bg)', padding: '40px 24px', textAlign: 'center',
    }}>
      <ATLogo size={24} />

      <div style={{
        marginTop: 32, fontFamily: 'var(--at-mono)',
        fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase',
        color: 'var(--at-ink-3)',
      }}>
        Error 404
      </div>

      <h1 style={{
        margin: '12px 0 0', fontFamily: 'var(--at-display)',
        fontSize: 'clamp(36px, 8vw, 64px)', fontWeight: 500,
        letterSpacing: '-.04em', lineHeight: 1, color: 'var(--at-ink)',
      }}>
        Página no encontrada.
      </h1>

      <p style={{
        marginTop: 16, fontSize: 15, color: 'var(--at-ink-2)',
        lineHeight: 1.6, maxWidth: 380,
      }}>
        La URL que buscás no existe o fue movida. Desde acá podés volver al inicio o explorar el catálogo.
      </p>

      <div style={{ display: 'flex', gap: 10, marginTop: 28, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          type="button"
          onClick={() => navigate('/')}
          style={{
            padding: '12px 22px', borderRadius: 999, border: 'none',
            background: 'var(--at-ink)', color: '#fff',
            fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          Ir al inicio
        </button>
        <button
          type="button"
          onClick={() => navigate('/catalogo')}
          style={{
            padding: '12px 22px', borderRadius: 999,
            border: '1px solid var(--at-border)',
            background: 'var(--at-surface)', color: 'var(--at-ink)',
            fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          Ver catálogo
        </button>
      </div>
    </div>
  );
}
