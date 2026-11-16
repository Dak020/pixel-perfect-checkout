import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mutateCart, readCart, type Cart } from '@/lib/shopify';

interface State {
  cart: Cart | null; initialized: boolean; busy: boolean; error: string;
  addItem: (variantId: string, quantity?: number) => Promise<void>;
  updateQuantity: (lineId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  syncCart: () => Promise<void>;
  applyCode: (code: string) => Promise<void>;
}
export const useCartStore = create<State>()(persist((set, get) => {
  const run = async (operation: () => Promise<Cart | null>) => {
    set({ busy: true, error: '' });
    try { set({ cart: await operation(), initialized: true }); }
    catch (error) { const message = error instanceof Error ? error.message : 'Unable to update your bag.'; set({ error: message }); if (/cart not found|does not exist/i.test(message)) set({ cart: null }); }
    finally { set({ busy: false }); }
  };
  return {
    cart: null, initialized: false, busy: false, error: '',
    addItem: async (variantId, quantity = 1) => run(() => {
      const cart = get().cart;
      const line = cart?.lines.edges.find(e => e.node.merchandise.id === variantId)?.node;
      if (cart && line) return mutateCart('cartLinesUpdate', { cartId: cart.id, lines: [{ id: line.id, quantity: line.quantity + quantity }] });
      return cart ? mutateCart('cartLinesAdd', { cartId: cart.id, lines: [{ merchandiseId: variantId, quantity }] }) : mutateCart('cartCreate', { input: { lines: [{ merchandiseId: variantId, quantity }] } });
    }),
    updateQuantity: async (lineId, quantity) => { const cart = get().cart; if (!cart) return; await run(() => mutateCart('cartLinesUpdate', { cartId: cart.id, lines: [{ id: lineId, quantity }] })); },
    removeItem: async lineId => { const cart = get().cart; if (!cart) return; await run(() => mutateCart('cartLinesRemove', { cartId: cart.id, lineIds: [lineId] })); },
    syncCart: async () => { const cart = get().cart; if (cart && !get().busy) await run(() => readCart(cart.id)); },
    applyCode: async code => { const cart = get().cart; if (cart) await run(() => mutateCart('cartDiscountCodesUpdate', { cartId: cart.id, discountCodes: [code] })); },
  };
}, { name: 'reference-shopping-bag', partialize: state => ({ cart: state.cart, initialized: state.initialized }), skipHydration: true }));