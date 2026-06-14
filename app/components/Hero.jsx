import { Apple, Play } from 'lucide-react';
import styles from './Hero.module.css';

export default function Hero() {
  return (
    <section id="top" className={styles.hero} aria-label="Copertina">
      <div className={`container ${styles.inner}`}>
        <div className={styles.copy}>
          <p className="section-label">Il tuo stile, la nostra passione</p>
          <h1 className={styles.title}>
            Prenota il tuo<br />
            appuntamento <em>in modo</em><br />
            facile e veloce
          </h1>
          <p className={styles.subtitle}>
            Scegli il tuo taglio, il barbiere e l&apos;orario preferito.
            Prenota online in pochi secondi.
          </p>

          <div className={styles.actions}>
            <a href="#reservar" className={styles.storeBadge} aria-label="Prenota — App Store">
              <Apple size={26} aria-hidden="true" />
              <span>
                <small>Scarica su</small>
                App Store
              </span>
            </a>
            <a href="#reservar" className={styles.storeBadge} aria-label="Prenota — Google Play">
              <Play size={24} aria-hidden="true" />
              <span>
                <small>Disponibile su</small>
                Google Play
              </span>
            </a>
          </div>
        </div>

        <div className={styles.media}>
          <div className={`photo-slot ${styles.photo}`}>La tua foto · esterno del locale</div>
          <div className={styles.badge} aria-hidden="true">
            <span className={styles.badgeNum}>+10</span>
            <span className={styles.badgeText}>anni di<br />esperienza</span>
          </div>
        </div>
      </div>
    </section>
  );
}
