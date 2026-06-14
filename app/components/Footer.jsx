import Image from 'next/image';
import { Instagram, Facebook, MessageCircle, Phone, Mail, MapPin } from 'lucide-react';
import { contact } from '../lib/data';
import styles from './Footer.module.css';

const links = [
  { href: '/', label: 'Home' },
  { href: '/servizi', label: 'Servizi' },
  { href: '/#equipo', label: 'Barbieri' },
  { href: '/prodotti', label: 'Prodotti' },
  { href: '/#galleria', label: 'Galleria' },
  { href: '/contatti', label: 'Contatti' },
];

const info = [
  'Chi siamo',
  'Informativa sulla privacy',
  'Termini e condizioni',
  'Domande frequenti',
];

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer id="contacto" className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <Image
            src="/logo-white.png"
            alt="Franco Barber Studio"
            width={600}
            height={400}
            className={styles.logo}
          />
          <p className={styles.tagline}>
            Il tuo stile, la nostra passione.<br />
            Qualità, precisione e fiducia in ogni taglio.
          </p>
          <div className={styles.social}>
            <a href={contact.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className={styles.socialLink}>
              <Instagram size={18} />
            </a>
            <a href="#" aria-label="Facebook" className={styles.socialLink}>
              <Facebook size={18} />
            </a>
            <a href="#" aria-label="WhatsApp" className={styles.socialLink}>
              <MessageCircle size={18} />
            </a>
          </div>
        </div>

        <div className={styles.col}>
          <h4 className={styles.colTitle}>Collegamenti</h4>
          <ul className={styles.list}>
            {links.map((l) => (
              <li key={l.href}><a href={l.href} className={styles.colLink}>{l.label}</a></li>
            ))}
          </ul>
        </div>

        <div className={styles.col}>
          <h4 className={styles.colTitle}>Informazioni</h4>
          <ul className={styles.list}>
            {info.map((t) => (
              <li key={t}><a href="#" className={styles.colLink}>{t}</a></li>
            ))}
          </ul>
        </div>

        <div className={styles.col}>
          <h4 className={styles.colTitle}>Contatti</h4>
          <ul className={styles.contactList}>
            <li className={styles.contactRow}>
              <MapPin size={15} aria-hidden="true" /> {contact.address}
            </li>
            <li>
              <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className={styles.contactRow}>
                <Phone size={15} aria-hidden="true" /> {contact.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${contact.email}`} className={styles.contactRow}>
                <Mail size={15} aria-hidden="true" /> {contact.email}
              </a>
            </li>
            {contact.hours.slice(0, 1).map(({ day, time }) => (
              <li key={day} className={styles.contactRow}>
                <span>{day.replace('Lunedì – Venerdì', 'Lun – Ven')}: {time}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={`container ${styles.bottom}`}>
        <p>© {year} Franco Barber Studio. Tutti i diritti riservati.</p>
      </div>
    </footer>
  );
}
