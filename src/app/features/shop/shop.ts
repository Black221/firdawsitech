import { Component, computed, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from '../../core/models/product-model';
import { ProductsService } from '../office/products/services/products';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CartService } from './services/cart-service';
import { SeoService } from '../../core/services/seo';

type ViewMode = 'grid' | 'list';
type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'rating';

@Component({
  selector: 'app-shop',
  standalone: false,
  templateUrl: './shop.html',
  styleUrl: './shop.scss',
})
export class Shop implements  OnInit {
  // State signals
  products = signal<Product[]>([]);
  loading = signal(false);
  viewMode = signal<ViewMode>('grid');
  
  // Filters
  searchQuery = signal('');
  selectedCategory = signal<string>('all');
  minPrice = signal<number>(0);
  maxPrice = signal<number>(10000000);
  sortBy = signal<SortOption>('newest');
  onlyInStock = signal(false);
  onlyFeatured = signal(false);

  // Computed signals
  categories = computed(() => {
    const cats = new Set(
      this.products()
        .filter(p => p.category)
        .map(p => p.category!)
    );
    return Array.from(cats).sort();
  });

  filteredProducts = computed(() => {
    let filtered = this.products();

    // Search filter
    const query = this.searchQuery().toLowerCase();
    if (query) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query)
      );
    }

    // Category filter
    const category = this.selectedCategory();
    if (category !== 'all') {
      filtered = filtered.filter(p => p.category === category);
    }

    // Price range filter
    const min = this.minPrice();
    const max = this.maxPrice();
    filtered = filtered.filter(p => p.price >= min && p.price <= max);

    // Stock filter
    if (this.onlyInStock()) {
      filtered = filtered.filter(p => p.inStock);
    }

    // Featured filter
    if (this.onlyFeatured()) {
      filtered = filtered.filter(p => p.featured);
    }

    // Sort
    const sortBy = this.sortBy();
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });

    return filtered;
  });

  priceRange = computed(() => {
    const products = this.products();
    if (products.length === 0) return { min: 0, max: 10000000 };
    
    const prices = products.map(p => p.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  });

  constructor(
    private productsService: ProductsService,
    private cartService: CartService,
    private router: Router,
    private snackBar: MatSnackBar,
    private seo: SeoService
  ) {}

  ngOnInit(): void {
    this.seo.update({
      title: 'Boutique - Ordinateurs, accessoires et équipements informatiques',
      description: "Parcourez notre catalogue d'ordinateurs, accessoires et équipements électro-informatiques disponibles à Dakar, Sénégal.",
      path: '/boutique',
      type: 'website',
    });
    this.loadProducts();
    this.initializePriceRange();
  }

  loadProducts(): void {
    this.loading.set(true);
    this.productsService.getVitrineProducts().subscribe({
      next: (products) => {
        // Only show products in stock for shop
        this.products.set(products.filter(p => p.inStock));
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.snackBar.open('Erreur lors du chargement des produits', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.loading.set(false);
      }
    });
  }

  initializePriceRange(): void {
    // Wait for products to load, then set initial price range
    setTimeout(() => {
      const range = this.priceRange();
      this.minPrice.set(range.min);
      this.maxPrice.set(range.max);
    }, 100);
  }

  onViewProduct(product: Product): void {
    this.router.navigate(['/boutique', product.slug]);
  }

  onAddToCart(product: Product, event: Event): void {
    event.stopPropagation();
    
    this.cartService.addItem(product, 1);
    
    this.snackBar.open(`${product.name} ajouté au panier`, 'Voir le panier', {
      duration: 3000,
      panelClass: ['success-snackbar']
    }).onAction().subscribe(() => {
      this.router.navigate(['/panier']);
    });
  }

  onQuickView(product: Product, event: Event): void {
    event.stopPropagation();
    // TODO: Open quick view modal
    this.snackBar.open('Aperçu rapide en développement', 'Fermer', {
      duration: 2000,
      panelClass: ['info-snackbar']
    });
  }

  onClearFilters(): void {
    this.searchQuery.set('');
    this.selectedCategory.set('all');
    const range = this.priceRange();
    this.minPrice.set(range.min);
    this.maxPrice.set(range.max);
    this.onlyInStock.set(false);
    this.onlyFeatured.set(false);
  }

  hasActiveFilters(): boolean {
    const range = this.priceRange();
    return (
      this.searchQuery() !== '' ||
      this.selectedCategory() !== 'all' ||
      this.minPrice() !== range.min ||
      this.maxPrice() !== range.max ||
      this.onlyInStock() ||
      this.onlyFeatured()
    );
  }

  getPriceFormatted(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price);
  }

  getMainImage(product: Product): string {
    if (product.images && product.images.length > 0) {
      const primaryImage = product.imageUrl;
      return primaryImage ? primaryImage : product.images[0].url;
    }
    return product.imageUrl || 'assets/images/no-image.png';
  }

  getRatingStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < Math.floor(rating) ? 1 : 0);
  }
}