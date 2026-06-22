'use client';
import { useEffect, useState } from 'react';
import { getShopServices } from '../lib/store';
import Reveal from './Reveal';
import ServiceCard from './ServiceCard';
import styles from './Services.module.css';

// Mappa il servizio del SaaS al formato usato dalle card
const mapService = (s) => ({
  id: s.id,
  name: s.name,
  description: s.description,
  price: s.price_label || (s.price != null ? `${s.price}€` : ''),
  duration: `${s.duration_minutes} min`,
  image: s.image || null,
});

export default function Services() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    getShopServices().then((rows) => setServices(rows.map(mapService)));
  }, []);

  return (
    <section id="servicios" className={`section ${styles.services}`} aria-labelledby="services-title">
      <div className="container">
        <Reveal>
          <p className="section-label">I nostri servizi</p>
          <h2 id="services-title" className="section-title">Scegli il tuo stile</h2>
          <div className="divider" />
        </Reveal>

        <div className={styles.grid}>
          {services.map((s, i) => (
            <ServiceCard key={s.id} service={s} delay={i * 70} />
          ))}
        </div>
      </div>
    </section>
  );
}
