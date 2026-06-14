import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="container" style={{ paddingTop: '120px', paddingBottom: '60px', textAlign: 'center' }}>
      <h1 className="text-gradient" style={{ fontSize: '5rem', fontWeight: 900, marginBottom: '1rem' }}>
        404
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginBottom: '2rem' }}>
        La página que buscas no existe o ha sido movida.
      </p>
      <Link href="/" className="btn btn-primary">Volver al inicio</Link>
    </main>
  );
}
