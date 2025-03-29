import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {CircuitAnalyzerComponent} from './circuit-analyzer/circuit-analyzer.component';
import {HomeComponent} from './home/home.component';
import {CircuitDisplayComponent} from './circuit-display/circuit-display.component';
import {CircuitDisplayV2Component} from './circuit-display-v2/circuit-display-v2.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'circuit-analyzer', component: CircuitAnalyzerComponent },
  { path: 'demo-circuit-display', component: CircuitDisplayComponent },
  { path: 'circuit-display-v2', component: CircuitDisplayV2Component },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
