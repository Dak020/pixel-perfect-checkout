import { createFileRoute, Link } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { productsOptions } from '@/lib/shopify';
import { useCartStore } from '@/stores/cart';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/product/$handle')({
  loader: ({ context }) => context.queryClient.ensureQueryData(productsOptions),
  errorComponent: ({ error }) => <main role="alert">{error.message}</main>,
  notFoundComponent: () => <main>No products found</main>,
  head: ({ params }) => ({ meta: [{ title: `${params.handle.replaceAll('-', ' ')} | Neiman Marcus` }, { name: 'description', content: 'Product details and shopping bag.' }, { property: 'og:title', content: `${params.handle.replaceAll('-', ' ')} | Neiman Marcus` }, { property: 'og:description', content: 'Explore product details and add to your shopping bag.' }, { property: 'og:type', content: 'product' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
  component: ProductPage,
});
function ProductPage() {
  const { handle } = Route.useParams();
  const { data } = useSuspenseQuery(productsOptions);
  const product = data.find(p => p.handle === handle);
  const cart = useCartStore();
  const variant = product?.variants.edges[0]?.node;
  return <main className="product-page"><Link to="/">Back to shopping bag</Link>{product && variant ? <div className="product-page-layout"><img src={product.images.edges[0]?.node.url} alt={product.title}/><div><h2>{product.vendor}</h2><h1>{product.title}</h1><p>{product.description}</p><p>${Number(variant.price.amount).toFixed(2)}</p>{variant.selectedOptions.map(o => <p key={o.name}>{o.name}: {o.value}</p>)}<Button disabled={cart.busy} onClick={async () => { await cart.addItem(variant.id); }}>Add to Bag</Button><Button asChild variant="link"><Link to="/">View shopping bag</Link></Button>{cart.error && <p role="alert">{cart.error}</p>}</div></div> : <p>No products found</p>}</main>;
}