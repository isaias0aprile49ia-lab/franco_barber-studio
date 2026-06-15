import Reveal from './Reveal';
import styles from './Gallery.module.css';

const PHOTOS = [
  { id: 1, src: '/gallery/lavoro-1.jpg', alt: 'Taglio fade con ciuffo grigio' },
  { id: 2, src: '/gallery/lavoro-2.jpg', alt: 'Taglio capelli grigio platino' },
  { id: 3, src: '/gallery/lavoro-3.jpg', alt: 'Taglio capelli con barba sfumata' },
  { id: 4, src: '/gallery/lavoro-4.jpg', alt: 'Master class barbieri' },
  { id: 5, src: '/gallery/lavoro-5.jpg', alt: 'Lavoro di taglio professionale' },
  { id: 6, src: '/gallery/lavoro-6.jpg', alt: 'Taglio sfumato in azione' },
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

        <div className={styles.masonry}>
          {PHOTOS.map((p, i) => (
            <Reveal
              key={p.id}
              delay={i * 120}
              className={styles.item}
            >
              <img
                src={p.src}
                alt={p.alt}
                loading="lazy"
                className={styles.image}
              />
              <span className={styles.overlay} aria-hidden="true" />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
