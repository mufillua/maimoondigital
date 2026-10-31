import { Routes } from '@angular/router';
import { SITE_TITLE } from './core/site.config';
import { HomePageComponent } from './pages/home-page/home-page';

export const routes: Routes = [
  { path: '', component: HomePageComponent, title: SITE_TITLE },
  { path: '**', redirectTo: '' },
];
