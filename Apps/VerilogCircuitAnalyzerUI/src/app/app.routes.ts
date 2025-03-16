import { Routes } from '@angular/router';
import {HomeComponent} from './home/home.component';
import {CircuitAnalyzerComponent} from './circuit-analyzer/circuit-analyzer.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'circuit-analyzer', component: CircuitAnalyzerComponent },

];
