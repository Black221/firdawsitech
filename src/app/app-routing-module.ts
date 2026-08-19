// src/app/app-routing.module.ts

import { NgModule } from '@angular/core';
import { ExtraOptions, PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AdminLayout } from './core/layout/admin-layout/admin-layout';
import { VitrineLayout } from './core/layout/vitrine-layout/vitrine-layout';
import { AuthGuard } from './core/auth/guards/auth-guard';

const routerConfig: ExtraOptions = {
  preloadingStrategy       : PreloadAllModules,
  scrollPositionRestoration: 'enabled',
  useHash                : false
};

const routes: Routes = [

	{
		path: '',
		component: VitrineLayout,
		children: [
			{
				path: '',
				loadChildren: () => import('./features/home/home-module').then(m => m.HomeModule)
			},
			{
				path: 'boutique',
				loadChildren: () => import('./features/shop/shop-module').then(m => m.ShopModule)
			},
			{
				path: 'boutique/:slug',
				loadChildren: () => import('./features/product-detail/product-detail-module').then(m => m.ProductDetailModule)
			},
			{
				path: 'panier',
				loadChildren: () => import('./features/cart/cart-module').then(m => m.CartModule)
			},
			{
				path: 'checkout',
				loadChildren: () => import('./features/checkout/checkout-module').then(m => m.CheckoutModule)
			},
		]
	},
	{
		path: 'office',
		component: AdminLayout,
		canActivate: [AuthGuard],
		children: [
			{
				path: '',
				redirectTo: 'dashboard',
				pathMatch: 'full'
			},

			{
				path: 'dashboard',
				loadChildren: () => import('./features/office/dashboard/dashboard-module').then(m => m.DashboardModule)
			},
			{
				path: 'products',
				loadChildren: () => import('./features/office/products/products-module').then(m => m.ProductsModule)
			},
			{
				path: 'orders',
				loadChildren: () => import('./features/office/orders/orders-module').then(m => m.OrdersModule)
			},
			{
				path: 'settings',
				loadChildren: () => import('./features/office/settings/settings-module').then(m => m.SettingsModule)
			}
		]
	},
	{
		path: '', loadChildren: () => import('./features/auth/auth-module').then(m => m.AuthModule)
	},
	{
		path: '**',
		redirectTo: '/'
	}
];

@NgModule({
	imports: [RouterModule.forRoot(routes, routerConfig)],
	exports: [RouterModule]
})
export class AppRoutingModule { }