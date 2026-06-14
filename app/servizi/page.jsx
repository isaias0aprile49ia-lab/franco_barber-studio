import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { services } from '../lib/data';
import Reveal from '../components/Reveal';
import ServiceCard from '../components/ServiceCard';
import styles from './servizi.module.css';

export const metadata = {
  title: 'Servizi',
  description: 'Tutti i servizi di Franco Barber Studio: tagli, barba, rasatura e trattamenti. Prenota online.',
};

export default function ServiziPage() {
  return (
    <section className={styles.page} aria-labelledby="servizi-title">
      <div className="container">
        <Reveal>
          <Link href="/" className={styles.back}>
            <ArrowLeft size={16} aria-hidden="true" /> Torna alla home
          </Link>
          <p className="section-label">I nostri servizi</p>
          <h1 id="servizi-title" className="section-title">Tutti i nostri servizi</h1>
          <div className="divider" />
          <p className={styles.intro}>
            Scegli il servizio che preferisci e prenota in pochi secondi.
            Passa il cursore su una scheda e clicca per prenotare.
          </p>
        </Reveal>

        <div className={styles.grid}>
          {services.map((s, i) => (
            <ServiceCard key={s.id} service={s} delay={(i % 4) * 70} />
          ))}
        </div>
      </div>
    </section>
  );
}
