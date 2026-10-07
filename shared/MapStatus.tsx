/** Loading / failure notice drawn over a map (inline styles: Tailwind does not scan shared/). */
export function MapStatus({ ready, failed, onRetry }: { ready: boolean; failed: boolean; onRetry: () => void }) {
  if (ready) return null;
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: failed ? 'auto' : 'none',
        zIndex: 1,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 16px',
          borderRadius: 9999,
          background: 'rgba(255,255,255,.95)',
          boxShadow: '0 4px 16px rgba(15,23,42,.15)',
          fontSize: 13,
          fontWeight: 600,
          color: '#0f172a',
        }}
      >
        {failed ? (
          <>
            Carte indisponible · vérifiez la connexion
            <button
              type='button'
              onClick={onRetry}
              style={{
                border: 'none',
                borderRadius: 9999,
                padding: '4px 10px',
                background: '#0f172a',
                color: '#fff',
                fontWeight: 600,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              Réessayer
            </button>
          </>
        ) : (
          <>
            <span
              style={{
                width: 14,
                height: 14,
                borderRadius: 9999,
                border: '2px solid #cbd5e1',
                borderTopColor: '#0f172a',
                animation: 'newgee-map-spin .8s linear infinite',
              }}
            />
            Chargement de la carte…
            <style>{'@keyframes newgee-map-spin{to{transform:rotate(360deg)}}'}</style>
          </>
        )}
      </div>
    </div>
  );
}
