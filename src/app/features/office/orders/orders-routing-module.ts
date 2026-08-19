import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrderList } from './pages/order-list/order-list';
import { OrderDetail } from './pages/order-detail/order-detail';

const routes: Routes = [
  { path: '', component: OrderList },
  { path: ':uuid', component: OrderDetail }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrdersRoutingModule { }
