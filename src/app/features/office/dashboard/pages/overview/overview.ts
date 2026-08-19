import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { Order, OrderStatus } from '../../../../../core/models/order-model';
import { Product } from '../../../../../core/models/product-model';
import { OrdersService } from '../../../orders/services/orders';
import { ProductsService } from '../../../products/services/products';

interface DashboardStats {
  totalProducts: number;
  productsInStock: number;
  productsOutOfStock: number;
  featuredProducts: number;
  totalOrders: number;
  newOrders: number;
  paidOrders: number;
  shippedOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}
@Component({
  selector: 'app-overview',
  standalone: false,
  templateUrl: './overview.html',
  styleUrl: './overview.scss',
})
export class Overview  implements OnInit {
  loading = true;
  stats: DashboardStats = {
    totalProducts: 0,
    productsInStock: 0,
    productsOutOfStock: 0,
    featuredProducts: 0,
    totalOrders: 0,
    newOrders: 0,
    paidOrders: 0,
    shippedOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0
  };

  recentOrders: Order[] = [];
  featuredProducts: Product[] = [];

  constructor(
    private productsService: ProductsService,
    private ordersService: OrdersService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;

    forkJoin({
      products: this.productsService.getAllProducts(),
      orders: this.ordersService.getAllOrders(),
      featured: this.productsService.getFeaturedProducts()
    }).subscribe({
      next: ({ products, orders, featured }) => {
        this.calculateStats(products, orders);
        this.recentOrders = orders.slice(0, 5);
        this.featuredProducts = featured.slice(0, 4);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.loading = false;
      }
    });
  }


  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }

  calculateStats(products: Product[], orders: Order[]): void {
    // Product stats
    this.stats.totalProducts = products.length;
    this.stats.productsInStock = products.filter(p => p.inStock).length;
    this.stats.productsOutOfStock = products.filter(p => !p.inStock).length;
    this.stats.featuredProducts = products.filter(p => p.featured).length;

    // Order stats
    this.stats.totalOrders = orders.length;
    this.stats.newOrders = orders.filter(o => o.status === OrderStatus.NEW).length;
    this.stats.paidOrders = orders.filter(o => o.status === OrderStatus.PAID).length;
    this.stats.shippedOrders = orders.filter(o => o.status === OrderStatus.SHIPPED).length;

    // Revenue stats
    const paidAndShippedOrders = orders.filter(
      o => o.status === OrderStatus.PAID || o.status === OrderStatus.SHIPPED
    );
    this.stats.totalRevenue = paidAndShippedOrders.reduce(
      (sum, order) => sum + order.totalAmount, 
      0
    );
    this.stats.averageOrderValue = paidAndShippedOrders.length > 0
      ? this.stats.totalRevenue / paidAndShippedOrders.length
      : 0;
  }

  getStatusLabel(status: OrderStatus): string {
    const labels = {
      [OrderStatus.NEW]: 'Nouveau',
      [OrderStatus.PAID]: 'Payé',
      [OrderStatus.SHIPPED]: 'Expédié',
      [OrderStatus.CANCELED]: 'Annulé'
    };
    return labels[status] || status;
  }
}