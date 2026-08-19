import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Pages privées / interactives : pas de SSR, rendu client uniquement.
  { path: 'panier', renderMode: RenderMode.Client },
  { path: 'checkout', renderMode: RenderMode.Client },
  { path: 'login', renderMode: RenderMode.Client },
  { path: 'office/**', renderMode: RenderMode.Client },
  // Pages publiques (vitrine, boutique, fiche produit) : SSR à chaque requête
  // pour que les meta tags (titre/description/image) reflètent le contenu réel,
  // y compris pour les produits créés après le build.
  { path: '**', renderMode: RenderMode.Server },
];
