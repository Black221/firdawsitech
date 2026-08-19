// src/app/core/models/product.model.ts

export interface Product {
  uuid: string;
  name: string;
  price: number;
  category?: string;
  imageUrl?: string;
  description?: string;
  specs: string[];
  inStock: boolean;
  rating?: number;
  featured: boolean;
  inCarousel: boolean;
  carouselRank?: number;
  images: ProductImage[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  uuid: string;
  url: string;
  contentType?: string;
  sizeBytes?: number;
  sortOrder?: number;
  primaryImage: boolean;
}

export interface CreateProductRequest {
  name: string;
  price: number;
  category?: string;
  imageUrl?: string;
  description?: string;
  specs?: string[];
  inStock: boolean;
  rating?: number;
  featured?: boolean;
  inCarousel?: boolean;
  carouselRank?: number;
}

export interface UpdateProductRequest {
  name?: string;
  price?: number;
  category?: string;
  imageUrl?: string;
  description?: string;
  specs?: string[];
  inStock?: boolean;
  rating?: number;
  featured?: boolean;
  inCarousel?: boolean;
  carouselRank?: number;
}

export interface UpdateProductFlagsRequest {
  featured?: boolean;
  inCarousel?: boolean;
  carouselRank?: number;
}

export interface ReorderPayload {
  entries: ReorderEntry[];
}

export interface ReorderEntry {
  imageUuid: string;
  sortOrder: number;
}