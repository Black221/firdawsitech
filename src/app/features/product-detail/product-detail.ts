import { Component, computed, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { Product } from '../../core/models/product-model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductsService } from '../office/products/services/products';
import { CartService } from '../shop/services/cart-service';
import { SeoService } from '../../core/services/seo';

@Component({
  selector: 'app-product-detail',
  standalone: false,
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
})
export class ProductDetail   implements OnInit {
  // State
  product = signal<Product | null>(null);
  loading = signal(true);
  quantity = signal(1);
  selectedImageIndex = signal(0);

  // Computed
  selectedImage = computed(() => {
    const prod = this.product();
    if (!prod) return '';
    
    if (prod.images && prod.images.length > 0) {
      return prod.images[this.selectedImageIndex()]?.url || prod.images[0].url;
    }
    return prod.imageUrl || 'assets/images/no-image.png';
  });

  totalPrice = computed(() => {
    const prod = this.product();
    if (!prod) return 0;
    return prod.price * this.quantity();
  });

  // Related products (to be implemented)
  relatedProducts = signal<Product[]>([]);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productsService: ProductsService,
    private cartService: CartService,
    private snackBar: MatSnackBar,
    private seo: SeoService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const slug = params['slug'];
      if (slug) {
        this.loadProduct(slug);
      }
    });
  }

  loadProduct(slug: string): void {
    this.loading.set(true);
    this.productsService.getProductBySlug(slug).subscribe({
      next: (product) => {
        this.product.set(product);
        this.loading.set(false);
        this.loadRelatedProducts(product.category || '');

        const primaryImage = product.images?.find(i => i.primaryImage)?.url
          || product.images?.[0]?.url
          || product.imageUrl;
        this.seo.update({
          title: product.name,
          description: this.buildMetaDescription(product),
          path: `/boutique/${product.slug}`,
          image: primaryImage,
          type: 'product',
        });
      },
      error: (error) => {
        console.error('Error loading product:', error);
        this.loading.set(false);
        this.snackBar.open('Produit introuvable', 'Fermer', { duration: 3000 });
        this.router.navigate(['/boutique']);
      }
    });
  }

  loadRelatedProducts(category: string): void {
    this.productsService.getAllProducts().subscribe({
      next: (products) => {
        const related = products
          .filter(p => p.category === category && p.uuid !== this.product()?.uuid)
          .slice(0, 4);
        this.relatedProducts.set(related);
      },
      error: (error) => {
        console.error('Error loading related products:', error);
      }
    });
  }

  selectImage(index: number): void {
    this.selectedImageIndex.set(index);
  }

  incrementQuantity(): void {
    this.quantity.update(q => q + 1);
  }

  decrementQuantity(): void {
    if (this.quantity() > 1) {
      this.quantity.update(q => q - 1);
    }
  }

  onQuantityChange(event: any): void {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value) && value >= 1) {
      this.quantity.set(value);
    }
  }

  onAddToCart(): void {
    const prod = this.product();
    if (!prod) return;

    this.cartService.addItem(prod, this.quantity());

    this.snackBar.open(
      `${prod.name} ajouté au panier (${this.quantity()})`,
      'Voir le panier',
      { duration: 3000, panelClass: ['success-snackbar'] }
    ).onAction().subscribe(() => {
      this.router.navigate(['/panier']);
    });

    // Reset quantity
    this.quantity.set(1);
  }

  onBuyNow(): void {
    this.onAddToCart();
    this.router.navigate(['/panier']);
  }

  onBackToShop(): void {
    this.router.navigate(['/boutique']);
  }

  onViewRelatedProduct(product: Product): void {
    this.router.navigate(['/boutique', product.slug]);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Utilities
  private buildMetaDescription(product: Product): string {
    const base = (product.description || '').replace(/<[^>]*>/g, '').trim();
    const price = this.getPriceFormatted(product.price);
    const text = base
      ? `${product.name} - ${base}`
      : `${product.name} - Disponible à ${price} chez FirdawsiTech, Dakar.`;
    return text.length > 160 ? text.slice(0, 157).trimEnd() + '...' : text;
  }

  getPriceFormatted(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price);
  }

  getRatingStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < Math.floor(rating) ? 1 : 0);
  }

  getImages(): any[] {
    const prod = this.product();
    if (!prod) return [];
    
    if (prod.images && prod.images.length > 0) {
      return prod.images;
    }
    
    if (prod.imageUrl) {
      return [{ url: prod.imageUrl, isPrimary: true }];
    }
    
    return [{ url: 'assets/images/no-image.png', isPrimary: true }];
  }

  shareProduct(): void {
    const prod = this.product();
    if (!prod) return;

    const url = window.location.href;
    
    if (navigator.share) {
      navigator.share({
        title: prod.name,
        text: prod.description,
        url: url
      }).catch(err => console.log('Error sharing:', err));
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(url).then(() => {
        this.snackBar.open('Lien copié dans le presse-papier', 'Fermer', { duration: 2000 });
      });
    }
  }
}