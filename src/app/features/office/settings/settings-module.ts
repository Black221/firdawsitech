import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SettingsRoutingModule } from './settings-routing-module';
import { Settings } from './settings';
import { GeneralSettings } from './pages/general-settings/general-settings';


@NgModule({
  declarations: [
    Settings,
    GeneralSettings
  ],
  imports: [
    CommonModule,
    SettingsRoutingModule
  ]
})
export class SettingsModule { }
