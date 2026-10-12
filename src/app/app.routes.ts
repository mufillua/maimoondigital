import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home-page/home-page';

export const routes: Routes = [
  { path: '', component: HomePageComponent, title: 'Maimoon Digital — Websites that move businesses forward' },
  { path: '**', redirectTo: '' },
];
