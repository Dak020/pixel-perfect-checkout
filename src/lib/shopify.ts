import { queryOptions } from '@tanstack/react-query';

export interface Product {
  id: string; title: string; vendor: string; handle: string; description: string;
  images: { edges: { node: { url: string; altText: string | null } }[] };
  variants: { edges: { node: { id: string; price: { amount: string; currencyCode: string }; selectedOptions: { name: string; value: string }[] } }[] };
}
export async function storefrontApiRequest<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const response = await fetch('https://pixel-perfect-checkout-b5li9-7vgtwy1p.myshopify.com/api/2026-10/graphql.json', {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': 'b1ce68772a10ed30319d1359a4e7334e' }, body: JSON.stringify({ query, variables }),
  });
  if (!response.ok) throw new Error(response.status === 402 ? 'Shopify requires an active billing plan to continue.' : `Shopify request failed (${response.status}).`);
  const result = await response.json() as { data: T; errors?: { message: string }[] };
  if (result.errors?.length) throw new Error(result.errors.map(e => e.message).join(', '));
  return result.data;
}
export const productsOptions = queryOptions({ queryKey: ['products'], queryFn: async () => {
  const data = await storefrontApiRequest<{ products: { edges: { node: Product }[] } }>(`query { products(first: 20) { edges { node { id title vendor handle description images(first: 1) { edges { node { url altText } } } variants(first: 10) { edges { node { id price { amount currencyCode } selectedOptions { name value } } } } } } } }`);
  return data.products.edges.map(e => e.node);
} });
export interface Cart {
  id: string; checkoutUrl: string; totalQuantity: number;
  cost: { totalAmount: { amount: string; currencyCode: string } };
  lines: { edges: { node: { id: string; quantity: number; merchandise: { id: string } } }[] };
}
const cartFields = `id checkoutUrl totalQuantity cost { totalAmount { amount currencyCode } } lines(first: 100) { edges { node { id quantity merchandise { ... on ProductVariant { id } } } } }`;
export async function mutateCart(operation: string, variables: Record<string, unknown>): Promise<Cart> {
  const declarations: Record<string, string> = { cartCreate: '$input: CartInput!', cartLinesAdd: '$cartId: ID!, $lines: [CartLineInput!]!', cartLinesUpdate: '$cartId: ID!, $lines: [CartLineUpdateInput!]!', cartLinesRemove: '$cartId: ID!, $lineIds: [ID!]!', cartDiscountCodesUpdate: '$cartId: ID!, $discountCodes: [String!]!' };
  const args = Object.keys(variables).map(key => `${key}: $${key}`).join(', ');
  const data = await storefrontApiRequest<Record<string, { cart: Cart; userErrors: { message: string }[] }>>(`mutation (${declarations[operation]}) { ${operation}(${args}) { cart { ${cartFields} } userErrors { message } } }`, variables);
  const result = data[operation];
  if (!result) throw new Error('Shopify returned an incomplete cart response.');
  if (result.userErrors.length) throw new Error(result.userErrors.map(e => e.message).join(', '));
  if (!result.cart) throw new Error('Cart not found');
  return result.cart;
}
export async function readCart(id: string) {
  const data = await storefrontApiRequest<{ cart: Cart | null }>(`query ($id: ID!) { cart(id: $id) { ${cartFields} } }`, { id });
  return data.cart;
}