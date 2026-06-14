import Reveal from './Reveal';
import styles from './Gallery.module.css';

const SLOTS = [
  { id: 1, span: 'tall' },
  { id: 2, span: '' },
  { id: 3, span: '' },
  { id: 4, span: '' },
  { id: 5, span: 'wide' },
  { id: 6, span: '' },
];

export default function Gallery() {
  return (
    <section id="galleria" className={`section section-alt ${styles.gallery}`} aria-labelledby="gallery-title">
      <div className="container">
        <Reveal>
          <p className="section-label">Galleria</p>
          <h2 id="gallery-title" className="section-title">I nostri lavori</h2>
          <div className="divider" />
        </Reveal>

        <div className={styles.grid}>
          {SLOTS.map((s, i) => (
            <Reveal
              key={s.id}
              delay={i * 60}
              className={`photo-slot ${styles.item} ${s.span === 'tall' ? styles.tall : ''} ${s.span === 'wide' ? styles.wide : ''}`}
            >
              La tua foto
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
