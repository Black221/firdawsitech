import { Component, HostListener, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Product } from '../../core/models/product-model';
import { ProductsService } from '../office/products/services/products';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CartService } from '../shop/services/cart-service';
import { SeoService } from '../../core/services/seo';


interface Service {
  title: string;
  description: string;
}

interface Brand {
  name: string;
  logo: string;
}

interface ContactInfo {
  phone: string[];
  email: string;
  address: string;
  socialMedia: {
    facebook: string;
    instagram: string;
    tiktok: string;
    whatsapp: string;
  };
}

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  // State signals
  carouselProducts = signal<Product[]>([]);
  featuredProducts = signal<Product[]>([]);
  loading = signal(false);
  currentSlide = signal(0);

  // Informations réelles de l'entreprise
  contactInfo: ContactInfo = {
    phone: [
      '+221 33 842 93 49', '+221 78 012 69 76', '+221 77 863 76 76', '+221 78 172 76 76'
    ],
    email: 'firdawsitechnologies@gmail.com',
    address: 'DAKAR, Gueule-Tapée, Rue 71 x 52, Derrière Hôpital Abass NDAO',
    socialMedia: {
      facebook: 'https://www.facebook.com/Firdawsi-Technologies-100089723587591',
      instagram: 'https://www.instagram.com/firdawsi_technologies',
      tiktok: 'https://www.tiktok.com/@firdawsitechnologies',
      whatsapp: 'https://wa.me/+221780126976'
    }
  };

  brands: Brand[] = [
    { name: 'Lenovo', logo: 'assets/brands/lenovo.webp' },
    { name: 'Asus', logo: 'assets/brands/asus.png' },
    { name: 'HP', logo: 'assets/brands/hp.png' },
    { name: 'Apple', logo: 'assets/brands/mac.png' },
    { name: 'Dell', logo: 'assets/brands/dell.png' },
    { name: 'Acer', logo: 'assets/brands/acer.jpg' }
  ];

  // Carousel auto-play interval
  private carouselInterval: any;
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor(
    private productsService: ProductsService,
    private cartService: CartService,
    private router: Router,
    private snackBar: MatSnackBar,
    private seo: SeoService
  ) { }

  ngOnInit(): void {
    this.seo.update({
      title: 'Vente de matériels électro-informatique à Dakar, Sénégal',
      description: "Achetez de l'équipement électro-informatique à des prix très abordables et profitez des autres services que nous offrons à Dakar, Sénégal.",
      path: '/',
      type: 'website',
    });
    this.loadCarouselAndFeaturedProducts();
    this.startCarouselAutoPlay();
  }

  ngOnDestroy(): void {
    this.stopCarouselAutoPlay();
  }



  loadCarouselAndFeaturedProducts(): void {
    this.loading.set(true);
    this.productsService.getVitrine().subscribe({
      next: (vitrine) => {
        this.carouselProducts.set(vitrine.carousel);
        this.featuredProducts.set(vitrine.featured)
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading carousel products:', error);
        this.loading.set(false);
      }
    });
  }



  // Carousel Controls
  nextSlide(): void {
    const total = this.carouselProducts().length;
    if (total === 0) return;
    this.currentSlide.set((this.currentSlide() + 1) % total);
  }

  previousSlide(): void {
    const total = this.carouselProducts().length;
    if (total === 0) return;
    const newIndex = this.currentSlide() - 1;
    this.currentSlide.set(newIndex < 0 ? total - 1 : newIndex);
  }

  goToSlide(index: number): void {
    this.currentSlide.set(index);
  }

  startCarouselAutoPlay(): void {
    if (!this.isBrowser) return;
    this.carouselInterval = setInterval(() => {
      this.nextSlide();
    }, 5000); // Change slide every 5 seconds
  }

  stopCarouselAutoPlay(): void {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
  }

  onCarouselHover(): void {
    this.stopCarouselAutoPlay();
  }

  onCarouselLeave(): void {
    this.startCarouselAutoPlay();
  }

  // Navigation
  onViewProduct(product: Product): void {
    this.router.navigate(['/boutique', product.slug]);
  }

  onShopNow(): void {
    this.router.navigate(['/boutique']);
  }

  onViewAllFeatured(): void {
    this.router.navigate(['/boutique'], { queryParams: { featured: true } });
  }

  onAddToCart(product: Product, event: Event): void {
    event.stopPropagation();

    this.cartService.addItem(product, 1);

    this.snackBar.open(`${product.name} ajouté au panier`, 'Voir le panier', {
      duration: 3000,
      panelClass: ['success-snackbar']
    }).onAction().subscribe(() => {
      this.router.navigate(['/cart']);
    });
  }

  // Contact Methods
  openSocialMedia(platform: 'facebook' | 'instagram' | 'tiktok' | 'whatsapp'): void {
    window.open(this.contactInfo.socialMedia[platform], '_blank');
  }

  openMap(): void {
    const address = 'DAKAR, Gueule-Tapée, Rue 71 x 52, Derrière Hôpital Abass NDAO';
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  }

  // Utilities
  getPriceFormatted(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price);
  }

  getMainImage(product: Product): string {
    if (product.images && product.images.length > 0) {
      const primaryImage = product.imageUrl
      return primaryImage ? primaryImage : product.images[0].url;
    }
    return product.imageUrl || 'assets/images/no-image.png';
  }

  getRatingStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < Math.floor(rating) ? 1 : 0);
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; // Header height
      const elementPosition = element.offsetTop - offset;

      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }

    // if (this.mobileMenuOpen) {
    //   this.mobileMenuOpen = false;
    // }
  }
}