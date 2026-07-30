"use client";

import { useCallback, useSyncExternalStore } from "react";

export type CartItem = {
  productId: string;
  productSlug: string;
  productName: string;
  productNameUr?: string;
  productImage?: string;
  packageType: string;
  packageName: string;
  packageNameUr?: string;
  isPreorder?: boolean;
  preorderNote?: string;
  preorderNoteUr?: string;
  unitPrice: number;
  originalPrice: number;
  bottles: number;
  quantity: number;
};

export type Cart = {
  items: CartItem[];
  updatedAt: number;
};

const CART_KEY = "upderma_cart";

function getEmptyCart(): Cart {
  return { items: [], updatedAt: Date.now() };
}

function loadCart(): Cart {
  try {
    const stored = localStorage.getItem(CART_KEY);
    return stored ? (JSON.parse(stored) as Cart) : getEmptyCart();
  } catch {
    return getEmptyCart();
  }
}

let listeners: Array<() => void> = [];
let currentCart = getEmptyCart();
let initialized = false;

function initCart(): void {
  if (!initialized) {
    currentCart = loadCart();
    initialized = true;
  }
}

function saveCart(cart: Cart): void {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch {
    // The in-memory cart still works when storage is blocked.
  }
  for (const listener of listeners) listener();
}

function emitChange(): void {
  saveCart(currentCart);
}

function subscribe(listener: () => void): () => void {
  initCart();
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((candidate) => candidate !== listener);
  };
}

function getSnapshot(): Cart {
  initCart();
  return currentCart;
}

const SERVER_SNAPSHOT: Cart = { items: [], updatedAt: 0 };

function getServerSnapshot(): Cart {
  return SERVER_SNAPSHOT;
}

let cartDrawerRequestVersion = 0;
let cartDrawerListeners: Array<() => void> = [];

export function emitCartDrawerRequest(): void {
  cartDrawerRequestVersion += 1;
  for (const listener of cartDrawerListeners) listener();
}

function subscribeCartDrawerRequest(listener: () => void): () => void {
  cartDrawerListeners = [...cartDrawerListeners, listener];
  return () => {
    cartDrawerListeners = cartDrawerListeners.filter(
      (candidate) => candidate !== listener,
    );
  };
}

function getCartDrawerRequestSnapshot(): number {
  return cartDrawerRequestVersion;
}

function getCartDrawerRequestServerSnapshot(): number {
  return 0;
}

export function addToCart(
  item: Omit<CartItem, "quantity"> & { quantity?: number },
): void {
  initCart();
  const quantity = item.quantity || 1;
  const existing = currentCart.items.find(
    (candidate) =>
      candidate.productSlug === item.productSlug &&
      candidate.packageType === item.packageType,
  );
  if (existing) existing.quantity += quantity;
  else currentCart.items.push({ ...item, quantity });
  currentCart = { ...currentCart, updatedAt: Date.now() };
  emitChange();
  emitCartDrawerRequest();
}

export function removeFromCart(
  productSlug: string,
  packageType: string,
): void {
  initCart();
  currentCart = {
    items: currentCart.items.filter(
      (item) =>
        item.productSlug !== productSlug || item.packageType !== packageType,
    ),
    updatedAt: Date.now(),
  };
  emitChange();
}

export function updateQuantity(
  productSlug: string,
  packageType: string,
  quantity: number,
): void {
  initCart();
  if (quantity <= 0) {
    removeFromCart(productSlug, packageType);
    return;
  }
  const item = currentCart.items.find(
    (candidate) =>
      candidate.productSlug === productSlug &&
      candidate.packageType === packageType,
  );
  if (!item) return;
  item.quantity = quantity;
  currentCart = { ...currentCart, updatedAt: Date.now() };
  emitChange();
}

export function clearCart(): void {
  currentCart = getEmptyCart();
  emitChange();
}

export function getCartTotals(cart: Cart): {
  itemCount: number;
  subtotal: number;
  savings: number;
} {
  return {
    itemCount: cart.items.reduce((total, item) => total + item.quantity, 0),
    subtotal: cart.items.reduce(
      (total, item) => total + item.unitPrice * item.quantity,
      0,
    ),
    savings: cart.items.reduce(
      (total, item) =>
        total + (item.originalPrice - item.unitPrice) * item.quantity,
      0,
    ),
  };
}

export function useCart() {
  const cart = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const totals = getCartTotals(cart);
  return {
    cart,
    items: cart.items,
    ...totals,
    addToCart: useCallback(addToCart, []),
    removeFromCart: useCallback(removeFromCart, []),
    updateQuantity: useCallback(updateQuantity, []),
    clearCart: useCallback(clearCart, []),
  };
}

export function useCartDrawerRequest(): number {
  return useSyncExternalStore(
    subscribeCartDrawerRequest,
    getCartDrawerRequestSnapshot,
    getCartDrawerRequestServerSnapshot,
  );
}
