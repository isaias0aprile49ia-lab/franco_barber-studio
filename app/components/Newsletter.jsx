'use client';
import { useState } from 'react';
import { Mail, Send, CheckCircle2 } from 'lucide-react';
import { subscribeNewsletter } from '../lib/store';
import Reveal from './Reveal';
import styles from './Newsletter.module.css';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setBusy(true);
    const { error } = await subscribeNewsletter(email);
    setBusy(false);
    if (error) { setError(error.message || 'Qualcosa è andato storto. Riprova.'); return; }
    setDone(true);
    setEmail('');
  };

  return (
    <section id="newsletter" className={styles.wrap} aria-labelledby="newsletter-title">
      <div className="container">
        <Reveal className={styles.card}>
          <div className={styles.icon} aria-hidden="true">
            <Mail size={26} />
          </div>
          <p className="section-label">Resta aggiornato</p>
          <h2 id="newsletter-title" className={styles.title}>Iscriviti alla newsletter</h2>
          <p className={styles.sub}>
            Offerte esclusive, novità e consigli di stile, direttamente nella tua email.
          </p>

          {done ? (
            <p className={styles.success}>
              <CheckCircle2 size={18} aria-hidden="true" />
              Grazie per l&apos;iscrizione!
            </p>
          ) : (
            <form className={styles.form} onSubmit={handleSubmit}>
              <span className={styles.inputWrap}>
                <Mail size={16} className={styles.inputIcon} aria-hidden="true" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="La tua email"
                  aria-label="La tua email"
                  autoComplete="email"
                  required
                />
              </span>
              <button type="submit" className={`btn btn-gold ${styles.btn}`} disabled={busy}>
                {busy ? 'Attendere…' : <>Iscriviti <Send size={16} aria-hidden="true" /></>}
              </button>
            </form>
          )}

          {error && <p className={styles.error}>{error}</p>}
          {!done && (
            <p className={styles.privacy}>
              Niente spam. Puoi annullare l&apos;iscrizione in qualsiasi momento.
            </p>
          )}
        </Reveal>
      </div>
    </section>
  );
}
