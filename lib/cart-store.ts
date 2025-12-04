// ============================================================================
// FoodFast Pro - Cart Store (Zustand)
// ============================================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, CartStore, Product, Modifier } from './types';

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (product: Product, modifiers: Modifier[]) => {
                const items = get().items;

                // Calculate item subtotal
                const modifierTotal = modifiers.reduce(
                    (sum, mod) => sum + mod.additional_price,
                    0
                );
                const itemPrice = product.discount_price || product.price;
                const subtotal = itemPrice + modifierTotal;

                // Check if item with same product and modifiers already exists
                const existingItemIndex = items.findIndex(
                    (item) =>
                        item.product.id === product.id &&
                        JSON.stringify(item.modifiers_selected.map((m) => m.id).sort()) ===
                        JSON.stringify(modifiers.map((m) => m.id).sort())
                );

                if (existingItemIndex !== -1) {
                    // Update quantity of existing item
                    const updatedItems = [...items];
                    updatedItems[existingItemIndex].quantity += 1;
                    updatedItems[existingItemIndex].subtotal += subtotal;
                    set({ items: updatedItems });
                } else {
                    // Add new item
                    const newItem: CartItem = {
                        product,
                        quantity: 1,
                        modifiers_selected: modifiers,
                        subtotal,
                    };
                    set({ items: [...items, newItem] });
                }
            },

            removeItem: (productId: string) => {
                set({ items: get().items.filter((item) => item.product.id !== productId) });
            },

            updateQuantity: (productId: string, quantity: number) => {
                if (quantity <= 0) {
                    get().removeItem(productId);
                    return;
                }

                const items = get().items;
                const itemIndex = items.findIndex((item) => item.product.id === productId);

                if (itemIndex !== -1) {
                    const updatedItems = [...items];
                    const item = updatedItems[itemIndex];

                    // Recalculate subtotal based on new quantity
                    const modifierTotal = item.modifiers_selected.reduce(
                        (sum, mod) => sum + mod.additional_price,
                        0
                    );
                    const itemPrice = item.product.discount_price || item.product.price;
                    const unitPrice = itemPrice + modifierTotal;

                    updatedItems[itemIndex].quantity = quantity;
                    updatedItems[itemIndex].subtotal = unitPrice * quantity;

                    set({ items: updatedItems });
                }
            },

            clearCart: () => {
                set({ items: [] });
            },

            getTotal: () => {
                return get().items.reduce((sum, item) => sum + item.subtotal, 0);
            },

            getItemCount: () => {
                return get().items.reduce((sum, item) => sum + item.quantity, 0);
            },
        }),
        {
            name: 'foodfast-cart-storage', // LocalStorage key
        }
    )
);
