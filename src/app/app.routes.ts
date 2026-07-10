import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { PrivacyComponent } from './pages/privacy/privacy.component';
import { TermsComponent } from './pages/terms/terms.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'SpeakWith Support: Your spoken ideas, captured as a daily document',
    data: {
      description:
        'SpeakWith is a local-first voice recorder for Mac and iOS that turns daily speaking into a searchable, organised daily document. Tuned for speech and dictation, not music or ambient sound.'
    }
  },
  {
    path: 'privacy',
    component: PrivacyComponent,
    title: 'Privacy Policy | SpeakWith',
    data: {
      description:
        'Your words are yours. SpeakWith keeps recordings, transcripts, and documents on your device. No account, no tracking, no cloud upload.'
    }
  },
  {
    path: 'terms',
    component: TermsComponent,
    title: 'Terms of Service | SpeakWith',
    data: {
      description:
        'The terms of service for SpeakWith, the local-first voice recorder and transcription app for Mac and iOS.'
    }
  },
  {
    path: 'pricing',
    loadComponent: () =>
      import('./pages/pricing/pricing.component').then(m => m.PricingComponent),
    title: 'Pricing | SpeakWith',
    data: {
      description:
        'Start with built-in dictation, or go Paid for Whisper and Parakeet engines, batch transcription, and smart paragraph formatting.'
    }
  },
  {
    path: 'automation',
    loadComponent: () =>
      import('./pages/automation/automation.component').then(m => m.AutomationComponent),
    title: 'Automation | SpeakWith',
    data: {
      description:
        'Start, stop, and control SpeakWith recording from the command line, Shortcuts, Automator, or a hotkey — via the speakwith:// URL scheme or AppleScript.'
    }
  },
  { path: '404', component: NotFoundComponent, title: 'Page Not Found | SpeakWith' },
  { path: '**', component: NotFoundComponent, title: 'Page Not Found | SpeakWith' },
];
