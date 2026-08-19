import { Component, computed, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Order, OrderStatus } from '../../../../../core/models/order-model';
import { OrdersService } from '../../services/orders';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-order-list',
  standalone: false,
  templateUrl: './order-list.html',
  styleUrl: './order-list.scss',
})
export class OrderList   implements OnInit {
  // State signals
  orders = signal<Order[]>([]);
  loading = signal(false);
  searchQuery = signal('');
  selectedStatus = signal<OrderStatus | 'all'>('all');
  sortBy = signal<'date' | 'amount'>('date');
  sortOrder = signal<'asc' | 'desc'>('desc');

  // Computed signals
  filteredOrders = computed(() => {
    let filtered = this.orders();

    // Filter by search query
    const query = this.searchQuery().toLowerCase();
    if (query) {
      filtered = filtered.filter(order =>
        order.uuid.toLowerCase().includes(query)
      );
    }

    // Filter by status
    const status = this.selectedStatus();
    if (status !== 'all') {
      filtered = filtered.filter(order => order.status === status);
    }

    // Sort
    const sortBy = this.sortBy();
    const sortOrder = this.sortOrder();
    
    filtered = [...filtered].sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'date') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === 'amount') {
        comparison = a.totalAmount - b.totalAmount;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  });

  stats = computed(() => {
    const orders = this.orders();
    return {
      total: orders.length,
      new: orders.filter(o => o.status === 'NEW').length,
      paid: orders.filter(o => o.status === 'PAID').length,
      shipped: orders.filter(o => o.status === 'SHIPPED').length,
      canceled: orders.filter(o => o.status === 'CANCELED').length,
      totalRevenue: orders
        .filter(o => o.status === 'PAID' || o.status === 'SHIPPED')
        .reduce((sum, o) => sum + o.totalAmount, 0)
    };
  });

  constructor(
    private ordersService: OrdersService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading.set(true);
    this.ordersService.getAllOrders().subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.snackBar.open('Erreur lors du chargement des commandes', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.loading.set(false);
      }
    });
  }

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
  }

  onStatusChange(status: OrderStatus): void {
    this.selectedStatus.set(status);
  }

  onSortChange(sortBy: 'date' | 'amount'): void {
    if (this.sortBy() === sortBy) {
      // Toggle sort order if same field
      this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(sortBy);
      this.sortOrder.set('desc');
    }
  }

  onClearFilters(): void {
    this.searchQuery.set('');
    this.selectedStatus.set('all');
  }

  onViewOrder(order: Order): void {
    this.router.navigate(['/office/orders', order.uuid]);
  }

  onUpdateStatus(order: Order, newStatus: string, event: Event): void {
    event.stopPropagation();
    
    this.ordersService.updateOrderStatus(order.uuid, newStatus as OrderStatus).subscribe({
      next: (updatedOrder) => {
        // Update order in list
        this.orders.update(orders => 
          orders.map(o => o.uuid === order.uuid ? updatedOrder : o)
        );
        
        this.snackBar.open('Statut mis à jour', 'Fermer', {
          duration: 2000,
          panelClass: ['success-snackbar']
        });
      },
      error: (error) => {
        console.error('Error updating status:', error);
        this.snackBar.open('Erreur lors de la mise à jour', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  onDeleteOrder(order: Order, event: Event): void {
    event.stopPropagation();
    
    if (confirm(`Voulez-vous vraiment supprimer la commande ${order.uuid} ?`)) {
      this.ordersService.cancelOrder(order.uuid).subscribe({
        next: () => {
          this.orders.update(orders => orders.filter(o => o.uuid !== order.uuid));
          this.snackBar.open('Commande supprimée', 'Fermer', {
            duration: 2000,
            panelClass: ['success-snackbar']
          });
        },
        error: (error) => {
          console.error('Error deleting order:', error);
          this.snackBar.open('Erreur lors de la suppression', 'Fermer', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'NEW': 'Nouvelle',
      'PAID': 'Payée',
      'SHIPPED': 'Expédiée',
      'CANCELED': 'Annulée'
    };
    return labels[status] || status;
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'NEW': 'blue',
      'PAID': 'green',
      'SHIPPED': 'purple',
      'CANCELED': 'red'
    };
    return colors[status] || 'gray';
  }

  getPriceFormatted(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price);
  }

  getFormattedDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  getRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `Il y a ${diffMins} min`;
    } else if (diffHours < 24) {
      return `Il y a ${diffHours}h`;
    } else if (diffDays < 7) {
      return `Il y a ${diffDays}j`;
    } else {
      return this.getFormattedDate(dateString);
    }
  }

  exportOrders(): void {
    // TODO: Implement CSV export
    this.snackBar.open('Export en développement', 'Fermer', {
      duration: 2000,
      panelClass: ['info-snackbar']
    });
  }
}