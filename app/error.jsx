'use client';
import { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="container" style={{ paddingTop: '120px', paddingBottom: '60px', textAlign: 'center' }}>
      <h1 className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem' }}>
        Algo ha salido mal
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Hemos encontrado un problema cargando esta página.
      </p>
      <button onClick={reset} className="btn btn-primary">Reintentar</button>
    </main>
  );
}
