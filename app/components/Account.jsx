'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { X, User, Mail, Lock, LogOut, Calendar, Plus, Trash2, CheckCircle2, XCircle, ChevronLeft, ChevronRight, CalendarDays, Pencil, Package, ShoppingBag, Truck, Clock } from 'lucide-react';
import { services, team } from '../lib/data';
import {
  signIn, signUp, signOut, signInWithProvider, requestPasswordReset,
  onAuthChange, userToAuthShape, getMyBookings, updateBooking, getBookingsForDate,
  getMyOrders, consumeOAuthError,
} from '../lib/store';

import styles from './Account.module.css';

const MONTHS = ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'];
const DAYS = ['Dom','Lun','Mar','Mer','Gio','Ven','Sab'];
const ADMIN_EMAIL = 'isaias0aprile49.ia@gmail.com';
const isSameDay = (a, b) => a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const priceNum = (str) => parseFloat(String(str).replace(/[^\d,.]/g, '').replace(',', '.')) || 0;
const formatPrice = (n) => `${Number(n).toFixed(2).replace('.', ',')}€`;

// Orari disponibili per la riprogrammazione (09:00 – 19:30)
const TIME_SLOTS = (() => {
  const out = [];
  for (let h = 9; h < 20; h++) out.push(`${String(h).padStart(2, '0')}:00`, `${String(h).padStart(2, '0')}:30`);
  return out;
})();
const BARBER_OPTIONS = [...team.map((m) => m.name), 'Qualsiasi disponibile'];

// Tracking ordini: 3 stati
const ORDER_STEPS = ['Ricevuto', 'Spedito', 'Consegnato'];
const orderStepIndex = (status) => {
  const s = String(status || '').toLowerCase();
  if (s.includes('consegn')) return 2;
  if (s.includes('sped')) return 1;
  return 0;
};
const toDateInput = (iso) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function Account() {
  const [open, setOpen] = useState(false);
  const [auth, setAuthState] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);
  const [extrasFor, setExtrasFor] = useState(null);
  const [tab, setTab] = useState('list');
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [editFor, setEditFor] = useState(null);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editBarber, setEditBarber] = useState('');
  const [editBusy, setEditBusy] = useState(false);
  const [welcome, setWelcome] = useState(null);
  const hadUserRef = useRef(false);
  const [calDate, setCalDate] = useState(() => { const t = new Date(); t.setHours(0,0,0,0); return t; });
  const [dayBookings, setDayBookings] = useState([]);
  const [dayLoading, setDayLoading] = useState(false);
  const today = useMemo(() => { const t = new Date(); t.setHours(0,0,0,0); return t; }, []);

  // Subscribe to auth changes (Supabase)
  useEffect(() => {
    const unsubscribe = onAuthChange((user, event) => {
      setAuthState(userToAuthShape(user));
      // Mostra l'animazione di benvenuto solo al login reale,
      // non al ripristino della sessione né al refocus della scheda.
      const isRealLogin = event === 'SIGNED_IN' && user && !hadUserRef.current;
      hadUserRef.current = !!user;
      if (isRealLogin) {
        const nm = user.user_metadata?.name || user.email?.split('@')[0] || 'Benvenuto';
        setWelcome(nm);
      }
    });
    return unsubscribe;
  }, []);

  // Auto-chiusura dell'animazione di benvenuto
  useEffect(() => {
    if (welcome === null) return;
    const t = setTimeout(() => setWelcome(null), 2800);
    return () => clearTimeout(t);
  }, [welcome]);

  // Se torniamo dal provider OAuth con un errore nell'URL, mostralo nel modal.
  useEffect(() => {
    const oauthErr = consumeOAuthError();
    if (oauthErr) {
      setError(oauthErr);
      setOpen(true);
    }
  }, []);

  // Refresh bookings whenever the user changes
  useEffect(() => {
    if (!auth) { setBookings([]); return; }
    let active = true;
    getMyBookings().then((list) => { if (active) setBookings(list); });
    return () => { active = false; };
  }, [auth]);

  // Load orders when the Ordini tab is open
  useEffect(() => {
    if (!auth || tab !== 'orders') return;
    let active = true;
    setOrdersLoading(true);
    getMyOrders().then((list) => {
      if (active) { setOrders(list); setOrdersLoading(false); }
    });
    return () => { active = false; };
  }, [auth, tab]);

  // Load day bookings for admin calendar view
  useEffect(() => {
    if (!auth || auth.email !== ADMIN_EMAIL || tab !== 'calendar') return;
    let active = true;
    setDayLoading(true);
    getBookingsForDate(calDate).then((list) => {
      if (active) { setDayBookings(list); setDayLoading(false); }
    });
    return () => { active = false; };
  }, [auth, tab, calDate]);

  // Click triggers
  useEffect(() => {
    const onClick = (e) => {
      const a = e.target.closest('a[href="#cuenta"], button[data-account-trigger]');
      if (a) { e.preventDefault(); setOpen(true); }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const userBookings = useMemo(() => bookings, [bookings]);

  const refreshBookings = async () => setBookings(await getMyBookings());

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setInfo(''); setBusy(true);
    const { error } = await signIn(email, password);
    setBusy(false);
    if (error) { setError(error.message || 'Errore di accesso'); return; }
    setEmail(''); setPassword('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(''); setInfo(''); setBusy(true);
    if (name.trim().length < 2) { setError('Nome troppo corto'); setBusy(false); return; }
    const { error } = await signUp(email, password, name.trim());
    setBusy(false);
    if (error) { setError(error.message || 'Errore registrazione'); return; }
    setInfo('Registrazione riuscita! Controlla la tua email per confermare l\'account.');
    setName(''); setEmail(''); setPassword('');
    setMode('login');
  };

  const handleLogout = async () => {
    await signOut();
    setMode('login');
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setError(''); setInfo(''); setBusy(true);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Email non valida'); setBusy(false); return; }
    const { error } = await requestPasswordReset(email);
    setBusy(false);
    if (error) { setError(error.message || 'Errore nell\'invio'); return; }
    setInfo('Ti abbiamo inviato un\'email con il link per reimpostare la password. Controlla la posta (anche lo spam).');
  };

  const handleOAuth = async (provider) => {
    setError(''); setBusy(true);
    const { error } = await signInWithProvider(provider);
    if (error) { setBusy(false); setError(error.message || 'Errore con ' + provider); }
    // se va a buon fine, Supabase reindirizza al provider e poi torna al sito
  };

  const cancelBooking = async (id) => {
    await updateBooking(id, { status: 'cancellata' });
    refreshBookings();
  };

  const startEdit = (b) => {
    setExtrasFor(null);
    setEditDate(toDateInput(b.dateISO));
    setEditTime(b.time);
    setEditBarber(b.barber);
    setEditFor(b.id);
  };
  const saveEdit = async (b) => {
    if (!editDate || !editTime) return;
    setEditBusy(true);
    const dt = new Date(`${editDate}T${editTime}:00`);
    await updateBooking(b.id, { dateISO: dt.toISOString(), barber: editBarber });
    setEditBusy(false);
    setEditFor(null);
    refreshBookings();
  };
  const removeExtra = async (booking, extraIdx) => {
    const next = booking.extras.filter((_, i) => i !== extraIdx);
    await updateBooking(booking.id, { extras: next });
    refreshBookings();
  };
  const addExtra = async (booking, service) => {
    const next = [...(booking.extras || []), { id: service.id, name: service.name, price: service.price }];
    await updateBooking(booking.id, { extras: next });
    setExtrasFor(null);
    refreshBookings();
  };

  const totalPrice = (b) => {
    const base = priceNum(b.price);
    const extras = (b.extras || []).reduce((sum, e) => sum + priceNum(e.price), 0);
    return formatPrice(base + extras);
  };

  const welcomeOverlay = welcome !== null && (
    <div className={styles.welcome} role="status" aria-live="polite" onClick={() => setWelcome(null)}>
      <div className={styles.welcomeInner}>
        <div className={styles.welcomeMark} aria-hidden="true">
          <CheckCircle2 size={42} />
        </div>
        <p className={styles.welcomeHello}>Benvenuti</p>
        <p className={styles.welcomeName}>{welcome}</p>
      </div>
    </div>
  );

  if (!open) return welcomeOverlay || null;

  return (
    <>
      {welcomeOverlay}
      <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="account-title" onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
        <div className={styles.dialog}>
        <header className={styles.header}>
          <div>
            <p className={styles.label}>{auth ? 'Il mio account' : 'Accesso'}</p>
            <h2 id="account-title" className={styles.title}>
              {auth ? `Ciao, ${auth.name}` : mode === 'login' ? 'Accedi' : mode === 'register' ? 'Registrati' : 'Recupera Password'}
            </h2>
          </div>
          <button type="button" className={styles.closeBtn} onClick={() => setOpen(false)} aria-label="Chiudi">
            <X size={22} />
          </button>
        </header>

        <div className={styles.body}>
          {!auth && (
            <>
              <div className={styles.oauthGroup}>
                <button type="button" className={styles.oauthBtn} onClick={() => handleOAuth('google')} disabled={busy}>
                  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                    <path fill="#4285F4" d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"/>
                    <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
                    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
                  </svg>
                  Continua con Google
                </button>
              </div>
              <div className={styles.oauthDivider}><span>oppure</span></div>
              <form
                className={styles.authForm}
                onSubmit={mode === 'login' ? handleLogin : mode === 'register' ? handleRegister : handleForgot}
              >
                {mode === 'register' && (
                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>Nome</span>
                    <span className={styles.inputWrap}>
                      <User size={15} className={styles.inputIcon} />
                      <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Il tuo nome" autoComplete="name" required />
                    </span>
                  </label>
                )}
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Email</span>
                  <span className={styles.inputWrap}>
                    <Mail size={15} className={styles.inputIcon} />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.it" autoComplete="email" required />
                  </span>
                </label>
                {mode !== 'forgot' && (
                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>Password</span>
                    <span className={styles.inputWrap}>
                      <Lock size={15} className={styles.inputIcon} />
                      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimo 6 caratteri" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required minLength={6} />
                    </span>
                  </label>
                )}

                {mode === 'login' && (
                  <button
                    type="button"
                    className={styles.forgotLink}
                    onClick={() => { setMode('forgot'); setError(''); setInfo(''); setPassword(''); }}
                  >
                    Password dimenticata?
                  </button>
                )}

                {error && <p className={styles.error}>{error}</p>}
                {info && <p className={styles.info}>{info}</p>}

                <button type="submit" className="btn btn-gold" style={{ width: '100%' }} disabled={busy}>
                  {busy ? 'Attendere…' : mode === 'login' ? 'Entra' : mode === 'register' ? 'Crea account' : 'Invia link di recupero'}
                </button>

                <p className={styles.switchMode}>
                  {mode === 'forgot' ? (
                    <>Ti ricordi la password?{' '}
                      <button type="button" className={styles.linkBtn} onClick={() => { setMode('login'); setError(''); setInfo(''); }}>
                        Torna all&apos;accesso
                      </button>
                    </>
                  ) : (
                    <>{mode === 'login' ? 'Non hai ancora un account?' : 'Hai già un account?'}{' '}
                      <button type="button" className={styles.linkBtn} onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setInfo(''); }}>
                        {mode === 'login' ? 'Registrati' : 'Accedi'}
                      </button>
                    </>
                  )}
                </p>
              </form>
            </>
          )}

          {auth && (
            <div className={styles.dashboard}>
              <div className={styles.userBar}>
                <div>
                  <p className={styles.userEmail}>{auth.email}</p>
                  <p className={styles.userMeta}>
                    {userBookings.filter((b) => b.status !== 'cancellata').length} appuntamenti attivi
                  </p>
                </div>
                <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
                  <LogOut size={15} /> Esci
                </button>
              </div>

              {/* Tab switcher */}
              <div className={styles.tabs}>
                <button
                  type="button"
                  className={`${styles.tabBtn} ${tab === 'list' ? styles.tabActive : ''}`}
                  onClick={() => setTab('list')}
                >
                  <Calendar size={14} aria-hidden="true" />
                  Appuntamenti
                </button>
                <button
                  type="button"
                  className={`${styles.tabBtn} ${tab === 'orders' ? styles.tabActive : ''}`}
                  onClick={() => setTab('orders')}
                >
                  <Package size={14} aria-hidden="true" />
                  I Miei Ordini
                </button>
                {auth.email === ADMIN_EMAIL && (
                  <button
                    type="button"
                    className={`${styles.tabBtn} ${tab === 'calendar' ? styles.tabActive : ''}`}
                    onClick={() => setTab('calendar')}
                  >
                    <CalendarDays size={14} aria-hidden="true" />
                    Calendario
                  </button>
                )}
              </div>

              {/* ── LISTA APPUNTAMENTI ── */}
              {tab === 'list' && (
                <>
                  <div className={styles.sectionHead}>
                    <h3 className={styles.sectionTitle}>I Miei Appuntamenti</h3>
                    <a href="#reservar" className="btn btn-gold" style={{ fontSize: '0.75rem', padding: '0.55rem 1.1rem' }} onClick={() => setOpen(false)}>
                      Nuovo appuntamento
                    </a>
                  </div>

                  {userBookings.length === 0 && (
                    <div className={styles.empty}>
                      <Calendar size={32} aria-hidden="true" />
                      <p>Non hai ancora appuntamenti prenotati.</p>
                      <a href="#reservar" className="btn btn-outline" onClick={() => setOpen(false)}>Prenota il primo appuntamento</a>
                    </div>
                  )}

                  <ul className={styles.bookingsList}>
                    {userBookings.map((b) => {
                      const cancelled = b.status === 'cancellata';
                      return (
                        <li key={b.id} className={`${styles.bookingCard} ${cancelled ? styles.bookingCancelled : ''}`}>
                          <div className={styles.bookingTop}>
                            <div>
                              <p className={styles.bookingService}>{b.serviceName}</p>
                              <p className={styles.bookingMeta}>
                                {b.date} · {b.time} · {b.barber}
                              </p>
                            </div>
                            <div className={styles.bookingPriceCol}>
                              <span className={styles.bookingPrice}>{totalPrice(b)}</span>
                              <span className={cancelled ? styles.statusBadCancelled : styles.statusBadActive}>
                                {cancelled ? <><XCircle size={12} /> Cancellato</> : <><CheckCircle2 size={12} /> Attivo</>}
                              </span>
                            </div>
                          </div>

                          {b.extras && b.extras.length > 0 && (
                            <ul className={styles.extrasList}>
                              {b.extras.map((ex, i) => (
                                <li key={i} className={styles.extraRow}>
                                  <span>+ {ex.name}</span>
                                  <span className={styles.extraRight}>
                                    <span className={styles.extraPrice}>{ex.price}</span>
                                    {!cancelled && (
                                      <button type="button" className={styles.iconBtn} onClick={() => removeExtra(b, i)} aria-label={`Rimuovi ${ex.name}`}>
                                        <Trash2 size={12} />
                                      </button>
                                    )}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}

                          {!cancelled && extrasFor === b.id && (
                            <div className={styles.extrasPicker}>
                              <p className={styles.pickerLabel}>Aggiungi un servizio extra:</p>
                              <div className={styles.pickerGrid}>
                                {services
                                  .filter((s) => s.id !== b.serviceId && !(b.extras || []).some((e) => e.id === s.id))
                                  .map((s) => (
                                    <button key={s.id} type="button" className={styles.pickerItem} onClick={() => addExtra(b, s)}>
                                      <span>{s.name}</span>
                                      <span className={styles.pickerPrice}>{s.price}</span>
                                    </button>
                                  ))}
                              </div>
                              <button type="button" className={styles.linkBtn} onClick={() => setExtrasFor(null)}>Annulla</button>
                            </div>
                          )}

                          {!cancelled && editFor === b.id && (
                            <div className={styles.editForm}>
                              <p className={styles.pickerLabel}>Modifica appuntamento:</p>
                              <div className={styles.editGrid}>
                                <label className={styles.editField}>
                                  <span>Data</span>
                                  <input type="date" value={editDate} min={toDateInput(today)} onChange={(e) => setEditDate(e.target.value)} />
                                </label>
                                <label className={styles.editField}>
                                  <span>Ora</span>
                                  <select value={editTime} onChange={(e) => setEditTime(e.target.value)}>
                                    {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
                                  </select>
                                </label>
                                <label className={styles.editField}>
                                  <span>Barbiere</span>
                                  <select value={editBarber} onChange={(e) => setEditBarber(e.target.value)}>
                                    {BARBER_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
                                  </select>
                                </label>
                              </div>
                              <div className={styles.editActions}>
                                <button type="button" className="btn btn-gold" style={{ fontSize: '0.75rem', padding: '0.55rem 1.2rem' }} onClick={() => saveEdit(b)} disabled={editBusy}>
                                  {editBusy ? 'Salvataggio…' : 'Salva modifiche'}
                                </button>
                                <button type="button" className={styles.linkBtn} onClick={() => setEditFor(null)}>Annulla</button>
                              </div>
                            </div>
                          )}

                          {!cancelled && (
                            <div className={styles.bookingActions}>
                              <button type="button" className={styles.actionBtn} onClick={() => (editFor === b.id ? setEditFor(null) : startEdit(b))}>
                                <Pencil size={14} /> Modifica
                              </button>
                              <button type="button" className={styles.actionBtn} onClick={() => setExtrasFor(extrasFor === b.id ? null : b.id)}>
                                <Plus size={14} /> Aggiungi servizio
                              </button>
                              <button type="button" className={`${styles.actionBtn} ${styles.actionDanger}`} onClick={() => { if (confirm('Annullare questo appuntamento?')) cancelBooking(b.id); }}>
                                <XCircle size={14} /> Annulla
                              </button>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}

              {/* ── I MIEI ORDINI (tracking) ── */}
              {tab === 'orders' && (
                <>
                  <div className={styles.sectionHead}>
                    <h3 className={styles.sectionTitle}>I Miei Ordini</h3>
                    <a href="#shop" className="btn btn-gold" style={{ fontSize: '0.75rem', padding: '0.55rem 1.1rem' }} onClick={() => setOpen(false)}>
                      Vai al negozio
                    </a>
                  </div>

                  {ordersLoading ? (
                    <p className={styles.dayLoading}>Caricamento…</p>
                  ) : orders.length === 0 ? (
                    <div className={styles.empty}>
                      <ShoppingBag size={32} aria-hidden="true" />
                      <p>Non hai ancora effettuato ordini.</p>
                      <a href="#shop" className="btn btn-outline" onClick={() => setOpen(false)}>Scopri i prodotti</a>
                    </div>
                  ) : (
                    <ul className={styles.ordersList}>
                      {orders.map((o) => {
                        const step = orderStepIndex(o.status);
                        const created = o.created_at ? new Date(o.created_at) : null;
                        return (
                          <li key={o.id} className={styles.orderCard}>
                            <div className={styles.orderTop}>
                              <div>
                                <p className={styles.orderRef}>Ordine {o.reference}</p>
                                {created && (
                                  <p className={styles.orderDate}>
                                    {created.getDate()} {MONTHS[created.getMonth()]} {created.getFullYear()}
                                  </p>
                                )}
                              </div>
                              <span className={styles.orderTotal}>{formatPrice(o.total)}</span>
                            </div>

                            <ul className={styles.orderItems}>
                              {(o.items || []).map((it, i) => (
                                <li key={i} className={styles.orderItem}>
                                  <span>{it.name} × {it.qty}</span>
                                  <span className={styles.orderItemPrice}>{formatPrice(it.lineTotal ?? (it.price * it.qty))}</span>
                                </li>
                              ))}
                            </ul>

                            {/* Tracker */}
                            <div className={styles.tracker}>
                              {ORDER_STEPS.map((label, i) => (
                                <div key={label} className={`${styles.trackStep} ${i <= step ? styles.trackDone : ''}`}>
                                  <span className={styles.trackDot}>
                                    {i === 0 ? <Package size={13} /> : i === 1 ? <Truck size={13} /> : <CheckCircle2 size={13} />}
                                  </span>
                                  <span className={styles.trackLabel}>{label}</span>
                                  {i < ORDER_STEPS.length - 1 && <span className={`${styles.trackLine} ${i < step ? styles.trackLineDone : ''}`} aria-hidden="true" />}
                                </div>
                              ))}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </>
              )}

              {/* ── CALENDARIO GIORNALIERO (solo admin) ── */}
              {tab === 'calendar' && auth.email === ADMIN_EMAIL && (
                <div>
                  {/* Navigazione giorno */}
                  <div className={styles.dayNav}>
                    <button type="button" className={styles.dayNavBtn} onClick={() => setCalDate((d) => { const n = new Date(d); n.setDate(n.getDate() - 1); return n; })} aria-label="Giorno precedente">
                      <ChevronLeft size={17} />
                    </button>
                    <span className={styles.dayTitle}>
                      {DAYS[calDate.getDay()]} {calDate.getDate()} {MONTHS[calDate.getMonth()]} {calDate.getFullYear()}
                    </span>
                    <button type="button" className={styles.dayNavBtn} onClick={() => setCalDate((d) => { const n = new Date(d); n.setDate(n.getDate() + 1); return n; })} aria-label="Giorno successivo">
                      <ChevronRight size={17} />
                    </button>
                    {!isSameDay(calDate, today) && (
                      <button type="button" className={styles.todayBtn} onClick={() => setCalDate(new Date(today))}>Oggi</button>
                    )}
                  </div>

                  {dayLoading ? (
                    <p className={styles.dayLoading}>Caricamento…</p>
                  ) : (
                    <div className={styles.barberSections}>
                      {team.map((member) => {
                        const memberBookings = dayBookings
                          .filter((b) => b.barber === member.name)
                          .sort((a, b) => a.time.localeCompare(b.time));
                        const activeCount = memberBookings.filter((b) => b.status !== 'cancellata').length;
                        return (
                          <div key={member.id} className={styles.calSection}>
                            <div className={styles.calSectionHead}>
                              <div>
                                <span className={styles.calBarberName}>{member.name}</span>
                                <span className={styles.calBarberRole}>{member.role}</span>
                              </div>
                              <span className={`${styles.calCount} ${activeCount === 0 ? styles.calCountZero : ''}`}>
                                {activeCount} app.
                              </span>
                            </div>

                            {memberBookings.length === 0 ? (
                              <p className={styles.calEmpty}>Nessun appuntamento</p>
                            ) : (
                              <ul className={styles.calList}>
                                {memberBookings.map((b) => (
                                  <li key={b.id} className={`${styles.calCard} ${b.status === 'cancellata' ? styles.calCancelled : ''}`}>
                                    <span className={styles.calTime}>{b.time}</span>
                                    <div className={styles.calInfo}>
                                      <span className={styles.calService}>{b.serviceName}</span>
                                      <span className={styles.calClient}>{b.clientName}{b.clientPhone ? ` · ${b.clientPhone}` : ''}</span>
                                    </div>
                                    <span className={styles.calPrice}>{b.price}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        );
                      })}

                      {/* Appuntamenti non assegnati a un barbiere specifico */}
                      {(() => {
                        const names = team.map((m) => m.name);
                        const unassigned = dayBookings.filter((b) => !names.includes(b.barber));
                        if (unassigned.length === 0) return null;
                        return (
                          <div className={styles.calSection}>
                            <div className={styles.calSectionHead}>
                              <div>
                                <span className={styles.calBarberName}>Non assegnati</span>
                                <span className={styles.calBarberRole}>Qualsiasi disponibile</span>
                              </div>
                              <span className={styles.calCount}>{unassigned.filter((b) => b.status !== 'cancellata').length} app.</span>
                            </div>
                            <ul className={styles.calList}>
                              {unassigned.map((b) => (
                                <li key={b.id} className={`${styles.calCard} ${b.status === 'cancellata' ? styles.calCancelled : ''}`}>
                                  <span className={styles.calTime}>{b.time}</span>
                                  <div className={styles.calInfo}>
                                    <span className={styles.calService}>{b.serviceName}</span>
                                    <span className={styles.calClient}>{b.clientName}{b.clientPhone ? ` · ${b.clientPhone}` : ''}</span>
                                  </div>
                                  <span className={styles.calPrice}>{b.price}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        </div>
      </div>
    </>
  );
}
