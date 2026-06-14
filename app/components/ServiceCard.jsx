'use client';
import Image from 'next/image';
import { Clock, ArrowRight } from 'lucide-react';
import Reveal from './Reveal';
import styles from './Services.module.css';

export default function ServiceCard({ service: s, delay = 0 }) {
  const prenota = () => {
    window.dispatchEvent(new CustomEvent('franco:prenota-servizio', { detail: { serviceId: s.id } }));
  };

  return (
    <Reveal
      as="article"
      className={styles.card}
      delay={delay}
      role="button"
      tabIndex={0}
      aria-label={`Prenota ${s.name}`}
      onClick={prenota}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); prenota(); } }}
    >
      <div className={`${styles.photo} ${s.image ? '' : 'photo-slot'}`}>
        {s.image
          ? <Image src={s.image} alt={s.name} fill sizes="(max-width: 768px) 100vw, 25vw" className={styles.photoImg} />
          : 'Foto'}
        <div className={styles.hoverCta} aria-hidden="true">
          <span className={styles.prenotaBtn}>Prenota <ArrowRight size={15} /></span>
        </div>
      </div>
      <div className={styles.body}>
        <h3 className={styles.name}>{s.name}</h3>
        <p className={styles.description}>{s.description}</p>
        <div className={styles.meta}>
          <span className={styles.price}>{s.price}</span>
          <span className={styles.duration}>
            <Clock size={14} aria-hidden="true" /> {s.duration}
          </span>
        </div>
      </div>
    </Reveal>
  );
}
