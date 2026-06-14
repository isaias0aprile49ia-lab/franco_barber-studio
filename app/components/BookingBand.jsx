import { CalendarClock, ArrowRight } from 'lucide-react';
import Reveal from './Reveal';
import styles from './BookingBand.module.css';

export default function BookingBand() {
  return (
    <section className={styles.wrap} aria-label="Prenota ora">
      <div className="container">
        <Reveal className={styles.band}>
          <div className={styles.icon} aria-hidden="true">
            <CalendarClock size={26} />
          </div>
          <div className={styles.text}>
            <h2 className={styles.title}>Prenota il tuo appuntamento ora</h2>
            <p className={styles.sub}>Scegli servizio, barbiere e orario in pochi passaggi.</p>
          </div>
          <a href="#reservar" className={`btn btn-gold ${styles.btn}`}>
            Prenota Ora <ArrowRight size={17} aria-hidden="true" />
          </a>
        </Reveal>
      </div>
    </section>
  );
}
