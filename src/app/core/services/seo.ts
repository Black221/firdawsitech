import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

export const SITE_NAME = 'FirdawsiTech';
export const SITE_URL = 'https://firdawsitech.sn';
export const DEFAULT_SEO_IMAGE = `${SITE_URL}/android-chrome-512x512.png`;

export interface SeoData {
  /** Titre de la page, sans le nom du site (ajouté automatiquement). */
  title: string;
  description: string;
  /** Chemin relatif, ex: '/boutique/pc-portable-hp-15-a1b2c3d4'. */
  path: string;
  image?: string;
  type?: 'website' | 'product' | 'article';
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  constructor(
    private titleService: Title,
    private meta: Meta,
    @Inject(DOCUMENT) private document: Document,
  ) {}

  update(data: SeoData): void {
    const fullTitle = `${data.title} | ${SITE_NAME}`;
    const url = `${SITE_URL}${data.path}`;
    const image = data.image || DEFAULT_SEO_IMAGE;
    const type = data.type || 'website';

    this.titleService.setTitle(fullTitle);

    this.meta.updateTag({ name: 'description', content: data.description });

    this.meta.updateTag({ property: 'og:title', content: fullTitle });
    this.meta.updateTag({ property: 'og:description', content: data.description });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ property: 'og:type', content: type });
    this.meta.updateTag({ property: 'og:locale', content: 'fr_FR' });
    this.meta.updateTag({ property: 'og:site_name', content: SITE_NAME });

    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: fullTitle });
    this.meta.updateTag({ name: 'twitter:description', content: data.description });
    this.meta.updateTag({ name: 'twitter:image', content: image });

    this.setCanonical(url);
  }

  private setCanonical(url: string): void {
    let link: HTMLLinkElement | null = this.document.head.querySelector('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }
}
