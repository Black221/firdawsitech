import { Component, computed, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from '../../../../../core/models/product-model';
import { ProductsService } from '../../services/products';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar'

@Component({
  selector: 'app-product-list',
  standalone: false,
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
})
export class ProductList  implements OnInit {
  // Signals
  products = signal<Product[]>([]);
  loading = signal(false);
  searchQuery = signal('');
  selectedCategory = signal('');
  selectedStatus = signal<'all' | 'in-stock' | 'out-of-stock'>('all');
  viewMode = signal<'grid' | 'list'>('grid');
  
  // Computed values
  categories = computed(() => {
    const categorySet = new Set<string>();
    this.products().forEach(product => {
      if (product.category) {
        categorySet.add(product.category);
      }
    });
    return Array.from(categorySet).sort();
  });

  filteredProducts = computed(() => {
    let filtered = this.products();

    // Filter by search query
    const query = this.searchQuery().toLowerCase();
    if (query) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
      );
    }

    // Filter by category
    const category = this.selectedCategory();
    if (category) {
      filtered = filtered.filter(p => p.category === category);
    }

    // Filter by status
    const status = this.selectedStatus();
    if (status === 'in-stock') {
      filtered = filtered.filter(p => p.inStock);
    } else if (status === 'out-of-stock') {
      filtered = filtered.filter(p => !p.inStock);
    }

    return filtered;
  });

  stats = computed(() => ({
    total: this.products().length,
    inStock: this.products().filter(p => p.inStock).length,
    outOfStock: this.products().filter(p => !p.inStock).length,
    featured: this.products().filter(p => p.featured).length
  }));

  constructor(
    private productsService: ProductsService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading.set(true);
    this.productsService.getAllProducts().subscribe({
      next: (products) => {
        this.products.set(products);
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

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
  }

  onCategoryChange(value: string): void {
    this.selectedCategory.set(value);
  }

  onStatusChange(value: 'all' | 'in-stock' | 'out-of-stock'): void {
    this.selectedStatus.set(value);
  }

  onClearFilters(): void {
    this.searchQuery.set('');
    this.selectedCategory.set('');
    this.selectedStatus.set('all');
  }

  toggleViewMode(): void {
    this.viewMode.update(mode => mode === 'grid' ? 'list' : 'grid');
  }

  onCreateProduct(): void {
    this.router.navigate(['/office/products/create']);
  }

  onViewProduct(product: Product): void {
    this.router.navigate(['/office/products', product.uuid]);
  }

  onEditProduct(product: Product): void {
    this.router.navigate(['/office/products', product.uuid, 'edit']);
  }

  onDeleteProduct(product: Product): void {
    // TODO: Create ConfirmDialog component
    if (confirm(`Êtes-vous sûr de vouloir supprimer "${product.name}" ?`)) {
      this.productsService.deleteProduct(product.uuid).subscribe({
        next: () => {
          this.snackBar.open('Produit supprimé avec succès', 'Fermer', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadProducts();
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

  onToggleFeatured(product: Product, event: Event): void {
    event.stopPropagation();
    
    this.productsService.updateProductFlags(product.uuid, {
      featured: !product.featured
    }).subscribe({
      next: (updatedProduct) => {
        const index = this.products().findIndex(p => p.uuid === product.uuid);
        if (index !== -1) {
          const updated = [...this.products()];
          updated[index] = updatedProduct;
          this.products.set(updated);
        }
        
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

  getPriceFormatted(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price);
  }
}