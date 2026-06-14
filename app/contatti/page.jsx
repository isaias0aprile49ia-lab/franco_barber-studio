import Link from 'next/link';
import { ArrowLeft, MapPin, Phone, Mail, Clock, Instagram } from 'lucide-react';
import { contact } from '../lib/data';
import Reveal from '../components/Reveal';
import styles from './contatti.module.css';

export const metadata = {
  title: 'Contatti',
  description: 'Dove siamo, orari e come contattare Franco Barber Studio a Milano.',
};

const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(contact.address)}&output=embed`;
const cleanPhone = contact.phone.replace(/\s/g, '');

export default function ContattiPage() {
  return (
    <section className={styles.page} aria-labelledby="contatti-title">
      <div className="container">
        <Reveal>
          <Link href="/" className={styles.back}>
            <ArrowLeft size={16} aria-hidden="true" /> Torna alla home
          </Link>
          <p className="section-label">Contatti</p>
          <h1 id="contatti-title" className="section-title">Mettiti in contatto</h1>
          <div className="divider" />
          <p className={styles.intro}>
            Passa a trovarci o scrivici: siamo a tua disposizione per qualsiasi informazione.
          </p>
        </Reveal>

        <div className={styles.grid}>
          <Reveal as="a" href={`https://www.google.com/maps?q=${encodeURIComponent(contact.address)}`} target="_blank" rel="noopener noreferrer" className={styles.card} delay={0}>
            <span className={styles.icon}><MapPin size={22} /></span>
            <span className={styles.label}>Indirizzo</span>
            <span className={styles.value}>{contact.address}</span>
          </Reveal>

          <Reveal as="a" href={`tel:${cleanPhone}`} className={styles.card} delay={70}>
            <span className={styles.icon}><Phone size={22} /></span>
            <span className={styles.label}>Telefono</span>
            <span className={styles.value}>{contact.phone}</span>
          </Reveal>

          <Reveal as="a" href={`mailto:${contact.email}`} className={styles.card} delay={140}>
            <span className={styles.icon}><Mail size={22} /></span>
            <span className={styles.label}>Email</span>
            <span className={styles.value}>{contact.email}</span>
          </Reveal>

          <Reveal as="a" href={contact.instagram} target="_blank" rel="noopener noreferrer" className={styles.card} delay={210}>
            <span className={styles.icon}><Instagram size={22} /></span>
            <span className={styles.label}>Instagram</span>
            <span className={styles.value}>@francobarberstudio</span>
          </Reveal>
        </div>

        <Reveal className={styles.hours}>
          <div className={styles.hoursHead}>
            <Clock size={18} aria-hidden="true" />
            <h2 className={styles.hoursTitle}>Orari di apertura</h2>
          </div>
          <ul className={styles.hoursList}>
            {contact.hours.map(({ day, time }) => (
              <li key={day} className={styles.hourRow}>
                <span>{day}</span>
                <span className={styles.hourTime}>{time}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal className={styles.mapWrap}>
          <iframe
            title="Mappa Franco Barber Studio"
            src={mapSrc}
            className={styles.map}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </Reveal>
      </div>
    </section>
  );
}
