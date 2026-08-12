export type CartItemType = "custom" | "prebuilt";

export type CartItem = {
  id: string;
  type: CartItemType;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  configuration?: Record<string, unknown>;
};

const CART_KEY = "ballerzCart";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const savedCart = localStorage.getItem(CART_KEY);

    if (!savedCart) {
      return [];
    }

    const parsedCart = JSON.parse(savedCart);

    return Array.isArray(parsedCart) ? parsedCart : [];
  } catch (error) {
    console.error("Could not read cart:", error);
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(CART_KEY, JSON.stringify(items));

  window.dispatchEvent(new Event("ballerz-cart-updated"));
}

export function addCartItem(item: CartItem) {
  const cart = getCart();

  const existingItem = cart.find(
    (cartItem) =>
      cartItem.id === item.id &&
      cartItem.type === "prebuilt"
  );

  if (existingItem) {
    existingItem.quantity += item.quantity;
    saveCart(cart);
    return;
  }

  saveCart([...cart, item]);
}

export function removeCartItem(id: string) {
  const updatedCart = getCart().filter(
    (item) => item.id !== id
  );

  saveCart(updatedCart);
}

export function updateCartQuantity(
  id: string,
  quantity: number
) {
  const safeQuantity = Math.max(1, quantity);

  const updatedCart = getCart().map((item) =>
    item.id === id
      ? {
          ...item,
          quantity: safeQuantity,
        }
      : item
  );

  saveCart(updatedCart);
}

export function getCartItemCount() {
  return getCart().reduce(
    (total, item) => total + item.quantity,
    0
  );
}

export function getCartSubtotal() {
  return getCart().reduce(
    (total, item) =>
      total + item.price * item.quantity,
    0
  );
}

export function clearCart() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(CART_KEY);

  window.dispatchEvent(new Event("ballerz-cart-updated"));
}