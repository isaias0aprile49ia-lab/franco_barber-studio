import Image from 'next/image';
import Reveal from './Reveal';
import styles from './Gallery.module.css';

const SLOTS = [
  { id: 1, src: '/gallery/lavoro-1.jpg', alt: 'Taglio fade con ciuffo', span: 'tall' },
  { id: 2, src: '/gallery/lavoro-2.jpg', alt: 'Taglio capelli grigio platino', span: '' },
  { id: 3, src: '/gallery/lavoro-3.jpg', alt: 'Taglio capelli con barba sfumata', span: '' },
  { id: 4, src: '/gallery/lavoro-4.jpg', alt: 'Master class barbieri', span: '' },
  { id: 5, src: '/gallery/lavoro-5.jpg', alt: 'Lavoro di taglio professionale', span: 'wide' },
  { id: 6, src: '/gallery/lavoro-6.jpg', alt: 'Taglio sfumato con disegno', span: '' },
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
              className={`${styles.item} ${s.span === 'tall' ? styles.tall : ''} ${s.span === 'wide' ? styles.wide : ''}`}
            >
              <Image
                src={s.src}
                alt={s.alt}
                fill
                sizes="(max-width: 480px) 50vw, (max-width: 820px) 50vw, 25vw"
                className={styles.image}
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
