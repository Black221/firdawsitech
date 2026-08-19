import { Component, OnInit, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Order } from '../../../../../core/models/order-model';
import { OrdersService } from '../../services/orders';

@Component({
  selector: 'app-order-detail',
  standalone: false,
  templateUrl: './order-detail.html',
  styleUrl: './order-detail.scss',
})
export class OrderDetail implements OnInit {
  order = signal<Order | null>(null);
  isLoading = signal(true);
  notFound = signal(false);

  // Status configuration
  statusConfig = {
    pending: {
      label: 'En attente',
      color: 'bg-yellow-100 text-yellow-800',
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    processing: {
      label: 'En cours de traitement',
      color: 'bg-blue-100 text-blue-800',
      icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
    },
    shipped: {
      label: 'Expédiée',
      color: 'bg-purple-100 text-purple-800',
      icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4'
    },
    delivered: {
      label: 'Livrée',
      color: 'bg-green-100 text-green-800',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    cancelled: {
      label: 'Annulée',
      color: 'bg-red-100 text-red-800',
      icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
    }
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ordersService: OrdersService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const uuid = this.route.snapshot.paramMap.get('uuid');
    if (uuid) {
      this.loadOrder(uuid);
    } else {
      this.notFound.set(true);
      this.isLoading.set(false);
    }
  }

  loadOrder(uuid: string): void {
    this.isLoading.set(true);
    
    this.ordersService.getOrderById(uuid).subscribe({
      next: (order) => {
        this.order.set(order);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading order:', error);
        this.isLoading.set(false);
        
        if (error.status === 404) {
          this.notFound.set(true);
        } else {
          this.snackBar.open('Erreur lors du chargement de la commande', 'Fermer', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      }
    });
  }

  getStatusConfig(status: string) {
    return this.statusConfig[status as keyof typeof this.statusConfig] || this.statusConfig.pending;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  printOrder(): void {
    window.print();
  }

  downloadInvoice(): void {
    const order = this.order();
    if (!order) return;

    this.snackBar.open('Téléchargement de la facture...', '', {
      duration: 2000
    });

    // TODO: Implémenter le téléchargement de facture PDF
    // this.ordersService.downloadInvoice(order.uuid).subscribe(...)
  }

  trackOrder(): void {
    const order = this.order();
    if (!order || !order.orderNumber) return;

    // TODO: Implémenter le suivi de commande
    this.snackBar.open('Fonctionnalité de suivi bientôt disponible', 'Fermer', {
      duration: 3000
    });
  }

  cancelOrder(): void {
    const order = this.order();
    if (!order) return;

    if (confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) {
      this.ordersService.cancelOrder(order.uuid).subscribe({
        next: () => {
          this.snackBar.open('Commande annulée avec succès', 'Fermer', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadOrder(order.uuid);
        },
        error: (error) => {
          console.error('Error cancelling order:', error);
          this.snackBar.open('Erreur lors de l\'annulation', 'Fermer', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/office/orders']);
  }

  goToProduct(productUuid: string): void {
    this.router.navigate(['/boutique/products', productUuid]);
  }

  contactSupport(): void {
    // TODO: Implémenter contact support
    this.snackBar.open('Fonctionnalité bientôt disponible', 'Fermer', {
      duration: 3000
    });
  }
}




