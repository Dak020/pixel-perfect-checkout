import { createFileRoute, Link } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Gift, Heart, MessageCircle, Search, Send, UserRound, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { productsOptions } from '@/lib/shopify';
import { useCartStore } from '@/stores/cart';
import logo from '@/assets/neiman-logo-fixed.png.asset.json';
import sandal from '@/assets/raffia-sandal-fixed.png.asset.json';
import paypalImg from '@/assets/paypal_button.png.asset.json';
import giftBannerImg from '@/assets/gift_card_offer.png.asset.json';

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
  const [chat, setChat] = useState(false);
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
            <span className="affirm-brand">
              <span className="affirm-word">affirm</span>
              <svg className="affirm-arc" viewBox="0 0 26 18" fill="none">
                <path d="M 2 16 A 11 11 0 0 1 24 16" stroke="#504eca" strokeWidth="2.4" strokeLinecap="round" />
              </svg>
            </span>
            . See if you qualify
          </p>
          <div className="gift-banner-box">
            <img src={giftBannerImg.url} alt="Earn a $50-$1,250 Gift Card" style={{ width: '100%', height: 'auto', display: 'block' }} />
          </div>
          {bag.error && <p role="alert" className="text-destructive">{bag.error}</p>}
        </aside>
      </div>
    </main>

    {notice && <div className="notice" role="status"><p>{notice}</p><Button variant="ghost" size="icon" aria-label="Dismiss notification" onClick={() => setNotice('')}><X/></Button></div>}
    {chat && <div className="chat-panel"><h2>Customer Care</h2><p>For assistance with your order, visit your customer account at checkout.</p><Button onClick={checkout} disabled={!line}>Open checkout</Button></div>}
    <Button className="chat-button" size="icon" aria-label="Customer care" onClick={() => setChat(!chat)}><MessageCircle/></Button>
  </div>;
}
