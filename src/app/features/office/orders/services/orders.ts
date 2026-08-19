// src/app/features/orders/services/orders.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { OrderStatus, Order, CreateOrderRequest } from '../../../../core/models/order-model';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private readonly apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  getAllOrders(status?: OrderStatus): Observable<Order[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<Order[]>(this.apiUrl, { params });
  }

  getOrderById(uuid: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${uuid}`);
  }

  checkout(order: CreateOrderRequest): Observable<Order> {
    return this.http.post<Order>(`${environment.apiUrl}/shop/checkout`, order);
  }

  createOrder(order: CreateOrderRequest): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, order);
  }

  markAsPaid(uuid: string): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/${uuid}/pay`, {});
  }

  markAsShipped(uuid: string): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/${uuid}/ship`, {});
  }

  cancelOrder(uuid: string): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/${uuid}/cancel`, {});
  }

  updateOrderStatus(uuid: string, status: OrderStatus):  Observable<Order> {
    switch(status) {
      case 'PAID': return this.markAsPaid(uuid);
      case 'SHIPPED': return this.markAsPaid(uuid);
      case 'CANCELED': return this.markAsPaid(uuid);
      default: throw new Error();
    }
  }
}