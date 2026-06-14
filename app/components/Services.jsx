import { services } from '../lib/data';
import Reveal from './Reveal';
import ServiceCard from './ServiceCard';
import styles from './Services.module.css';

export default function Services() {
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
