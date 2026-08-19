import { Component, OnInit, signal } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CreateProductRequest } from '../../../../../core/models/product-model';
import { ProductsService } from '../../services/products';

@Component({
  selector: 'app-product-create',
  standalone: false,
  templateUrl: './product-create.html',
  styleUrl: './product-create.scss',
})
export class ProductCreate implements OnInit {
  productForm!: FormGroup;
  loading = signal(false);
  submitting = signal(false);

  // Image handling
  selectedFiles = signal<File[]>([]);
  imagePreviews = signal<string[]>([]);
  primaryImageIndex = signal<number>(0);

  // Specifications handling
  specs = signal<string[]>([]);
  currentSpec = signal('');

  // Predefined categories (can be fetched from API)
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
    private productsService: ProductsService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.initForm();
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

  // File selection handler
  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);

      // Validate files
      const validFiles = files.filter(file => {
        const isImage = file.type.startsWith('image/');
        const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB max

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
        // Add to existing files
        const currentFiles = this.selectedFiles();
        const newFiles = [...currentFiles, ...validFiles];
        this.selectedFiles.set(newFiles);

        // Generate previews
        this.generatePreviews(validFiles);
      }
    }
  }

  generatePreviews(files: File[]): void {
    const currentPreviews = this.imagePreviews();

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

  removeImage(index: number): void {
    const files = this.selectedFiles();
    const previews = this.imagePreviews();

    files.splice(index, 1);
    previews.splice(index, 1);

    this.selectedFiles.set([...files]);
    this.imagePreviews.set([...previews]);

    // Adjust primary index if needed
    if (this.primaryImageIndex() >= files.length && files.length > 0) {
      this.primaryImageIndex.set(files.length - 1);
    } else if (files.length === 0) {
      this.primaryImageIndex.set(0);
    }
  }

  setPrimaryImage(index: number): void {
    this.primaryImageIndex.set(index);
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

    const productData: CreateProductRequest = {
      ...this.productForm.value,
      price: parseFloat(this.productForm.value.price),
      specs: this.specs() // Add specs to product data
    };

    this.productsService.createProduct(productData).subscribe({
      next: (product) => {
        // If images are selected, upload them
        if (this.selectedFiles().length > 0) {
          this.uploadImages(product.uuid);
        } else {
          this.onSuccess();
        }
      },
      error: (error) => {
        console.error('Error creating product:', error);
        this.snackBar.open('Erreur lors de la création du produit', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.submitting.set(false);
      }
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

  uploadImages(productUuid: string): void {
    const files = this.selectedFiles();
    const primaryIndex = this.primaryImageIndex();

    this.productsService.uploadProductImages(productUuid, files).subscribe({
      next: (images) => {
        // Set primary image if specified
        if (images.length > 0 && primaryIndex < images.length) {
          const primaryImageUuid = images[primaryIndex].uuid;
          this.productsService.setPrimaryImage(productUuid, primaryImageUuid).subscribe({
            next: () => {
              this.onSuccess();
            },
            error: () => {
              this.onSuccess(); // Continue anyway
            }
          });
        } else {
          this.onSuccess();
        }
      },
      error: (error) => {
        console.error('Error uploading images:', error);
        this.snackBar.open('Produit créé mais erreur lors du téléchargement des images', 'Fermer', {
          duration: 4000,
          panelClass: ['warning-snackbar']
        });
        this.submitting.set(false);
        this.router.navigate(['/office/products']);
      }
    });
  }

  onSuccess(): void {
    this.snackBar.open('Produit créé avec succès !', 'Fermer', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
    this.submitting.set(false);
    this.router.navigate(['/office/products']);
  }

  onCancel(): void {
    if (this.productForm.dirty) {
      if (confirm('Voulez-vous vraiment quitter ? Les modifications seront perdues.')) {
        this.router.navigate(['/office/products']);
      }
    } else {
      this.router.navigate(['/office/products']);
    }
  }

  // Helper method to mark all fields as touched
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  // Helper methods for template
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
