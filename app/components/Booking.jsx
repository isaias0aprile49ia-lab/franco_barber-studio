'use client';
import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Lock, Check, CreditCard, ChevronDown, ChevronLeft, ChevronRight, X, ArrowLeft, ArrowRight, MapPin, User, Phone, Mail, Users } from 'lucide-react';
import { contact } from '../lib/data';
import { getCurrentUser, createBooking, onAuthChange, userToAuthShape, getShopServices, getShopBarbers } from '../lib/store';

// Prezzo visualizzato: il SaaS salva price (numero) + eventuale price_label
const servicePriceLabel = (s) => (s ? (s.price_label || (s.price != null ? `${s.price}€` : '')) : '');
import styles from './Booking.module.css';

const MONTHS = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
const WEEKDAYS = ['L', 'M', 'M', 'G', 'V', 'S', 'D'];

const STEPS = [
  { id: 'service', label: 'Servizio' },
  { id: 'datetime', label: 'Data e ora' },
  { id: 'barber', label: 'Barbiere' },
  { id: 'data', label: 'I tuoi dati' },
];

function buildMonthGrid(year, month) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const offset = (first.getDay() + 6) % 7;
  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= last.getDate(); d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function buildSlots(date) {
  if (!date) return [];
  const day = date.getDate();
  const result = [];
  for (let h = 9; h < 20; h++) {
    for (let m = 0; m < 60; m += 30) {
      const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      const seed = (day * 7 + h * 3 + m) % 11;
      let available = seed > 2;
      if (h === 13) available = false;
      result.push({ time, available });
    }
  }
  return result;
}

const isSameDay = (a, b) => a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const startOfToday = () => { const t = new Date(); t.setHours(0, 0, 0, 0); return t; };

export default function Booking() {
  const today = useMemo(startOfToday, []);
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(today);
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [serviceId, setServiceId] = useState(null);
  const [barberId, setBarberId] = useState(''); // '' = Qualsiasi disponibile
  const [payment, setPayment] = useState('In Salone');
  const [confirmed, setConfirmed] = useState(false);
  const [time, setTime] = useState(null);
  const [step, setStep] = useState('service');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');

  const [currentUser, setCurrentUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Track auth state and prefill fields
  useEffect(() => {
    let mounted = true;
    getCurrentUser().then((u) => {
      if (!mounted) return;
      const a = userToAuthShape(u);
      setCurrentUser(a);
      if (a) {
        setClientName((n) => n || a.name || '');
        setClientEmail((e) => e || a.email || '');
      }
    });
    const unsub = onAuthChange((u) => {
      const a = userToAuthShape(u);
      setCurrentUser(a);
      if (a) {
        setClientName((n) => n || a.name || '');
        setClientEmail((e) => e || a.email || '');
      }
    });
    return () => { mounted = false; unsub(); };
  }, []);

  // Carica servizi e barbieri REALI dal SaaS (stessa base dati)
  useEffect(() => {
    let mounted = true;
    getShopServices().then((s) => {
      if (!mounted) return;
      setServices(s);
      setServiceId((cur) => cur || s[0]?.id || null);
    });
    getShopBarbers().then((b) => { if (mounted) setBarbers(b); });
    return () => { mounted = false; };
  }, []);

  // Open the booking modal on link clicks / hash
  useEffect(() => {
    const openBooking = () => {
      setOpen(true);
      if (window.location.hash === '#reservar') {
        history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    };

    const onClick = (e) => {
      const a = e.target.closest('a[href="#reservar"]');
      if (a) { e.preventDefault(); openBooking(); }
    };

    const onHash = () => {
      if (window.location.hash === '#reservar') openBooking();
    };

    // Apertura da una card servizio: preseleziona il servizio e va al primo step
    const onPrenotaServizio = (e) => {
      const id = e.detail?.serviceId;
      if (id && services.some((s) => s.id === id)) setServiceId(id);
      setStep('service');
      openBooking();
    };

    if (window.location.hash === '#reservar') openBooking();

    document.addEventListener('click', onClick);
    window.addEventListener('hashchange', onHash);
    window.addEventListener('franco:prenota-servizio', onPrenotaServizio);
    return () => {
      document.removeEventListener('click', onClick);
      window.removeEventListener('hashchange', onHash);
      window.removeEventListener('franco:prenota-servizio', onPrenotaServizio);
    };
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

  const cells = useMemo(() => buildMonthGrid(viewYear, viewMonth), [viewYear, viewMonth]);
  const slots = useMemo(() => buildSlots(selectedDate), [selectedDate]);
  const firstAvailable = slots.find((s) => s.available)?.time ?? null;
  const activeTime = slots.some((s) => s.available && s.time === time) ? time : firstAvailable;
  const service = services.find((s) => s.id === serviceId);
  const barber = barbers.find((b) => b.id === barberId);
  const barberLabel = barber ? barber.name : 'Qualsiasi disponibile';
  const stepIndex = STEPS.findIndex((s) => s.id === step);

  const prevMonth = () => {
    const d = new Date(viewYear, viewMonth - 1, 1);
    if (d.getFullYear() < today.getFullYear() || (d.getFullYear() === today.getFullYear() && d.getMonth() < today.getMonth())) return;
    setViewYear(d.getFullYear()); setViewMonth(d.getMonth());
  };
  const nextMonth = () => {
    const d = new Date(viewYear, viewMonth + 1, 1);
    setViewYear(d.getFullYear()); setViewMonth(d.getMonth());
  };
  const canGoPrev = !(viewYear === today.getFullYear() && viewMonth === today.getMonth());

  const selectDay = (date) => {
    if (!date || date < today) return;
    setSelectedDate(date);
    setTime(null);
  };

  const closeAll = () => {
    setOpen(false);
    setConfirmed(false);
    setStep('service');
    setClientName('');
    setClientPhone('');
    setClientEmail('');
  };

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail);
  const validPhone = clientPhone.replace(/\D/g, '').length >= 7;
  const validName = clientName.trim().length >= 2;
  const formValid = validName && validPhone && validEmail;

  const mapsSrc = `https://www.google.com/maps?q=${encodeURIComponent(contact.address)}&output=embed`;

  const submitBooking = async (e) => {
    e.preventDefault();
    if (!formValid || saving || !service) return;
    setSaveError(''); setSaving(true);
    const { error } = await createBooking({
      clientName, clientPhone, clientEmail,
      serviceId: service.id,
      serviceName: service.name,
      price: service.price,
      duration: service.duration_minutes,
      when: selectedDate,
      time: activeTime,
      barberId: barber ? barber.id : null,
      barberName: barber ? barber.name : null,
      payment,
    });
    setSaving(false);
    if (error) { setSaveError(error.message || 'Errore nel salvataggio'); return; }
    setConfirmed(true);
  };

  if (!open) return null;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="booking-title" onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
      <div className={styles.dialog}>
        <header className={styles.dialogHeader}>
          <div>
            <p className={styles.dialogLabel}>Prenotazione online</p>
            <h2 id="booking-title" className={styles.dialogTitle}>Prenota il tuo Appuntamento</h2>
          </div>
          <button type="button" className={styles.closeBtnX} onClick={() => setOpen(false)} aria-label="Chiudi">
            <X size={22} />
          </button>
        </header>

        {/* ── Indicatore di avanzamento ── */}
        <div className={styles.stepper}>
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              type="button"
              className={`${styles.stepItem} ${i === stepIndex ? styles.stepActive : ''} ${i < stepIndex ? styles.stepDone : ''}`}
              onClick={() => { if (i < stepIndex) setStep(s.id); }}
              disabled={i > stepIndex}
              aria-current={i === stepIndex ? 'step' : undefined}
            >
              <span className={styles.stepNum}>{i < stepIndex ? <Check size={14} /> : i + 1}</span>
              <span className={styles.stepLabel}>{s.label}</span>
            </button>
          ))}
        </div>

        {/* ── STEP 1: Servizio ── */}
        {step === 'service' && (
          <div className={styles.stepPanel}>
            <span className={styles.colLabel}>Scegli il servizio</span>
            <div className={styles.serviceList}>
              {services.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`${styles.serviceItem} ${serviceId === s.id ? styles.serviceActive : ''}`}
                  onClick={() => setServiceId(s.id)}
                >
                  <span className={styles.serviceName}>{s.name}</span>
                  <span className={styles.servicePrice}>{servicePriceLabel(s)}</span>
                </button>
              ))}
            </div>
            <div className={styles.stepNav}>
              <span />
              <button type="button" className={`btn btn-gold ${styles.nextBtn}`} onClick={() => setStep('datetime')}>
                Continua <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Data e ora ── */}
        {step === 'datetime' && (
          <div className={styles.stepPanel}>
            <span className={styles.colLabel}>Scegli giorno e orario</span>
            <div className={styles.dateTimeWrap}>
              <div className={styles.calendar}>
                <div className={styles.monthHeader}>
                  <button type="button" className={styles.navBtn} onClick={prevMonth} disabled={!canGoPrev} aria-label="Mese precedente">
                    <ChevronLeft size={18} />
                  </button>
                  <span className={styles.monthLabel}>{MONTHS[viewMonth]} {viewYear}</span>
                  <button type="button" className={styles.navBtn} onClick={nextMonth} aria-label="Mese successivo">
                    <ChevronRight size={18} />
                  </button>
                </div>
                <div className={styles.weekdays}>
                  {WEEKDAYS.map((d, i) => <span key={i}>{d}</span>)}
                </div>
                <div className={styles.days}>
                  {cells.map((date, i) => {
                    if (!date) return <span key={i} className={styles.dayEmpty} />;
                    const isPast = date < today;
                    const isActive = isSameDay(date, selectedDate);
                    const isToday = isSameDay(date, today);
                    return (
                      <button
                        key={i}
                        type="button"
                        disabled={isPast}
                        className={`${styles.dayNum} ${isActive ? styles.dayActive : ''} ${isPast ? styles.dayPast : ''} ${isToday && !isActive ? styles.dayToday : ''}`}
                        onClick={() => selectDay(date)}
                        aria-label={`${date.getDate()} di ${MONTHS[date.getMonth()]}`}
                        aria-pressed={isActive}
                      >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className={styles.slotsColumn}>
                <div className={styles.slotsHeader}>
                  <span className={styles.slotsService}>{selectedDate.getDate()} {MONTHS[selectedDate.getMonth()]}</span>
                  <span className={styles.statusBadge}>Ogni 30 min</span>
                </div>
                <div className={styles.slotsGrid}>
                  {slots.map((slot) => (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={!slot.available}
                      className={`${styles.slot} ${activeTime === slot.time ? styles.slotActive : ''} ${!slot.available ? styles.slotDisabled : ''}`}
                      onClick={() => slot.available && setTime(slot.time)}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className={styles.stepNav}>
              <button type="button" className={styles.backBtn} onClick={() => setStep('service')}>
                <ArrowLeft size={16} aria-hidden="true" /> Indietro
              </button>
              <button type="button" className={`btn btn-gold ${styles.nextBtn}`} disabled={!activeTime} onClick={() => setStep('barber')}>
                Continua <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Barbiere ── */}
        {step === 'barber' && (
          <div className={styles.stepPanel}>
            <span className={styles.colLabel}>Scegli il barbiere</span>
            <div className={styles.barberGrid}>
              <button
                type="button"
                className={`${styles.barberOption} ${barberId === '' ? styles.barberOptionActive : ''}`}
                onClick={() => setBarberId('')}
              >
                <span className={styles.barberPhoto}>
                  <span className={styles.barberPhotoFallback} aria-hidden="true">
                    <Users size={28} />
                  </span>
                </span>
                <span className={styles.barberOptName}>Qualsiasi disponibile</span>
                <span className={styles.barberOptRole}>Prima disponibilità</span>
              </button>
              {barbers.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={`${styles.barberOption} ${barberId === m.id ? styles.barberOptionActive : ''}`}
                  onClick={() => setBarberId(m.id)}
                >
                  <span className={styles.barberPhoto} style={{ background: m.color ? `${m.color}22` : undefined }}>
                    {m.image
                      ? <img src={m.image} alt={m.name} className={styles.barberPhotoImg} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span className={styles.barberPhotoFallback} aria-hidden="true" style={{ color: m.color || undefined }}><Users size={28} /></span>}
                  </span>
                  <span className={styles.barberOptName}>{m.name}</span>
                  {m.role && <span className={styles.barberOptRole}>{m.role}</span>}
                </button>
              ))}
            </div>
            <div className={styles.stepNav}>
              <button type="button" className={styles.backBtn} onClick={() => setStep('datetime')}>
                <ArrowLeft size={16} aria-hidden="true" /> Indietro
              </button>
              <button type="button" className={`btn btn-gold ${styles.nextBtn}`} onClick={() => setStep('data')}>
                Continua <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: I tuoi dati ── */}
        {step === 'data' && (
          <div className={styles.stepPanel}>
            <div className={styles.contactGrid}>
              <form className={styles.contactForm} onSubmit={submitBooking}>
                <span className={styles.colLabel}>I tuoi dati</span>
                <p className={styles.contactHint}>Ti invieremo la conferma via email e un promemoria via SMS.</p>

                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Nome completo</span>
                  <span className={styles.inputWrap}>
                    <User size={15} className={styles.inputIcon} aria-hidden="true" />
                    <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Il tuo nome e cognome" autoComplete="name" required />
                  </span>
                </label>

                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Telefono</span>
                  <span className={styles.inputWrap}>
                    <Phone size={15} className={styles.inputIcon} aria-hidden="true" />
                    <input type="tel" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="+39 333 123 4567" autoComplete="tel" required />
                  </span>
                </label>

                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Email</span>
                  <span className={styles.inputWrap}>
                    <Mail size={15} className={styles.inputIcon} aria-hidden="true" />
                    <input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="tu@email.it" autoComplete="email" required />
                  </span>
                </label>

                <div className={styles.paymentDropdown}>
                  <CreditCard size={16} className={styles.payIcon} aria-hidden="true" />
                  <select value={payment} onChange={(e) => setPayment(e.target.value)} aria-label="Metodo di pagamento">
                    <option value="In Salone">Pagamento: In Salone</option>
                    <option value="Carta">Carta di Credito / Debito</option>
                    <option value="ApplePay">Apple Pay / Google Pay</option>
                  </select>
                  <ChevronDown size={16} className={styles.arrowIcon} aria-hidden="true" />
                </div>

                {saveError && <p className={styles.saveError}>{saveError}</p>}

                <div className={styles.stepNav}>
                  <button type="button" className={styles.backBtn} onClick={() => setStep('barber')}>
                    <ArrowLeft size={16} aria-hidden="true" /> Indietro
                  </button>
                  <button type="submit" className={`btn btn-gold ${styles.confirmBtn}`} disabled={!formValid || saving}>
                    <Lock size={15} aria-hidden="true" />
                    {saving ? 'Salvataggio…' : 'Conferma Appuntamento'}
                  </button>
                </div>
              </form>

              <aside className={styles.contactSummary}>
                <span className={styles.colLabel}>Riepilogo</span>
                <div className={styles.summaryCard}>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Servizio</span>
                    <span className={styles.detailVal}>{service?.name}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Data</span>
                    <span className={styles.detailVal}>{selectedDate.getDate()} {MONTHS[selectedDate.getMonth()]}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Ora</span>
                    <span className={styles.detailVal}>{activeTime}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Barbiere</span>
                    <span className={styles.detailVal}>{barberLabel}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Pagamento</span>
                    <span className={styles.detailVal}>{payment}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Prezzo</span>
                    <span className={`${styles.detailVal} ${styles.priceHighlight}`}>{servicePriceLabel(service)}</span>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        )}
      </div>

      {confirmed && (
        <div className={styles.successOverlay} role="dialog" aria-modal="true" aria-labelledby="confirm-title">
          <div className={styles.successCard}>
            <div className={styles.successHeader}>
              <div className={styles.successIcon}><Check size={28} aria-hidden="true" /></div>
              <h3 id="confirm-title" className={styles.modalTitle}>Prenotazione Confermata!</h3>
              <p className={styles.modalSub}>
                {clientName.split(' ')[0]}, il tuo appuntamento con <strong className={styles.barberHighlight}>{barberLabel}</strong> è prenotato.
              </p>
            </div>

            <div className={styles.successBody}>
              <div className={styles.receipt}>
                <div className={styles.receiptRow}><span>Cliente</span><strong>{clientName}</strong></div>
                <div className={styles.receiptRow}><span>Telefono</span><strong>{clientPhone}</strong></div>
                <div className={styles.receiptRow}><span>Email</span><strong>{clientEmail}</strong></div>
                <div className={styles.receiptRow}><span>Servizio</span><strong>{service?.name}</strong></div>
                <div className={styles.receiptRow}><span>Data e ora</span><strong>{selectedDate.getDate()} {MONTHS[selectedDate.getMonth()]} · {activeTime}</strong></div>
                <div className={styles.receiptRow}><span>Barbiere</span><strong>{barberLabel}</strong></div>
                <div className={styles.receiptRow}><span>Prezzo</span><strong className={styles.priceHighlight}>{servicePriceLabel(service)}</strong></div>
                <div className={styles.receiptRow}><span>Pagamento</span><strong>{payment}</strong></div>
              </div>

              <div className={styles.mapSection}>
                <div className={styles.mapHeader}>
                  <MapPin size={16} className={styles.mapPin} aria-hidden="true" />
                  <span>{contact.address}</span>
                </div>
                <iframe
                  src={mapsSrc}
                  title="Posizione di Franco Barber Studio"
                  className={styles.mapFrame}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>

            <button type="button" className={`btn btn-primary ${styles.closeBtn}`} onClick={closeAll}>
              Chiudi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
