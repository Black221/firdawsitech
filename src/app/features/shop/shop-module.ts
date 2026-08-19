import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Shop } from './shop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', component: Shop }

]

@NgModule({
  declarations: [
    Shop
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    RouterModule.forChild(routes)
  ]
})
export class ShopModule { }
