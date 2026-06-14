'use client';
import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { X, ShoppingBag, Plus, Minus, Trash2, Check, Lock } from 'lucide-react';
import { products } from '../lib/data';
import { getCart, addToCart, setCartQty, removeFromCart, clearCart, createOrder, CART_EVENT } from '../lib/store';
import styles from './Shop.module.css';

const formatPrice = (n) => `${n.toFixed(2).replace('.', ',')}€`;
const categories = ['Tutti', ...Array.from(new Set(products.map((p) => p.category)))];

export default function Shop() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState('shop');
  const [category, setCategory] = useState('Tutti');
  const [cart, setCart] = useState([]);
  const [confirmed, setConfirmed] = useState(false);
  const [orderRef, setOrderRef] = useState('');
  const [added, setAdded] = useState(null);

  useEffect(() => {
    setCart(getCart());
    const onCart = () => setCart(getCart());
    window.addEventListener(CART_EVENT, onCart);
    return () => window.removeEventListener(CART_EVENT, onCart);
  }, []);

  useEffect(() => {
    const openShop = (targetView) => {
      setView(targetView || 'shop');
      setOpen(true);
      if (window.location.hash === '#shop' || window.location.hash === '#carrito') {
        history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    };

    const onClick = (e) => {
      const a = e.target.closest('a[href="#shop"], a[href="#carrito"], button[data-cart-trigger]');
      if (a) {
        e.preventDefault();
        const wantsCart = a.getAttribute('href') === '#carrito' || a.dataset.cartTrigger !== undefined;
        openShop(wantsCart ? 'cart' : 'shop');
      }
    };

    const onHash = () => {
      if (window.location.hash === '#shop') openShop('shop');
      if (window.location.hash === '#carrito') openShop('cart');
    };

    if (window.location.hash === '#shop') openShop('shop');
    if (window.location.hash === '#carrito') openShop('cart');

    document.addEventListener('click', onClick);
    window.addEventListener('hashchange', onHash);
    return () => {
      document.removeEventListener('click', onClick);
      window.removeEventListener('hashchange', onHash);
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

  const visibleProducts = useMemo(
    () => (category === 'Tutti' ? products : products.filter((p) => p.category === category)),
    [category]
  );

  const cartDetailed = useMemo(
    () => cart.map((i) => {
      const product = products.find((p) => p.id === i.id);
      return product ? { ...product, qty: i.qty, lineTotal: product.price * i.qty } : null;
    }).filter(Boolean),
    [cart]
  );

  const subtotal = cartDetailed.reduce((s, l) => s + l.lineTotal, 0);
  const shipping = subtotal === 0 || subtotal >= 40 ? 0 : 4.5;
  const total = subtotal + shipping;
  const itemCount = cart.reduce((s, i) => s + i.qty, 0);

  const handleAdd = (id) => {
    addToCart(id);
    setAdded(id);
    setTimeout(() => setAdded((current) => (current === id ? null : current)), 1200);
  };

  const closeAll = () => {
    setOpen(false);
    setConfirmed(false);
    setOrderRef('');
  };

  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState('');

  const checkout = async () => {
    if (cartDetailed.length === 0 || placing) return;
    setOrderError(''); setPlacing(true);
    const ref = `FBS-${Date.now().toString().slice(-6)}`;
    const { error } = await createOrder({
      reference: ref,
      items: cartDetailed.map(({ id, name, price, qty, lineTotal }) => ({ id, name, price, qty, lineTotal })),
      subtotal, shipping, total,
    });
    setPlacing(false);
    if (error) { setOrderError(error.message || 'Errore nel salvataggio dell\'ordine'); return; }
    setOrderRef(ref);
    clearCart();
    setConfirmed(true);
  };

  if (!open) return null;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="shop-title" onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
      <div className={styles.dialog}>
        <header className={styles.header}>
          <div>
            <p className={styles.label}>Negozio Franco</p>
            <h2 id="shop-title" className={styles.title}>
              {view === 'cart' ? 'Il tuo Carrello' : 'Prodotti'}
            </h2>
          </div>
          <div className={styles.headerActions}>
            <div className={styles.tabs} role="tablist">
              <button type="button" role="tab" aria-selected={view === 'shop'} className={`${styles.tab} ${view === 'shop' ? styles.tabActive : ''}`} onClick={() => setView('shop')}>
                Prodotti
              </button>
              <button type="button" role="tab" aria-selected={view === 'cart'} className={`${styles.tab} ${view === 'cart' ? styles.tabActive : ''}`} onClick={() => setView('cart')}>
                Carrello {itemCount > 0 && <span className={styles.tabBadge}>{itemCount}</span>}
              </button>
            </div>
            <button type="button" className={styles.closeBtn} onClick={() => setOpen(false)} aria-label="Chiudi">
              <X size={22} />
            </button>
          </div>
        </header>

        {view === 'shop' && !confirmed && (
          <div className={styles.shopBody}>
            <div className={styles.filters}>
              {categories.map((c) => (
                <button key={c} type="button" className={`${styles.filter} ${category === c ? styles.filterActive : ''}`} onClick={() => setCategory(c)}>
                  {c}
                </button>
              ))}
            </div>

            <div className={styles.grid}>
              {visibleProducts.map((p) => (
                <article key={p.id} className={styles.card}>
                  <div className={styles.imageWrap}>
                    <Image src={p.image} alt={p.name} fill sizes="(max-width: 768px) 50vw, 250px" className={styles.image} />
                  </div>
                  <div className={styles.info}>
                    <span className={styles.cardCat}>{p.category}</span>
                    <h3 className={styles.productName}>{p.name}</h3>
                    <p className={styles.productDesc}>{p.description}</p>
                    <div className={styles.cardFooter}>
                      <span className={styles.productPrice}>{formatPrice(p.price)}</span>
                      <button
                        type="button"
                        className={`${styles.addBtn} ${added === p.id ? styles.addBtnDone : ''}`}
                        onClick={() => handleAdd(p.id)}
                        disabled={added === p.id}
                      >
                        {added === p.id ? <><Check size={14} /> Aggiunto</> : <><Plus size={14} /> Aggiungi</>}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {view === 'cart' && !confirmed && (
          <div className={styles.cartBody}>
            {cartDetailed.length === 0 && (
              <div className={styles.cartEmpty}>
                <ShoppingBag size={36} aria-hidden="true" />
                <p>Il tuo carrello è vuoto.</p>
                <button type="button" className="btn btn-outline" onClick={() => setView('shop')}>Vedi prodotti</button>
              </div>
            )}

            {cartDetailed.length > 0 && (
              <>
                <ul className={styles.cartList}>
                  {cartDetailed.map((line) => (
                    <li key={line.id} className={styles.cartItem}>
                      <div className={styles.cartImageWrap}>
                        <Image src={line.image} alt="" fill sizes="80px" className={styles.cartImage} />
                      </div>
                      <div className={styles.cartItemBody}>
                        <p className={styles.cartItemName}>{line.name}</p>
                        <p className={styles.cartItemUnit}>{formatPrice(line.price)} per unità</p>
                      </div>
                      <div className={styles.qtyControls}>
                        <button type="button" className={styles.qtyBtn} onClick={() => setCartQty(line.id, line.qty - 1)} aria-label="Diminuisci">
                          <Minus size={13} />
                        </button>
                        <span className={styles.qtyValue}>{line.qty}</span>
                        <button type="button" className={styles.qtyBtn} onClick={() => setCartQty(line.id, line.qty + 1)} aria-label="Aumenta">
                          <Plus size={13} />
                        </button>
                      </div>
                      <div className={styles.cartItemTotal}>
                        <span>{formatPrice(line.lineTotal)}</span>
                        <button type="button" className={styles.removeBtn} onClick={() => removeFromCart(line.id)} aria-label="Rimuovi">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className={styles.summary}>
                  <div className={styles.summaryRow}>
                    <span>Subtotale</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Spedizione {subtotal >= 40 && <em className={styles.freeShipping}>· gratis sopra 40€</em>}</span>
                    <span>{shipping === 0 ? 'Gratis' : formatPrice(shipping)}</span>
                  </div>
                  <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                    <span>Totale</span>
                    <strong>{formatPrice(total)}</strong>
                  </div>
                  {orderError && <p style={{ color: '#e57373', fontSize: '0.82rem', marginTop: '0.5rem' }}>{orderError}</p>}
                  <button type="button" className="btn btn-gold" style={{ width: '100%', marginTop: '1rem' }} onClick={checkout} disabled={placing}>
                    <Lock size={15} aria-hidden="true" /> {placing ? 'Attendere…' : 'Completa l\'Ordine'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {confirmed && (
          <div className={styles.confirmBody}>
            <div className={styles.successIcon}><Check size={28} aria-hidden="true" /></div>
            <h3 className={styles.confirmTitle}>Ordine Confermato!</h3>
            <p className={styles.confirmSub}>Riferimento: <strong>{orderRef}</strong></p>
            <p className={styles.confirmText}>
              Riceverai un&apos;email con la spedizione. Consegna stimata in 2–4 giorni lavorativi.
            </p>
            <div className={styles.confirmActions}>
              <button type="button" className="btn btn-outline" onClick={() => { setConfirmed(false); setView('shop'); }}>
                Continua lo shopping
              </button>
              <button type="button" className="btn btn-primary" onClick={closeAll}>Chiudi</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
