import { Component, HostListener, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../../../features/shop/services/cart-service';

interface ContactInfo {
  phone: string;
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
  selector: 'app-vitrine-layout',
  standalone: false,
  templateUrl: './vitrine-layout.html',
  styleUrl: './vitrine-layout.scss',
})
export class VitrineLayout implements OnInit {

  isScrolled = signal(false);
  isLargeScreen = false;

  // Informations de contact
  contactInfo: ContactInfo = {
    phone: '+221 78 012 69 76',
    email: 'firdawsitechnologies@gmail.com',
    address: 'DAKAR, Gueule-Tapée, Rue 71 x 52, Derrière Hôpital Abass NDAO',
    socialMedia: {
      facebook: 'https://www.facebook.com/Firdawsi-Technologies-100089723587591',
      instagram: 'https://www.instagram.com/firdawsi_technologies',
      tiktok: 'https://www.tiktok.com/@firdawsitechnologies',
      whatsapp: 'https://wa.me/+221780126976'
    }
  };


  ngOnInit(): void {
  }

  @HostListener('window:resize')
  checkScreenSize(): void {
    this.isLargeScreen = window.innerWidth >= 1024;
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.isScrolled.set(window.pageYOffset > 50);
  }


  openSocialMedia(platform: 'facebook' | 'instagram' | 'tiktok' | 'whatsapp'): void {
    window.open(this.contactInfo.socialMedia[platform], '_blank');
  }

  openMap(): void {
    const encodedAddress = encodeURIComponent(this.contactInfo.address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  }
  // Mobile menu state
  mobileMenuOpen = signal(false);


  // Search state
  searchOpen = signal(false);
  searchQuery = signal('');

  // Cart from service
  cartItemCount;

  // Navigation items
  navigationItems = [
    { label: 'Accueil', path: '/', icon: 'home' },
    { label: 'Boutique', path: '/boutique', icon: 'shop' },
  ];

  constructor(
    private router: Router,
    private cartService: CartService
  ) {
    this.cartItemCount = this.cartService.itemCount;

  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(open => !open);
  }

  toggleSearch(): void {
    this.searchOpen.update(open => !open);
  }



  onSearch(): void {
    const query = this.searchQuery().trim();
    if (query) {
      this.router.navigate(['/boutique'], { queryParams: { search: query } });
      this.searchQuery.set('');
      this.searchOpen.set(false);
    }
  }

  navigateToCart(): void {
    this.router.navigate(['/panier']);
  }

  navigateToHome(): void {
    this.router.navigate(['/']);
  }

  isActive(path: string): boolean {
    return this.router.url === path ||
      (path !== '/' && this.router.url.startsWith(path));
  }
}


