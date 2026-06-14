'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, UserCircle2, ShoppingBag } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { getCart, CART_EVENT } from '../lib/store';
import styles from './Navbar.module.css';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/servizi', label: 'Servizi' },
  { href: '/#equipo', label: 'Barbieri' },
  { href: '/prodotti', label: 'Prodotti' },
  { href: '/#galleria', label: 'Galleria' },
  { href: '/contatti', label: 'Contatti' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const update = () => setCartCount(getCart().reduce((s, i) => s + i.qty, 0));
    update();
    window.addEventListener(CART_EVENT, update);
    return () => window.removeEventListener(CART_EVENT, update);
  }, []);

  const close = () => setMenuOpen(false);

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`} aria-label="Navigazione principale">
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.logo} aria-label="Franco Barber Studio — Home" onClick={close}>
          <Image
            src="/logo-black.png"
            alt="Franco Barber Studio"
            width={600}
            height={400}
            className={`${styles.logoImg} ${styles.logoImgLight}`}
            priority
          />
          <Image
            src="/logo-white.png"
            alt="Franco Barber Studio"
            width={600}
            height={400}
            className={`${styles.logoImg} ${styles.logoImgDark}`}
            priority
          />
        </Link>

        <div
          className={`${styles.backdrop} ${menuOpen ? styles.backdropOpen : ''}`}
          onClick={close}
          aria-hidden="true"
        />

        <ul className={`${styles.links} ${menuOpen ? styles.open : ''}`}>
          <li className={styles.closeRow}>
            <button
              type="button"
              className={styles.closeBtn}
              onClick={close}
              aria-label="Chiudi menu"
            >
              <X size={22} />
            </button>
          </li>
          {navLinks.map(({ href, label }) => (
            <li key={href}>
              <Link href={href} className={styles.link} onClick={close}>{label}</Link>
            </li>
          ))}
        </ul>

        <div className={styles.right}>
          <ThemeToggle />
          <a href="#cuenta" className={styles.iconLink} onClick={close} aria-label="Il mio account">
            <UserCircle2 size={21} />
          </a>
          <a href="#carrito" className={styles.iconLink} onClick={close} aria-label={`Carrello (${cartCount})`}>
            <ShoppingBag size={19} />
            {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
          </a>
          <a href="#reservar" className={`btn btn-gold ${styles.bookBtn}`} onClick={close}>
            Prenota Cita
          </a>
          <button
            className={styles.menuBtn}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Chiudi menu' : 'Apri menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
