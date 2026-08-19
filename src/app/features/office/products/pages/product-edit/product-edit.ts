import { Component, OnInit, signal } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Product, UpdateProductRequest } from '../../../../../core/models/product-model';
import { ProductsService } from '../../services/products';

@Component({
  selector: 'app-product-edit',
  standalone: false,
  templateUrl: './product-edit.html',
  styleUrl: './product-edit.scss',
})
export class ProductEdit implements OnInit {
  productForm!: FormGroup;
  product = signal<Product | null>(null);
  loading = signal(true);
  submitting = signal(false);
  productUuid = '';
  
  // Image handling
  selectedFiles = signal<File[]>([]);
  imagePreviews = signal<string[]>([]);
  primaryImageIndex = signal<number>(0);
  existingImages = signal<any[]>([]);

  // Specifications handling
  specs = signal<string[]>([]);
  currentSpec = signal('');

  // Predefined categories
  categories = [
    'Téléphones',
    'Tablettes',
    'Ordinateurs portables',
    'Ordinateurs de bureau',
    'Imprimantes',
    'Scanners',
    'Photocopieuses',
    'Moniteurs',
    'Accessoires informatiques',
    'Montres connectées',
    'AirPods & Écouteurs',
    'Claviers & Souris',
    'Disques durs & SSD',
    'Webcams',
    'Autre'
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private productsService: ProductsService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.route.params.subscribe(params => {
      this.productUuid = params['uuid'];
      if (this.productUuid) {
        this.loadProduct(this.productUuid);
      }
    });
  }

  initForm(): void {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      description: ['', [Validators.maxLength(2000)]],
      price: [0, [Validators.required, Validators.min(0)]],
      category: ['', [Validators.required]],
      inStock: [true],
      featured: [false],
      carousel: [false],
      rating: [0, [Validators.min(0), Validators.max(5)]]
    });
  }

  loadProduct(uuid: string): void {
    this.loading.set(true);
    this.productsService.getProductById(uuid).subscribe({
      next: (product) => {
        this.product.set(product);
        this.patchFormValues(product);
        
        // Load existing images
        if (product.images && product.images.length > 0) {
          this.existingImages.set(product.images);
        }
        
        // Load existing specs
        if (product.specs && product.specs.length > 0) {
          this.specs.set([...product.specs]);
        }
        
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading product:', error);
        this.snackBar.open('Erreur lors du chargement du produit', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.loading.set(false);
        this.router.navigate(['/products']);
      }
    });
  }

  patchFormValues(product: Product): void {
    this.productForm.patchValue({
      name: product.name,
      description: product.description || '',
      price: product.price,
      category: product.category || '',
      inStock: product.inStock,
      featured: product.featured,
      carousel: product.inCarousel,
      rating: product.rating || 0
    });
  }

  // Specifications methods
  addSpec(): void {
    const spec = this.currentSpec().trim();
    if (spec && !this.specs().includes(spec)) {
      this.specs.update(specs => [...specs, spec]);
      this.currentSpec.set('');
    }
  }

  removeSpec(index: number): void {
    this.specs.update(specs => {
      const newSpecs = [...specs];
      newSpecs.splice(index, 1);
      return newSpecs;
    });
  }

  onSpecKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addSpec();
    }
  }

  // File selection handler
  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      
      const validFiles = files.filter(file => {
        const isImage = file.type.startsWith('image/');
        const isValidSize = file.size <= 5 * 1024 * 1024;
        
        if (!isImage) {
          this.snackBar.open('Seules les images sont acceptées', 'Fermer', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          return false;
        }
        
        if (!isValidSize) {
          this.snackBar.open('La taille maximale est de 5MB', 'Fermer', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          return false;
        }
        
        return true;
      });

      if (validFiles.length > 0) {
        const currentFiles = this.selectedFiles();
        const newFiles = [...currentFiles, ...validFiles];
        this.selectedFiles.set(newFiles);
        this.generatePreviews(validFiles);
      }
    }
  }

  generatePreviews(files: File[]): void {
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          const newPreviews = [...this.imagePreviews(), e.target.result as string];
          this.imagePreviews.set(newPreviews);
        }
      };
      reader.readAsDataURL(file);
    });
  }

  removeNewImage(index: number): void {
    const files = this.selectedFiles();
    const previews = this.imagePreviews();
    
    files.splice(index, 1);
    previews.splice(index, 1);
    
    this.selectedFiles.set([...files]);
    this.imagePreviews.set([...previews]);
  }

  removeExistingImage(index: number): void {
    const images = this.existingImages();
    const imageToRemove = images[index];
    
    if (confirm('Voulez-vous vraiment supprimer cette image ?')) {
      this.productsService.deleteProductImage(this.productUuid, imageToRemove.uuid).subscribe({
        next: () => {
          images.splice(index, 1);
          this.existingImages.set([...images]);
          this.snackBar.open('Image supprimée', 'Fermer', {
            duration: 2000,
            panelClass: ['success-snackbar']
          });
        },
        error: (error) => {
          console.error('Error deleting image:', error);
          this.snackBar.open('Erreur lors de la suppression', 'Fermer', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.markFormGroupTouched(this.productForm);
      this.snackBar.open('Veuillez remplir tous les champs requis', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.submitting.set(true);

    const updateData: UpdateProductRequest = {
      ...this.productForm.value,
      price: parseFloat(this.productForm.value.price),
      specs: this.specs()
    };

    this.productsService.updateProduct(this.productUuid, updateData).subscribe({
      next: (product) => {
        // If new images are selected, upload them
        if (this.selectedFiles().length > 0) {
          this.uploadNewImages(product.uuid);
        } else {
          this.onSuccess();
        }
      },
      error: (error) => {
        console.error('Error updating product:', error);
        this.snackBar.open('Erreur lors de la mise à jour', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.submitting.set(false);
      }
    });
  }

  uploadNewImages(productUuid: string): void {
    const files = this.selectedFiles();

    this.productsService.uploadProductImages(productUuid, files).subscribe({
      next: () => {
        this.onSuccess();
      },
      error: (error) => {
        console.error('Error uploading images:', error);
        this.snackBar.open('Produit mis à jour mais erreur lors du téléchargement des images', 'Fermer', {
          duration: 4000,
          panelClass: ['warning-snackbar']
        });
        this.submitting.set(false);
        this.router.navigate(['/office/products', this.productUuid]);
      }
    });
  }

  onSuccess(): void {
    this.snackBar.open('Produit mis à jour avec succès !', 'Fermer', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
    this.submitting.set(false);
    this.router.navigate(['/office/products', this.productUuid]);
  }

  onCancel(): void {
    if (this.productForm.dirty || this.selectedFiles().length > 0) {
      if (confirm('Voulez-vous vraiment quitter ? Les modifications seront perdues.')) {
        this.router.navigate(['/office/products', this.productUuid]);
      }
    } else {
      this.router.navigate(['/office/products', this.productUuid]);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.productForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.productForm.get(fieldName);
    
    if (!field || !field.errors) {
      return '';
    }

    if (field.errors['required']) {
      return 'Ce champ est requis';
    }
    
    if (field.errors['minlength']) {
      return `Minimum ${field.errors['minlength'].requiredLength} caractères`;
    }
    
    if (field.errors['maxlength']) {
      return `Maximum ${field.errors['maxlength'].requiredLength} caractères`;
    }
    
    if (field.errors['min']) {
      return `La valeur minimale est ${field.errors['min'].min}`;
    }
    
    if (field.errors['max']) {
      return `La valeur maximale est ${field.errors['max'].max}`;
    }

    return 'Champ invalide';
  }

  getPriceFormatted(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price);
  }
}