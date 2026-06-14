'use client';
import { useState } from 'react';
import Image from 'next/image';
import { ShoppingBag, Check } from 'lucide-react';
import { addToCart } from '../lib/store';
import Reveal from './Reveal';
import styles from './Products.module.css';

const fmt = (n) => `€${Number(n).toFixed(2).replace('.', ',')}`;

export default function ProductCard({ product: p, delay = 0 }) {
  const [added, setAdded] = useState(false);

  const add = () => {
    addToCart(p.id);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <Reveal
      as="article"
      className={styles.card}
      delay={delay}
      role="button"
      tabIndex={0}
      aria-label={`Aggiungi ${p.name} al carrello`}
      onClick={add}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); add(); } }}
    >
      <div className={`${styles.photo} ${p.image ? '' : 'photo-slot'}`}>
        {p.image
          ? <Image src={p.image} alt={p.name} fill sizes="(max-width: 768px) 100vw, 20vw" className={styles.photoImg} />
          : 'Foto'}
        <div className={`${styles.hoverCta} ${added ? styles.hoverCtaDone : ''}`} aria-hidden="true">
          <span className={styles.addBtn}>
            {added ? <><Check size={15} /> Aggiunto</> : <><ShoppingBag size={15} /> Aggiungi</>}
          </span>
        </div>
      </div>
      <div className={styles.body}>
        <h3 className={styles.name}>{p.name}</h3>
        <span className={styles.price}>{fmt(p.price)}</span>
      </div>
    </Reveal>
  );
}
