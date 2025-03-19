import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {CircuitAnalyzerComponent} from './circuit-analyzer/circuit-analyzer.component';
import {HomeComponent} from './home/home.component';
import {CircuitDisplayComponent} from './circuit-display/circuit-display.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'circuit-analyzer', component: CircuitAnalyzerComponent },
  { path: 'circuit-display', component: CircuitDisplayComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
