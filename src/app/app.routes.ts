import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { PrivacyComponent } from './pages/privacy/privacy.component';
import { TermsComponent } from './pages/terms/terms.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'SpeakWith Support: Your spoken ideas, captured as a daily document' },
  { path: 'privacy', component: PrivacyComponent, title: 'Privacy Policy | SpeakWith' },
  { path: 'terms', component: TermsComponent, title: 'Terms of Service | SpeakWith' },
  {
    path: 'pricing',
    loadComponent: () =>
      import('./pages/pricing/pricing.component').then(m => m.PricingComponent),
    title: 'Pricing | SpeakWith'
  },
  { path: '404', component: NotFoundComponent, title: 'Page Not Found | SpeakWith' },
  { path: '**', component: NotFoundComponent, title: 'Page Not Found | SpeakWith' },
];
