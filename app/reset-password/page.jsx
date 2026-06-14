'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { updatePassword } from '../lib/store';
import styles from './page.module.css';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [recoveryReady, setRecoveryReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Supabase emette un evento PASSWORD_RECOVERY quando l'utente arriva qui dal link
    const { data: { subscription } } = supabase().auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setRecoveryReady(true);
    });

    // Se la sessione è già impostata (es. refresh), abilita il form
    supabase().auth.getSession().then(({ data }) => {
      if (data?.session) setRecoveryReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Password troppo corta (minimo 6 caratteri)'); return; }
    if (password !== confirm) { setError('Le password non corrispondono'); return; }
    setBusy(true);
    const { error } = await updatePassword(password);
    setBusy(false);
    if (error) { setError(error.message || 'Errore nel cambio password'); return; }
    setDone(true);
    setTimeout(() => router.push('/'), 2500);
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        {!done && (
          <>
            <p className={styles.label}>Recupero password</p>
            <h1 className={styles.title}>Imposta una nuova password</h1>

            {!recoveryReady && (
              <p className={styles.hint}>
                Verifica del link in corso… Se questa pagina non si attiva, il link potrebbe essere scaduto.
                <br />
                <a href="/" className={styles.linkBtn}>Torna alla home</a>
              </p>
            )}

            {recoveryReady && (
              <form onSubmit={handleSubmit} className={styles.form}>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Nuova password</span>
                  <span className={styles.inputWrap}>
                    <Lock size={15} className={styles.inputIcon} />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimo 6 caratteri"
                      autoComplete="new-password"
                      required
                      minLength={6}
                      autoFocus
                    />
                  </span>
                </label>

                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Conferma password</span>
                  <span className={styles.inputWrap}>
                    <Lock size={15} className={styles.inputIcon} />
                    <input
                      type="password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Ripeti la nuova password"
                      autoComplete="new-password"
                      required
                      minLength={6}
                    />
                  </span>
                </label>

                {error && <p className={styles.error}>{error}</p>}

                <button type="submit" className="btn btn-gold" disabled={busy} style={{ width: '100%' }}>
                  {busy ? 'Salvataggio…' : 'Salva nuova password'}
                </button>
              </form>
            )}
          </>
        )}

        {done && (
          <div className={styles.successWrap}>
            <div className={styles.successIcon}><Check size={28} aria-hidden="true" /></div>
            <h2 className={styles.successTitle}>Password aggiornata!</h2>
            <p className={styles.hint}>Ti reindirizzo alla home in pochi secondi…</p>
          </div>
        )}
      </div>
    </div>
  );
}
