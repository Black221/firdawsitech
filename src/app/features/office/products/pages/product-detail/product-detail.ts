import { Component, OnInit, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '../../../../../core/models/product-model';
import { ProductsService } from '../../services/products';

@Component({
  selector: 'app-product-detail',
  standalone: false,
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
})
export class ProductDetail  implements OnInit {
  product = signal<Product | null>(null);
  loading = signal(true);
  selectedImageIndex = signal(0);
  
  // Computed
  get currentImage(): string {
    const product = this.product();
    if (!product || !product.images || product.images.length === 0) {
      return 'assets/images/no-image.png';
    }
    return product.images[this.selectedImageIndex()]?.url || 'assets/images/no-image.png';
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productsService: ProductsService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const uuid = params['uuid'];
      if (uuid) {
        this.loadProduct(uuid);
      }
    });
  }

  loadProduct(uuid: string): void {
    this.loading.set(true);
    this.productsService.getProductById(uuid).subscribe({
      next: (product) => {
        this.product.set(product);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading product:', error);
        this.snackBar.open('Erreur lors du chargement du produit', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.loading.set(false);
        this.router.navigate(['/office/products']);
      }
    });
  }

  onEdit(): void {
    const product = this.product();
    if (product) {
      this.router.navigate(['/office/products', product.uuid, 'edit']);
    }
  }

  onDelete(): void {
    const product = this.product();
    if (!product) return;

    if (confirm(`Êtes-vous sûr de vouloir supprimer "${product.name}" ?`)) {
      this.productsService.deleteProduct(product.uuid).subscribe({
        next: () => {
          this.snackBar.open('Produit supprimé avec succès', 'Fermer', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/office/products']);
        },
        error: (error) => {
          console.error('Error deleting product:', error);
          this.snackBar.open('Erreur lors de la suppression', 'Fermer', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  onToggleFeatured(): void {
    const product = this.product();
    if (!product) return;

    this.productsService.updateProductFlags(product.uuid, {
      featured: !product.featured
    }).subscribe({
      next: (updatedProduct) => {
        this.product.set(updatedProduct);
        const message = updatedProduct.featured 
          ? 'Produit ajouté aux vedettes' 
          : 'Produit retiré des vedettes';
        
        this.snackBar.open(message, 'Fermer', {
          duration: 2000,
          panelClass: ['success-snackbar']
        });
      },
      error: (error) => {
        console.error('Error updating product:', error);
        this.snackBar.open('Erreur lors de la mise à jour', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  onToggleCarousel(): void {
    const product = this.product();
    if (!product) return;

    this.productsService.updateProductFlags(product.uuid, {
      inCarousel: !product.inCarousel
    }).subscribe({
      next: (updatedProduct) => {
        this.product.set(updatedProduct);
        const message = updatedProduct.inCarousel 
          ? 'Produit ajouté au carrousel' 
          : 'Produit retiré du carrousel';
        
        this.snackBar.open(message, 'Fermer', {
          duration: 2000,
          panelClass: ['success-snackbar']
        });
      },
      error: (error) => {
        console.error('Error updating product:', error);
        this.snackBar.open('Erreur lors de la mise à jour', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  onBack(): void {
    this.router.navigate(['/office/products']);
  }

  selectImage(index: number): void {
    this.selectedImageIndex.set(index);
  }

  nextImage(): void {
    const product = this.product();
    if (!product || !product.images || product.images.length === 0) return;
    
    const nextIndex = (this.selectedImageIndex() + 1) % product.images.length;
    this.selectedImageIndex.set(nextIndex);
  }

  previousImage(): void {
    const product = this.product();
    if (!product || !product.images || product.images.length === 0) return;
    
    const prevIndex = this.selectedImageIndex() === 0 
      ? product.images.length - 1 
      : this.selectedImageIndex() - 1;
    this.selectedImageIndex.set(prevIndex);
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  shareProduct(): void {
    const product = this.product();
    if (!product) return;

    // Copy URL to clipboard
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      this.snackBar.open('Lien copié dans le presse-papiers', 'Fermer', {
        duration: 2000,
        panelClass: ['success-snackbar']
      });
    }).catch(() => {
      this.snackBar.open('Erreur lors de la copie du lien', 'Fermer', {
        duration: 2000,
        panelClass: ['error-snackbar']
      });
    });
  }
}
