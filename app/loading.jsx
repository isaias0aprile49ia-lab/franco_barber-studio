export default function Loading() {
  return (
    <main className="container" style={{ paddingTop: '120px', paddingBottom: '60px', textAlign: 'center' }}>
      <div
        role="status"
        aria-label="Cargando"
        style={{
          width: 48,
          height: 48,
          margin: '0 auto',
          borderRadius: '50%',
          border: '3px solid var(--border-color)',
          borderTopColor: 'var(--accent-primary)',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  );
}
