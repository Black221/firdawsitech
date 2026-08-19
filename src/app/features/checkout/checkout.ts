import { Component, computed, OnInit, signal } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { OrdersService } from '../office/orders/services/orders';
import { CartService, CartItem } from '../shop/services/cart-service';
import { CreateOrderRequest, OrderItem } from '../../core/models/order-model';

interface CheckoutData {
  // Customer Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  
  // Delivery Address
  address: string;
  city: string;
  postalCode: string;
  country: string;
  
  // Order Details
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  
  // Payment
  paymentMethod: string;
  
  // Additional
  notes?: string;
}

@Component({
  selector: 'app-checkout',
  standalone: false,
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss',
})
export class Checkout implements OnInit {
  // Forms
  customerForm!: FormGroup;
  deliveryForm!: FormGroup;
  
  // State
  currentStep = signal(1);
  isProcessing = signal(false);
  orderSuccess = signal(false);
  orderUuid = signal('');

  // Cart data
  cartItems;
  
  // Computed values
  subtotal = computed(() => this.cartService.totalAmount());
  shippingCost = signal(5000); // 5000 XOF flat rate
  taxRate = 0.18; // 18% TVA
  tax = computed(() => Math.round(this.subtotal() * this.taxRate));
  total = computed(() => this.subtotal() + this.shippingCost() + this.tax());

  // Payment methods
  paymentMethods = [
    { id: 'cash', name: 'Paiement à la livraison', icon: 'cash' },
    { id: 'card', name: 'Carte bancaire', icon: 'card' },
    { id: 'mobile', name: 'Mobile Money (Orange/Wave)', icon: 'mobile' }
  ];

  selectedPaymentMethod = signal('cash');

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private ordersService: OrdersService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.cartItems = this.cartService.cartItems;

  }

  ngOnInit(): void {
    // Check if cart is empty
    if (this.cartItems().length === 0) {
      this.snackBar.open('Votre panier est vide', 'Fermer', { duration: 3000 });
      this.router.navigate(['/boutique']);
      return;
    }

    this.initForms();
  }

  initForms(): void {
    // Customer Information Form
    this.customerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[+]?[\d\s-()]+$/)]]
    });

    // Delivery Address Form
    this.deliveryForm = this.fb.group({
      address: ['', [Validators.required, Validators.minLength(10)]],
    });

  }

  // Navigation between steps
  nextStep(): void {
    if (this.currentStep() === 1 && this.customerForm.valid) {
      this.currentStep.set(2);
    } else if (this.currentStep() === 2 && this.deliveryForm.valid) {
      this.processOrder();

    } else {
      this.markFormGroupTouched(this.getCurrentForm());
      this.snackBar.open('Veuillez remplir tous les champs requis', 'Fermer', { duration: 3000 });
    }
  }

  previousStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update(step => step - 1);
    }
  }

  goToStep(step: number): void {
    // Can only go back or to completed steps
    if (step < this.currentStep()) {
      this.currentStep.set(step);
    }
  }

  getCurrentForm(): FormGroup {
    switch (this.currentStep()) {
      case 1: return this.customerForm;
      case 2: return this.deliveryForm;
      default: return this.customerForm;
    }
  }



  processOrder(): void {
    if (!this.customerForm.valid || !this.deliveryForm.valid) {
      this.snackBar.open('Veuillez vérifier les informations', 'Fermer', { duration: 3000 });
      return;
    }

    this.isProcessing.set(true);

    // Prepare order data
    const checkoutData: CreateOrderRequest = {
      // Customer
      customerName: this.customerForm.value.name,
      customerEmail: this.customerForm.value.email,
      customerPhone: this.customerForm.value.phone,
      
      // Delivery
      customerAddress: this.deliveryForm.value.address,
      
      // Order
      items: this.cartItems().map(item => ({
        productUuid: item.product.uuid,
        productName: item.product.name,
        quantity: item.quantity,
        unitPrice: item.product.price,
        totalPrice: item.product.price * item.quantity
      })),
    };

    // Submit order
    this.ordersService.checkout(checkoutData).subscribe({
      next: (response) => {
        this.isProcessing.set(false);
        this.orderSuccess.set(true);
        this.orderUuid.set(response.uuid);

        // Clear cart
        this.cartService.clearCart();

        // Show success message
        this.snackBar.open('Commande passée avec succès !', 'Fermer', { 
          duration: 5000,
          panelClass: ['success-snackbar']
        });
      },
      error: (error) => {
        console.error('Error processing order:', error);
        this.isProcessing.set(false);
        this.snackBar.open('Erreur lors de la commande. Veuillez réessayer.', 'Fermer', { 
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  

  getPaymentMethodName(methodId: string): string {
    const method = this.paymentMethods.find(m => m.id === methodId);
    return method ? method.name : methodId;
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  // Navigation actions
  continueShopping(): void {
    this.router.navigate(['/boutique']);
  }

  viewOrderDetails(): void {
    if (this.orderUuid()) {
      this.router.navigate(['/orders', this.orderUuid()]);
    }
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }

  // Utilities
  getPriceFormatted(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price);
  }

  getMainImage(item: CartItem): string {
    const product = item.product;
    if (product.images && product.images.length > 0) {
      const primaryImage = product.imageUrl
      return primaryImage ? primaryImage : product.images[0].url;
    }
    return product.imageUrl || 'assets/images/no-image.png';
  }
}