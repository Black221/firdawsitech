// src/app/features/products/services/products.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, CreateProductRequest, UpdateProductRequest, UpdateProductFlagsRequest, ProductImage, ReorderPayload } from '../../../../core/models/product-model';
import { environment } from '../../../../../environments/environment';

export interface VitrineResponse {
  featured: Product[];
  carousel: Product[];
  categories: string[];
  topRated: Product[];
}

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private readonly apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) { }

  getVitrine(): Observable<VitrineResponse> {
    return this.http.get<VitrineResponse>(`${environment.apiUrl}/vitrine`);
  }

  getVitrineProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${environment.apiUrl}/vitrine/all`);
  }

  // Product CRUD
  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  getProductById(uuid: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${uuid}`);
  }

  getProductFromShopById(uuid: string): Observable<Product> {
    return this.http.get<Product>(`${environment.apiUrl}/shop/${uuid}`);
  }

  createProduct(product: CreateProductRequest): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  updateProduct(uuid: string, product: UpdateProductRequest): Observable<Product> {
    return this.http.patch<Product>(`${this.apiUrl}/${uuid}`, product);
  }

  deleteProduct(uuid: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${uuid}`);
  }

  // Search
  searchProducts(query?: string, category?: string): Observable<Product[]> {
    let params = new HttpParams();
    if (query) params = params.set('q', query);
    if (category) params = params.set('category', category);

    return this.http.get<Product[]>(`${this.apiUrl}/search`, { params });
  }

  // Featured & Carousel
  getFeaturedProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/featured`);
  }

  getCarouselProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/carousel`);
  }

  updateProductFlags(uuid: string, flags: UpdateProductFlagsRequest): Observable<Product> {
    return this.http.patch<Product>(`${this.apiUrl}/${uuid}/flags`, flags);
  }

  // Images
  getProductImages(uuid: string): Observable<ProductImage[]> {
    return this.http.get<ProductImage[]>(`${this.apiUrl}/${uuid}/images`);
  }

  uploadProductImages(uuid: string, files: File[]): Observable<ProductImage[]> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    return this.http.post<ProductImage[]>(`${this.apiUrl}/${uuid}/images`, formData);
  }

  setPrimaryImage(productUuid: string, imageUuid: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${productUuid}/images/${imageUuid}/primary`, {});
  }

  reorderImages(uuid: string, payload: ReorderPayload): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${uuid}/images/reorder`, payload);
  }

  deleteProductImage(productUuid: string, imageUuid: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${productUuid}/images/${imageUuid}`);
  }

  // Generic upload
  uploadGenericImage(file: File): Observable<{ url: string; filename: string; size: number; contentType: string }> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<any>(`${environment.apiUrl}/uploads/images`, formData);
  }
}