'use client';
import { supabase } from './supabase';

// ============================================================
// AUTH (Supabase)
// ============================================================

export const signUp = async (email, password, name) => {
  const { data, error } = await supabase().auth.signUp({
    email,
    password,
    options: { data: { name } },
  });
  return { user: data?.user ?? null, error };
};

export const signIn = async (email, password) => {
  const { data, error } = await supabase().auth.signInWithPassword({ email, password });
  return { user: data?.user ?? null, error };
};

export const signOut = async () => {
  await supabase().auth.signOut();
};

export const signInWithProvider = async (provider) => {
  const { error } = await supabase().auth.signInWithOAuth({
    provider,
    options: {
      // Torniamo alla home pulita (senza hash) così Supabase può
      // scambiare il code per la sessione senza interferenze.
      redirectTo: `${window.location.origin}/`,
      // Per Google: chiedi sempre di scegliere l'account ed evita
      // sessioni "appiccicate" che causano errori al re-login.
      queryParams: provider === 'google'
        ? { prompt: 'select_account', access_type: 'offline' }
        : undefined,
    },
  });
  return { error };
};

// Legge un eventuale errore OAuth restituito nell'URL al ritorno dal provider
// (es. ?error=access_denied&error_description=...). Restituisce il messaggio
// leggibile e ripulisce l'URL, oppure null se non c'è nessun errore.
export const consumeOAuthError = () => {
  if (typeof window === 'undefined') return null;
  const url = new URL(window.location.href);
  const hash = new URLSearchParams(url.hash.replace(/^#/, ''));
  const err = url.searchParams.get('error') || hash.get('error');
  if (!err) return null;
  const desc =
    url.searchParams.get('error_description') ||
    hash.get('error_description') ||
    err;
  // Pulisci i parametri d'errore dall'URL così non riappaiono al refresh.
  ['error', 'error_description', 'error_code'].forEach((k) => url.searchParams.delete(k));
  url.hash = '';
  window.history.replaceState({}, '', url.pathname + url.search);
  return decodeURIComponent(desc.replace(/\+/g, ' '));
};

export const requestPasswordReset = async (email) => {
  const redirectTo = `${window.location.origin}/reset-password`;
  const { error } = await supabase().auth.resetPasswordForEmail(email, { redirectTo });
  return { error };
};

export const updatePassword = async (newPassword) => {
  const { error } = await supabase().auth.updateUser({ password: newPassword });
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { session } } = await supabase().auth.getSession();
  return session?.user ?? null;
};

export const onAuthChange = (callback) => {
  const { data: { subscription } } = supabase().auth.onAuthStateChange((event, session) => {
    callback(session?.user ?? null, event);
  });
  return () => subscription.unsubscribe();
};

const userToAuthShape = (user) => {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.user_metadata?.name || user.email?.split('@')[0] || '',
  };
};
export { userToAuthShape };

// ============================================================
// BOOKINGS — sincronizzati con BarberFlow (multi-tenant)
// ============================================================

// Slug della barberia su BarberFlow a cui appartiene questo sito
const SHOP_SLUG = 'franco-barber-estudio';
let _shopId = null;

export const getShopId = async () => {
  if (_shopId) return _shopId;
  const { data, error } = await supabase()
    .from('shops')
    .select('id')
    .eq('slug', SHOP_SLUG)
    .maybeSingle();
  if (error || !data) { console.error('getShopId', error); return null; }
  _shopId = data.id;
  return _shopId;
};

const MONTHS_IT = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
const priceToNumber = (v) => {
  if (v == null) return null;
  const n = parseFloat(String(v).replace(/[^\d,.]/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};
const durationToMinutes = (v) => {
  const n = parseInt(String(v).replace(/[^\d]/g, ''), 10);
  return Number.isFinite(n) ? n : 30;
};

// Mappa dal formato DB BarberFlow al formato usato dal front-end Franco
const fromDb = (row) => {
  const d = new Date(row.date_iso);
  return {
    id: row.id,
    userEmail: row.client_email,
    clientName: row.client_name,
    clientPhone: row.client_phone,
    clientEmail: row.client_email,
    serviceId: row.service_id,
    serviceName: row.service_name,
    price: row.price != null ? `${Number(row.price).toFixed(2).replace('.', ',')}€` : '',
    date: `${d.getDate()} ${MONTHS_IT[d.getMonth()]}`,
    dateISO: row.date_iso,
    time: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
    barber: row.barber_name || 'Qualsiasi disponibile',
    payment: row.payment_method || '',
    extras: row.extras || [],
    status: row.status,
    createdAt: new Date(row.created_at).getTime(),
  };
};

export const getMyBookings = async () => {
  const { data, error } = await supabase()
    .from('bookings')
    .select('*')
    .order('date_iso', { ascending: false });
  if (error) { console.error('getMyBookings', error); return []; }
  return (data || []).map(fromDb);
};

export const getBookingsForDate = async (date) => {
  const start = new Date(date); start.setHours(0, 0, 0, 0);
  const end = new Date(date); end.setHours(23, 59, 59, 999);
  const { data, error } = await supabase()
    .from('bookings')
    .select('*')
    .gte('date_iso', start.toISOString())
    .lte('date_iso', end.toISOString())
    .order('date_iso', { ascending: true });
  if (error) { console.error('getBookingsForDate', error); return []; }
  return (data || []).map(fromDb);
};

export const createBooking = async (booking) => {
  // L'utente NON deve essere obbligatoriamente loggato:
  // se c'è, colleghiamo il booking al suo account; altrimenti guest checkout.
  const user = await getCurrentUser();

  const shopId = await getShopId();
  if (!shopId) return { error: { message: 'Barberia non trovata. Riprova più tardi.' } };

  // Combina data (Date) + ora ("HH:MM") in un datetime ISO
  const when = new Date(booking.when);
  if (booking.time) {
    const [h, m] = String(booking.time).split(':').map(Number);
    when.setHours(h || 0, m || 0, 0, 0);
  }

  const row = {
    shop_id: shopId,
    user_id: user?.id ?? null,
    client_name: booking.clientName,
    client_phone: booking.clientPhone,
    client_email: booking.clientEmail,
    service_id: null, // i servizi di Franco sono locali (slug), non FK uuid
    service_name: booking.serviceName,
    price: priceToNumber(booking.price),
    date_iso: when.toISOString(),
    duration_minutes: durationToMinutes(booking.duration),
    barber_name: booking.barber,
    payment_method: booking.payment,
    extras: booking.extras || [],
    status: booking.status || 'attiva',
  };
  // Niente .select() dopo l'insert: l'RLS di SELECT è personale e
  // bloccherebbe la riga appena creata per un guest, anche se l'INSERT è valido.
  const { error } = await supabase().from('bookings').insert(row);
  return { data: null, error };
};

export const updateBooking = async (id, patch) => {
  const dbPatch = {};
  if (patch.status !== undefined) dbPatch.status = patch.status;
  if (patch.extras !== undefined) dbPatch.extras = patch.extras;
  if (patch.dateISO !== undefined) dbPatch.date_iso = patch.dateISO;
  if (patch.barber !== undefined) dbPatch.barber_name = patch.barber;
  const { error } = await supabase().from('bookings').update(dbPatch).eq('id', id);
  return { error };
};

// ============================================================
// ORDERS (Supabase)
// ============================================================

export const getMyOrders = async () => {
  const { data } = await supabase()
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
  return data || [];
};

export const createOrder = async (order) => {
  const user = await getCurrentUser();
  const shopId = await getShopId();
  const { data, error } = await supabase().from('orders').insert({
    shop_id: shopId,
    user_id: user?.id ?? null,
    user_email: user?.email ?? null,
    reference: order.reference,
    items: order.items,
    subtotal: order.subtotal,
    shipping: order.shipping,
    total: order.total,
  }).select().single();
  return { data, error };
};

// ============================================================
// NEWSLETTER (Supabase)
// ============================================================

export const subscribeNewsletter = async (email) => {
  const clean = String(email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
    return { error: { message: 'Email non valida' } };
  }
  const { error } = await supabase().from('newsletter').insert({ email: clean });
  // 23505 = violazione di unicità → l'email è già iscritta, lo trattiamo come successo
  if (error && error.code === '23505') return { error: null, already: true };
  return { error };
};

// ============================================================
// CART (localStorage — session-only, non serve nel database)
// ============================================================

const CART_KEY = 'franco.cart';
export const CART_EVENT = 'franco:cart-changed';

const readCart = () => {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; }
};
const writeCart = (items) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CART_EVENT));
};

export const getCart = () => readCart();

export const addToCart = (productId, qty = 1) => {
  const cart = readCart();
  const existing = cart.find((i) => i.id === productId);
  if (existing) existing.qty += qty;
  else cart.push({ id: productId, qty });
  writeCart(cart);
};

export const setCartQty = (productId, qty) => {
  const cart = readCart();
  const item = cart.find((i) => i.id === productId);
  if (!item) return;
  if (qty <= 0) writeCart(cart.filter((i) => i.id !== productId));
  else { item.qty = qty; writeCart(cart); }
};

export const removeFromCart = (productId) => writeCart(readCart().filter((i) => i.id !== productId));
export const clearCart = () => writeCart([]);
