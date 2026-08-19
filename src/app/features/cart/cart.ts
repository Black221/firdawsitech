import { Component, computed, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Product } from '../../core/models/product-model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CartService } from '../shop/services/cart-service';


interface CartItem extends Product {
  quantity: number;
}

@Component({
  selector: 'app-cart',
  standalone: false,
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
})
export class Cart {
  // Cart state from service

  cartItems;
  itemCount;
  totalAmount;
  // Computed
  isEmpty = computed(() => this.cartItems().length === 0);

  constructor(
    private cartService: CartService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {

    this.cartItems = this.cartService.cartItems;
    this.itemCount = this.cartService.itemCount;
    this.totalAmount = this.cartService.totalAmount;
  }

  onIncrementQuantity(productUuid: string): void {
    this.cartService.incrementQuantity(productUuid);
  }

  onDecrementQuantity(productUuid: string): void {
    this.cartService.decrementQuantity(productUuid);
  }

  onUpdateQuantity(productUuid: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    const quantity = parseInt(input.value, 10);

    if (!isNaN(quantity) && quantity >= 0) {
      this.cartService.updateQuantity(productUuid, quantity);
    }
  }

  onRemoveItem(productUuid: string, productName: string): void {
    if (confirm(`Voulez-vous vraiment retirer "${productName}" du panier ?`)) {
      this.cartService.removeItem(productUuid);
      this.snackBar.open('Produit retiré du panier', 'Fermer', {
        duration: 2000,
        panelClass: ['success-snackbar']
      });
    }
  }

  onClearCart(): void {
    if (confirm('Voulez-vous vraiment vider le panier ?')) {
      this.cartService.clearCart();
      this.snackBar.open('Panier vidé', 'Fermer', {
        duration: 2000,
        panelClass: ['success-snackbar']
      });
    }
  }

  onContinueShopping(): void {
    this.router.navigate(['/boutique']);
  }

  onCheckout(): void {
    this.router.navigate(['/checkout']);
  }

  getPriceFormatted(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price);
  }

  getMainImage(product: any): string {
    if (product.images && product.images.length > 0) {
      const primaryImage = product.images.find((img: any) => img.isPrimary);
      return primaryImage ? primaryImage.url : product.images[0].url;
    }
    return product.imageUrl || 'assets/images/no-image.png';
  }

  getSubtotal(item: any): number {
    return item.product.price * item.quantity;
  }
}