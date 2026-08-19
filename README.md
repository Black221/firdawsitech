# Dashboard E-commerce Angular

Dashboard d'administration complet pour gérer une application e-commerce basée sur Angular et Angular Material.

## 📋 Prérequis

- Node.js (v16 ou supérieur)
- npm ou yarn
- Angular CLI (`npm install -g @angular/cli`)

## 🚀 Installation

### 1. Créer un nouveau projet Angular

```bash
ng new ecommerce-dashboard
cd ecommerce-dashboard
```

### 2. Installer Angular Material

```bash
ng add @angular/material
```

Choisir un thème (ex: Indigo/Pink) et accepter les animations.

### 3. Installer les dépendances supplémentaires

```bash
npm install
```

## 📁 Structure du Projet

```
src/app/
├── core/                      # Services et modèles singleton
│   ├── models/
│   │   ├── product.model.ts
│   │   ├── order.model.ts
│   │   └── api-error.model.ts
│   ├── services/
│   └── guards/
│
├── shared/                    # Composants partagés
│   ├── components/
│   ├── pipes/
│   └── directives/
│
├── features/                  # Modules fonctionnels (lazy-loaded)
│   ├── dashboard/
│   │   ├── pages/
│   │   │   └── overview/
│   │   ├── dashboard.module.ts
│   │   └── dashboard-routing.module.ts
│   │
│   ├── products/
│   │   ├── services/
│   │   │   └── products.service.ts
│   │   ├── pages/
│   │   │   ├── product-list/
│   │   │   ├── product-detail/
│   │   │   ├── product-create/
│   │   │   └── product-edit/
│   │   ├── products.module.ts
│   │   └── products-routing.module.ts
│   │
│   ├── orders/
│   │   ├── services/
│   │   │   └── orders.service.ts
│   │   ├── pages/
│   │   │   ├── order-list/
│   │   │   └── order-detail/
│   │   ├── orders.module.ts
│   │   └── orders-routing.module.ts
│   │
│   └── settings/
│
└── layout/
    ├── admin-layout/
    └── auth-layout/
```

## 🛠️ Configuration

### 1. Configuration de l'environnement

Modifier `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};
```

### 2. Configuration de production

Modifier `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.votredomaine.com/api'
};
```

## 📦 Modules Principaux

### Core Module (Singleton)
- **Services globaux**: API, Authentication, Notifications
- **Guards**: Auth guards pour protéger les routes
- **Interceptors**: HTTP interceptors pour les tokens et la gestion des erreurs
- **Models**: Interfaces TypeScript pour les données

### Shared Module
- **Composants réutilisables**: Sidebar, Header, Loader, etc.
- **Pipes**: Formatage de devises, dates
- **Directives**: Image fallback, etc.

### Features Modules (Lazy Loaded)

#### Dashboard Module
- Vue d'ensemble avec statistiques
- Graphiques et métriques clés
- Commandes récentes
- Produits vedettes

#### Products Module
- Liste des produits avec filtres et recherche
- Détails d'un produit
- Création et modification de produits
- Gestion de la galerie d'images
- Gestion des produits vedettes et carousel

#### Orders Module
- Liste des commandes avec filtres par statut
- Détails d'une commande
- Gestion du statut (Nouveau → Payé → Expédié)
- Annulation de commandes

#### Settings Module
- Configuration générale
- Paramètres utilisateur

## 🎨 Fonctionnalités Principales

### Gestion des Produits
- ✅ Liste paginée avec recherche et filtres
- ✅ Création/modification/suppression
- ✅ Upload multiple d'images
- ✅ Définition d'image principale
- ✅ Réorganisation de la galerie
- ✅ Gestion des produits vedettes
- ✅ Gestion du carousel

### Gestion des Commandes
- ✅ Liste avec filtres par statut
- ✅ Détails complets d'une commande
- ✅ Changement de statut (Payé, Expédié)
- ✅ Annulation avec remise en stock
- ✅ Calculs automatiques des totaux

### Tableau de Bord
- ✅ Statistiques en temps réel
- ✅ Nombre de produits (total, en stock, rupture)
- ✅ Nombre de commandes par statut
- ✅ Revenu total et panier moyen
- ✅ Commandes récentes
- ✅ Produits vedettes
- ✅ Actions rapides

## 🚀 Lancement du Projet

### Mode Développement

```bash
ng serve
```

Accéder à `http://localhost:4200`

### Build de Production

```bash
ng build --configuration production
```

Les fichiers seront générés dans `dist/`

## 🔌 API Endpoints Utilisés

### Produits
- `GET /api/products` - Liste tous les produits
- `POST /api/products` - Créer un produit
- `GET /api/products/{uuid}` - Détails d'un produit
- `PATCH /api/products/{uuid}` - Modifier un produit
- `DELETE /api/products/{uuid}` - Supprimer un produit
- `GET /api/products/search?q=...&category=...` - Rechercher
- `GET /api/products/featured` - Produits vedettes
- `GET /api/products/carousel` - Produits carousel
- `PATCH /api/products/{uuid}/flags` - Modifier flags

### Images
- `GET /api/products/{uuid}/images` - Liste des images
- `POST /api/products/{uuid}/images` - Upload multiple
- `POST /api/products/{uuid}/images/{imageUuid}/primary` - Définir principale
- `PATCH /api/products/{uuid}/images/reorder` - Réorganiser
- `DELETE /api/products/{uuid}/images/{imageUuid}` - Supprimer

### Commandes
- `GET /api/orders?status=...` - Liste des commandes
- `POST /api/orders` - Créer une commande
- `GET /api/orders/{uuid}` - Détails d'une commande
- `POST /api/orders/{uuid}/pay` - Marquer comme payé
- `POST /api/orders/{uuid}/ship` - Marquer comme expédié
- `POST /api/orders/{uuid}/cancel` - Annuler

## 🎨 Personnalisation

### Thème Angular Material

Modifier `src/styles.scss`:

```scss
@use '@angular/material' as mat;

// Définir votre palette personnalisée
$custom-primary: mat.define-palette(mat.$indigo-palette);
$custom-accent: mat.define-palette(mat.$pink-palette);
$custom-warn: mat.define-palette(mat.$red-palette);

// Créer le thème
$custom-theme: mat.define-light-theme((
  color: (
    primary: $custom-primary,
    accent: $custom-accent,
    warn: $custom-warn,
  )
));

@include mat.all-component-themes($custom-theme);
```

## 📱 Responsive Design

Le dashboard est entièrement responsive avec:
- Breakpoints adaptés pour mobile, tablette et desktop
- Sidebar collapsible
- Tables avec scroll horizontal sur mobile
- Grids adaptatifs

## 🔒 Sécurité

### À implémenter
- [ ] Authentication JWT
- [ ] Guards pour protéger les routes
- [ ] Interceptor pour ajouter le token aux requêtes
- [ ] Gestion des rôles et permissions

### Exemple de Guard

```typescript
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
```

## 🧪 Tests

### Tests Unitaires

```bash
ng test
```

### Tests E2E

```bash
ng e2e
```

## 📝 Bonnes Pratiques Appliquées

1. **Architecture modulaire** avec lazy loading
2. **Separation of concerns** (Core, Shared, Features)
3. **Reactive Forms** pour les formulaires
4. **RxJS** pour la gestion asynchrone
5. **TypeScript strict** pour la sécurité des types
6. **Material Design** pour l'UI/UX
7. **Responsive design** mobile-first
8. **Error handling** centralisé

## 🔄 Améliorations Futures

- [ ] State management avec NgRx
- [ ] Graphiques avec ng2-charts
- [ ] Export de données (CSV, PDF)
- [ ] Notifications en temps réel
- [ ] Dark mode
- [ ] Multi-langue (i18n)
- [ ] Cache HTTP
- [ ] Pagination côté serveur
- [ ] WebSocket pour les updates en temps réel

## 📚 Documentation Complémentaire

- [Angular Documentation](https://angular.io/docs)
- [Angular Material](https://material.angular.io)
- [RxJS](https://rxjs.dev)
- [TypeScript](https://www.typescriptlang.org)

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou soumettre une pull request.

## 📄 Licence

MIT

## 👨‍💻 Auteur

Développé pour la gestion d'une boutique e-commerce moderne.
