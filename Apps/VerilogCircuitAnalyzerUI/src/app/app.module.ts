import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { CircuitAnalyzerComponent } from './circuit-analyzer/circuit-analyzer.component';
import {FileUploadModule} from 'ng2-file-upload';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HeaderComponent } from './header/header.component';
import { CircuitDisplayComponent } from './circuit-display/circuit-display.component';
import {DiagramModule, SymbolPaletteModule} from '@syncfusion/ej2-angular-diagrams';
import { CircuitDisplayV2Component } from './circuit-display-v2/circuit-display-v2.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    CircuitAnalyzerComponent,
    HeaderComponent,
    CircuitDisplayComponent,
    CircuitDisplayV2Component
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FileUploadModule,
    BrowserAnimationsModule,
    DiagramModule,
    SymbolPaletteModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
