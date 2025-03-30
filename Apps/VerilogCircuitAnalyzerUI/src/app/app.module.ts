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
import {NgxJsonViewerModule} from 'ngx-json-viewer';
import {ClipboardModule} from '@angular/cdk/clipboard';
import {ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';

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
    ClipboardModule,
    NgxJsonViewerModule,
    BrowserModule,
    AppRoutingModule,
    FileUploadModule,
    BrowserAnimationsModule,
    DiagramModule,
    SymbolPaletteModule,
    ReactiveFormsModule,
    HttpClientModule

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
