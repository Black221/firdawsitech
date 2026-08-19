import { Injectable, signal, computed } from '@angular/core';
import { Product } from '../../../core/models/product-model';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  // State
  private items = signal<CartItem[]>([]);

  // Computed
  readonly cartItems = this.items.asReadonly();
  
  readonly itemCount = computed(() => 
    this.items().reduce((total, item) => total + item.quantity, 0)
  );

  readonly totalAmount = computed(() => 
    this.items().reduce((total, item) => total + (item.product.price * item.quantity), 0)
  );

  constructor() {
    this.loadFromStorage();
  }

  addItem(product: Product, quantity: number = 1): void {
    const currentItems = this.items();
    const existingItemIndex = currentItems.findIndex(
      item => item.product.uuid === product.uuid
    );

    if (existingItemIndex > -1) {
      // Update quantity if item exists
      const updatedItems = [...currentItems];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + quantity
      };
      this.items.set(updatedItems);
    } else {
      // Add new item
      this.items.update(items => [...items, { product, quantity }]);
    }

    this.saveToStorage();
  }

  removeItem(productUuid: string): void {
    this.items.update(items => 
      items.filter(item => item.product.uuid !== productUuid)
    );
    this.saveToStorage();
  }

  updateQuantity(productUuid: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(productUuid);
      return;
    }

    this.items.update(items =>
      items.map(item =>
        item.product.uuid === productUuid
          ? { ...item, quantity }
          : item
      )
    );
    this.saveToStorage();
  }

  incrementQuantity(productUuid: string): void {
    this.items.update(items =>
      items.map(item =>
        item.product.uuid === productUuid
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
    this.saveToStorage();
  }

  decrementQuantity(productUuid: string): void {
    const item = this.items().find(i => i.product.uuid === productUuid);
    if (item && item.quantity > 1) {
      this.items.update(items =>
        items.map(i =>
          i.product.uuid === productUuid
            ? { ...i, quantity: i.quantity - 1 }
            : i
        )
      );
      this.saveToStorage();
    } else {
      this.removeItem(productUuid);
    }
  }

  clearCart(): void {
    this.items.set([]);
    this.saveToStorage();
  }

  private saveToStorage(): void {
    const cartData = this.items().map(item => ({
      productUuid: item.product.uuid,
      quantity: item.quantity,
      product: item.product
    }));
    localStorage.setItem('cart', JSON.stringify(cartData));
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('cart');
      if (stored) {
        const cartData = JSON.parse(stored);
        this.items.set(
          cartData.map((item: any) => ({
            product: item.product,
            quantity: item.quantity
          }))
        );
      }
    } catch (error) {
      console.error('Error loading cart from storage:', error);
    }
  }
}