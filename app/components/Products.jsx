import Link from 'next/link';
import { products } from '../lib/data';
import Reveal from './Reveal';
import ProductCard from './ProductCard';
import styles from './Products.module.css';

export default function Products() {
  return (
    <section id="prodotti" className={`section section-alt ${styles.products}`} aria-labelledby="products-title">
      <div className="container">
        <Reveal>
          <p className="section-label">Prodotti in evidenza</p>
          <h2 id="products-title" className="section-title">I preferiti dei nostri clienti</h2>
          <div className="divider" />
        </Reveal>

        <div className={styles.grid}>
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} delay={i * 60} />
          ))}
        </div>

        <Reveal className={styles.cta}>
          <Link href="/prodotti" className="btn btn-outline">Vedi tutti i prodotti</Link>
        </Reveal>
      </div>
    </section>
  );
}
