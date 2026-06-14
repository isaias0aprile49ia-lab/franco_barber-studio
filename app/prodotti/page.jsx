import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { products } from '../lib/data';
import Reveal from '../components/Reveal';
import ProductCard from '../components/ProductCard';
import styles from './prodotti.module.css';

export const metadata = {
  title: 'Prodotti',
  description: 'Tutti i prodotti di Franco Barber Studio: styling, barba e cura dei capelli.',
};

export default function ProdottiPage() {
  return (
    <section className={styles.page} aria-labelledby="prodotti-title">
      <div className="container">
        <Reveal>
          <Link href="/" className={styles.back}>
            <ArrowLeft size={16} aria-hidden="true" /> Torna alla home
          </Link>
          <p className="section-label">Prodotti</p>
          <h1 id="prodotti-title" className="section-title">Tutti i nostri prodotti</h1>
          <div className="divider" />
          <p className={styles.intro}>
            Passa il cursore su una scheda e clicca per aggiungerla al carrello.
          </p>
        </Reveal>

        <div className={styles.grid}>
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} delay={(i % 4) * 60} />
          ))}
        </div>
      </div>
    </section>
  );
}
