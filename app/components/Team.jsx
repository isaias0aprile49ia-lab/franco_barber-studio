import Image from 'next/image';
import { team } from '../lib/data';
import Reveal from './Reveal';
import styles from './Team.module.css';

export default function Team() {
  return (
    <section id="equipo" className={`section ${styles.team}`} aria-labelledby="team-title">
      <div className="container">
        <Reveal>
          <p className="section-label">Chi siamo</p>
          <h2 id="team-title" className="section-title">I Nostri Barbieri</h2>
          <div className="divider" />
        </Reveal>

        <div className={styles.grid}>
          {team.map((member, i) => (
            <Reveal key={member.id} as="article" className={styles.card} delay={i * 120}>
              <div className={styles.imageWrap}>
                <Image
                  src={member.image}
                  alt={`Foto di ${member.name}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className={styles.image}
                />
                <div className={styles.imageOverlay} aria-hidden="true" />
              </div>
              <div className={styles.info}>
                <div>
                  <h3 className={styles.name}>{member.name}</h3>
                  <p className={styles.role}>{member.role}</p>
                </div>
                <p className={styles.bio}>{member.bio}</p>
                <ul className={styles.specialties}>
                  {member.specialties.map((s) => (
                    <li key={s} className={styles.specialty}>{s}</li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
