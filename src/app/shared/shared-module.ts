import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sidebar } from './components/sidebar/sidebar';
import { Header } from './components/header/header';
import { Loader } from './components/loader/loader';
import { ConfirmationDialog } from './components/confirmation-dialog/confirmation-dialog';
import { CurrencyFormatPipe } from './pipes/currency-format-pipe';
import { DateFormatPipe } from './pipes/date-format-pipe';
import { ImageFallback } from './directives/image-fallback';



@NgModule({
  declarations: [
    Sidebar,
    Header,
    Loader,
    ConfirmationDialog,
    CurrencyFormatPipe,
    DateFormatPipe,
    ImageFallback
  ],
  imports: [
    CommonModule
  ]
})
export class SharedModule { }
