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
import giftOffer from '@/assets/gift_card_offer_new.jpeg.asset.json';

export const Route = createFileRoute('/')({
  loader: ({ context }) => context.queryClient.ensureQueryData(productsOptions),
  errorComponent: ({ error }) => <main role="alert">{error instanceof Error ? error.message : 'Unable to load your shopping bag.'}</main>,
  notFoundComponent: () => <main>No products found</main>,
  head: () => ({ meta: [{ title: 'Your Shopping Bag | Neiman Marcus' }, { name: 'description', content: 'Your shopping bag, delivery options, and secure checkout.' }, { property: 'og:title', content: 'Your Shopping Bag | Neiman Marcus' }, { property: 'og:description', content: 'Review your shopping bag and checkout.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
  component: Index,
});

const GIFT_BANNER_SRC = [
  "data:image/webp;base64,",
  "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"
].join("");

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
            <img
              src={giftOffer.url}
              alt="Earn a gift card offer"
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </div>
          {bag.error && <p role="alert" className="text-destructive">{bag.error}</p>}
        </aside>
      </div>
    </main>

    {notice && <div className="notice" role="status"><p>{notice}</p><Button variant="ghost" size="icon" aria-label="Dismiss notification" onClick={() => setNotice('')}><X/></Button></div>}

  </div>;
}
