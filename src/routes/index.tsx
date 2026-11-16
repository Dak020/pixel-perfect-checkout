import { createFileRoute, Link } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Gift, Heart, Search, Send, UserRound, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { productsOptions } from '@/lib/shopify';
import { useCartStore } from '@/stores/cart';
import logo from '@/assets/neiman-logo-fixed.png.asset.json';
import sandal from '@/assets/raffia-sandal-fixed.png.asset.json';
import paypalImg from '@/assets/paypal_button.png.asset.json';

export const Route = createFileRoute('/')({
  loader: ({ context }) => context.queryClient.ensureQueryData(productsOptions),
  errorComponent: ({ error }) => <main role="alert">{error instanceof Error ? error.message : 'Unable to load your shopping bag.'}</main>,
  notFoundComponent: () => <main>No products found</main>,
  head: () => ({ meta: [{ title: 'Your Shopping Bag | Neiman Marcus' }, { name: 'description', content: 'Your shopping bag, delivery options, and secure checkout.' }, { property: 'og:title', content: 'Your Shopping Bag | Neiman Marcus' }, { property: 'og:description', content: 'Review your shopping bag and checkout.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
  component: Index,
});

function Index() {
  const { data: products } = useSuspenseQuery(productsOptions);
  const product = products[0];
  const bag = useCartStore();
  const [ready, setReady] = useState(false);
  const [promo, setPromo] = useState('');
  const [notice, setNotice] = useState('');
  const [edit, setEdit] = useState(false);
  const [gift, setGift] = useState(false);
  const [applied, setApplied] = useState('');
  const [loadingPromo, setLoadingPromo] = useState(false);

  useEffect(() => {
    let active = true;
    void (async () => {
      await useCartStore.persist.rehydrate();
      const state = useCartStore.getState();
      if (!state.initialized && product?.variants.edges[0]) await state.addItem(product.variants.edges[0].node.id);
      else await state.syncCart();
      if (active) setReady(true);
    })();
    const sync = () => { if (document.visibilityState === 'visible') void useCartStore.getState().syncCart(); };
    document.addEventListener('visibilitychange', sync);
    return () => { active = false; document.removeEventListener('visibilitychange', sync); };
  }, [product]);

  const line = bag.cart?.lines.edges[0]?.node;
  const shown = !ready || Boolean(line);
  const price = product?.variants.edges[0]?.node.price.amount;
  const total = bag.cart?.cost.totalAmount.amount ?? price ?? '0';

  const checkout = () => {
    if (!bag.cart?.checkoutUrl || !line) return;
    const url = new URL(bag.cart.checkoutUrl); url.searchParams.set('channel', 'online_store');
    window.open(url.toString(), '_blank', 'noopener,noreferrer');
  };

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const code = promo.trim().toUpperCase();
    if (!code || loadingPromo) return;

    setLoadingPromo(true);
    setTimeout(() => {
      setApplied(code);
      setPromo('');
      setLoadingPromo(false);
    }, 1000);
  };

  return <div className="shopping-page">
    <header className="store-header">
      <div className="header-top">
        <Button variant="link" onClick={() => setNotice('Store locations are not available for this recreated storefront.')}>Our Stores</Button>
        <img className="brand-logo" src={logo.url} alt="Neiman Marcus"/>
        <Button variant="link" onClick={() => setNotice('Order history is available in your Shopify customer account.')}>My Orders</Button>
      </div>
      <div className="department-tabs">
        <Button variant="ghost" className="selected" onClick={() => setNotice('Women selected')}>WOMEN</Button>
        <Button variant="ghost" onClick={() => setNotice('Men selected')}>MEN</Button>
      </div>
      <div className="account-tools">
        <Button variant="ghost" onClick={() => document.getElementById('checkout-heading')?.scrollIntoView({ behavior: 'smooth' })}>
          <UserRound/>Welcome, mia
        </Button>
        <Button variant="ghost" size="icon" aria-label="Favorites" onClick={() => setNotice('Your saved items will appear here.')}><Heart/></Button>
        <Button variant="ghost" size="icon" aria-label="Shopping bag" onClick={() => document.getElementById('bag-title')?.scrollIntoView()}>
          <span className="bag-icon">
            <svg viewBox="0 0 24 28" width="22" height="26" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M8 7V5a4 4 0 0 1 8 0v2"/>
              <rect x="2.5" y="7" width="19" height="19" rx="1"/>
            </svg>
            <span className="bag-count">{bag.cart?.totalQuantity ?? 1}</span>
          </span>
        </Button>
      </div>
      <form className="site-search" onSubmit={e => { e.preventDefault(); setNotice('The current collection contains Jimmy Choo Elsy sandals.'); }}>
        <input aria-label="Search" placeholder="Search"/>
        <Button type="submit">SEARCH <Search/></Button>
      </form>
      <nav className="category-nav">
        {['New Arrivals','The Edits','Designers','Clothing','Shoes','Handbags','Jewelry','Accessories','Beauty','Kids','Home','Gifts','Sale'].map(category => (
          <Button key={category} variant="ghost" onClick={() => setNotice(`${category}: browse the available sandal in your shopping bag.`)}>{category}</Button>
        ))}
      </nav>
    </header>

    <div className="offer-strip">
      SPECIAL OFFER: FREE SHIPPING ON $150+ WITH CODE SHIPNM <Button variant="ghost" onClick={() => setNotice('Offer reproduced from the reference. Shipping and discounts are confirmed at Shopify checkout.')}>Details &gt;</Button>
    </div>

    <main>
      <h1 id="bag-title">YOUR SHOPPING BAG</h1>
      <div className="checkout-layout">
        <section className="bag-content">
          {product && shown ? <article className="bag-item">
            <Link to="/product/$handle" params={{ handle: product.handle }} className="product-image">
              <img src={sandal.url} alt="Natural raffia slingback sandal"/>
            </Link>
            <div className="product-details">
              <strong>{product.vendor}</strong>
              <Link to="/product/$handle" params={{ handle: product.handle }} className="product-title">{product.title}</Link>
              <div className="product-options">
                <p>Size: 8.5</p>
                <p>Color: NATURAL</p>
                <p>Qty: {line?.quantity ?? 1}</p>
              </div>
              <div className="item-actions">
                <Button variant="link" onClick={() => setEdit(!edit)}>Edit</Button>
                <Button variant="link" onClick={async () => { if (line) { await bag.removeItem(line.id); setNotice('Item saved for this visit. Select Add to Bag to restore it.'); } }}>Save For Later</Button>
                <Button variant="link" disabled={bag.busy} onClick={() => line && bag.removeItem(line.id)}>Remove</Button>
              </div>
              {edit && <label className="quantity-edit">Quantity <input type="number" min="1" max="10" defaultValue={line?.quantity ?? 1} onChange={e => { const value = Number(e.target.value); if (line && value > 0) void bag.updateQuantity(line.id, value); }}/></label>}
              <Button variant="link" className="gift-link" onClick={() => setGift(!gift)}><Gift/>{gift ? 'Gift selected' : 'Make This a Gift'}</Button>
              {gift && <textarea className="gift-message" aria-label="Gift message" placeholder="Gift message (add at checkout)"/>}
            </div>
            <fieldset className="delivery-options">
              <label><input type="radio" name="delivery" defaultChecked/> <span>Delivery to<strong>Get it in 2-3 business days.</strong></span></label>
              <label><input type="radio" name="delivery" disabled/> <span>Pickup<small>Not eligible for pickup</small><Button variant="link" onClick={() => setNotice('This item is not eligible for store pickup.')}>Select a store location</Button></span></label>
            </fieldset>
            <strong className="item-price">${Number(price ?? 0).toFixed(2)}</strong>
          </article> : <div className="empty-bag"><p>{product ? 'Your shopping bag is empty.' : 'No products found'}</p>{product && <Button onClick={() => { const variant = product.variants.edges[0]?.node; if (variant) void bag.addItem(variant.id); }}>Add to Bag</Button>}</div>}
          <div className="bag-footer">
            <p>Items and promotional pricing not reserved until checkout is completed</p>
            <Button variant="outline" onClick={async () => { await navigator.clipboard.writeText(window.location.href); setNotice('Shopping bag link copied.'); }}><Send/> SEND YOUR SHOPPING BAG</Button>
          </div>
        </section>

        <aside className="order-summary">
          {applied && <p className="promos">Promotions Applied<br/>{applied}</p>}
          <div className="summary-row"><span>Shipping</span><span>Calculated at Checkout</span></div>
          {applied && <div className="summary-row discount"><span>Discount Applied</span><span>-$750.00</span></div>}
          <div className="summary-row total">
            <strong>Order Total</strong>
            <strong>${Math.max(0, Number(shown ? total : 0) - (applied ? 750 : 0)).toFixed(2)}</strong>
          </div>
          <form className="promo-field" onSubmit={handleApplyPromo}>
            <input
              aria-label="Enter Promo Code"
              placeholder="Enter Promo Code"
              value={promo}
              disabled={loadingPromo}
              onChange={e => setPromo(e.target.value)}
            />
            {loadingPromo ? (
              <div className="promo-dots promo-dots-inline" aria-label="Validating promo code">
                <span className="dot dot-1" />
                <span className="dot dot-2" />
                <span className="dot dot-3" />
              </div>
            ) : (
              <Button variant="link" type="submit" disabled={!promo.trim()}>Apply</Button>
            )}
          </form>

          {loadingPromo && (
            <div className="promo-dots promo-dots-below" aria-label="Loading promo discount">
              <span className="dot dot-1" />
              <span className="dot dot-2" />
              <span className="dot dot-3" />
            </div>
          )}

          {applied && (
            <div className="promo-applied">
              <span>Promo Applied: {applied}</span>
              <Button variant="ghost" size="icon" aria-label="Remove promo" onClick={() => setApplied('')}><X/></Button>
            </div>
          )}
          <Button className="checkout-button" onClick={checkout} disabled={bag.busy || !line}>CHECKOUT</Button>
          <div className="express-pay">
            <Button variant="outline" onClick={checkout} disabled={!line} className="flex items-center justify-center p-0 overflow-hidden">
              <div style={{ height: '24px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img
                  src={paypalImg.url}
                  alt="PayPal"
                  style={{
                    height: '42px',
                    objectFit: 'contain',
                    clipPath: 'inset(14% 0 0 0)',
                    marginTop: '-4px',
                  }}
                />
              </div>
            </Button>
            <Button variant="outline" onClick={checkout} disabled={!line}>
              <span className="applepay">{'\uF8FF'}Pay</span>
            </Button>
          </div>
          <p className="affirm">
            Starting at $77/mo or 0% APR with{' '}
            <svg
              className="affirm-logo"
              viewBox="0 0 420 167"
              aria-label="Affirm"
              role="img"
            >
              <g fillRule="evenodd" clipRule="evenodd">
                <path
                  fill="currentColor"
                  d="M34.3 94.1c-11.3 0-24.4 5.4-31.5 11l6.5 13.6c5.7-5.2 14.9-9.6 23.2-9.6 7.9 0 12.2 2.6 12.2 7.9 0 3.6-2.9 5.4-8.3 6.1C16 125.7 0 131.3 0 147c0 12.4 8.9 20 22.7 20 9.9 0 18.7-5.5 22.9-12.7V165H64v-44.9c0-18.5-12.9-26-29.7-26zm-6.9 58.5c-5.2 0-7.8-2.5-7.8-6.7 0-7.8 8.7-10.4 24.6-12.1.1 10.4-7 18.8-16.8 18.8zm210.1-44.9V96.1h-18.4V165h19.7v-33.2c0-15.8 9.5-20.4 16.2-20.4 2.6 0 6.1.8 8.4 2.5l3.6-18.2c-3-1.3-6.2-1.6-8.8-1.6-10.1 0-16.5 4.5-20.7 13.6zm120.9-13.6c-10.4 0-18.2 6.2-22.3 12.1-3.8-7.7-11.7-12.1-21.3-12.1-10.4 0-17.6 5.8-21 12.4V96.1h-19V165h19.7v-35.5c0-12.7 6.7-18.8 12.9-18.8 5.6 0 10.8 3.6 10.8 13V165H338v-35.5c0-12.9 6.5-18.8 13-18.8 5.2 0 10.7 3.8 10.7 12.9V165h19.7v-47.6c0-15.5-10.4-23.3-23-23.3zM133.6 91v5.1h-29.9v-7c0-9.1 5.2-11.7 9.7-11.7 2.6 0 6 .6 8.8 2.2l6.1-13.9c-3.6-2.1-9.5-4-17.4-4-12.6 0-26.9 7.1-26.9 29.4v5.1H72.6v15.2H84V165h19.7v-53.7h29.9V165h19.7v-53.7h17.9V96.1h-17.9v-7c0-9.1 5.2-11.7 9.7-11.7 5 0 8.8 2.2 8.8 2.2l6.1-13.9s-6.2-4-17.4-4c-12.5-.1-26.9 7-26.9 29.3zm49.3 5.1h19.7V165h-19.7z"
                />
                <path
                  fill="#4848d6"
                  d="M297.7 0c-53.2 0-100.6 36.9-114 84.4H203C214.2 49 252.3 18 297.7 18c55.2 0 102.8 42 102.8 107.4 0 14.7-1.9 27.9-5.5 39.6h18.7l.2-.6c3.1-12.1 4.6-25.2 4.6-39C418.5 52.5 365.4 0 297.7 0"
                />
              </g>
            </svg>
            . See if you qualify
          </p>
          <div className="gift-banner-box">
