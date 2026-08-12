const storeDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const storefrontToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN;
const apiVersion = process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION || "2026-01";

if (!storeDomain) {
  throw new Error("Missing NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN");
}

if (!storefrontToken) {
  throw new Error("Missing NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN");
}

const endpoint = `https://${storeDomain}/api/${apiVersion}/graphql.json`;

export async function shopifyFetch<T>({
  query,
  variables,
}: {
  query: string;
  variables?: Record<string, unknown>;
}): Promise<T> {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": storefrontToken!,
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  const json = await res.json();

  if (!res.ok || json.errors) {
    console.error("Shopify fetch error:", json);
    throw new Error("Failed Shopify request");
  }

  return json.data;
}

export async function createCart() {
  const query = `
    mutation cartCreate {
      cartCreate {
        cart {
          id
          checkoutUrl
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const data = await shopifyFetch<{
    cartCreate: {
      cart: {
        id: string;
        checkoutUrl: string;
      } | null;
      userErrors: Array<{ field: string[]; message: string }>;
    };
  }>({ query });

  return data.cartCreate;
}

export async function addToCart({
  cartId,
  merchandiseId,
  customAttributes,
}: {
  cartId: string;
  merchandiseId: string;
  customAttributes: Array<{ key: string; value: string }>;
}) {
  const query = `
    mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
          id
          checkoutUrl
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    cartId,
    lines: [
      {
        merchandiseId,
        quantity: 1,
        attributes: customAttributes,
      },
    ],
  };

  const data = await shopifyFetch<{
    cartLinesAdd: {
      cart: {
        id: string;
        checkoutUrl: string;
      } | null;
      userErrors: Array<{ field: string[]; message: string }>;
    };
  }>({
    query,
    variables,
  });

  return data.cartLinesAdd;
}

export async function getFirstProductVariantId() {
  const query = `
    query getProducts {
      products(first: 10) {
        edges {
          node {
            id
            title
            variants(first: 1) {
              edges {
                node {
                  id
                }
              }
            }
          }
        }
      }
    }
  `;

  const data = await shopifyFetch<{
    products: {
      edges: Array<{
        node: {
          id: string;
          title: string;
          variants: {
            edges: Array<{
              node: {
                id: string;
              };
            }>;
          };
        };
      }>;
    };
  }>({ query });

  const product = data.products.edges.find((edge) =>
    edge.node.title.toLowerCase().includes("custom glove")
  );

  const variantId = product?.node.variants.edges[0]?.node.id;

  if (!variantId) {
    throw new Error('Could not find a variant for "Custom Glove"');
  }

  return variantId;
}