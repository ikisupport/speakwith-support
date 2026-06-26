import { Injectable, Inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type ThemeChoice = 'system' | 'light' | 'dark';

/**
 * System-aware light/dark theming with a manual override.
 *
 * - `system` follows the OS `prefers-color-scheme` and updates live.
 * - `light` / `dark` pin the theme regardless of the OS.
 *
 * The resolved theme is written to `<html data-theme="...">`; `index.html`
 * applies the same logic inline before first paint to avoid a flash.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private static readonly KEY = 'speakwith-theme';
  private static readonly LEGACY_KEY = 'lifebond-theme';
  private readonly isBrowser: boolean;

  readonly themeChoice = signal<ThemeChoice>('system');

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) {
      this.init();
    }
  }

  private init(): void {
    this.migrateThemeKeyIfNeeded();
    this.setTheme(this.normalize(localStorage.getItem(ThemeService.KEY) as ThemeChoice | null));

    window
      .matchMedia('(prefers-color-scheme: light)')
      .addEventListener('change', () => {
        if (this.themeChoice() === 'system') {
          this.apply('system');
        }
      });
  }

  private migrateThemeKeyIfNeeded(): void {
    const legacy = localStorage.getItem(ThemeService.LEGACY_KEY);
    if (legacy != null && localStorage.getItem(ThemeService.KEY) == null) {
      localStorage.setItem(ThemeService.KEY, legacy);
      localStorage.removeItem(ThemeService.LEGACY_KEY);
    }
  }

  setTheme(choice: ThemeChoice): void {
    this.themeChoice.set(choice);
    if (this.isBrowser) {
      localStorage.setItem(ThemeService.KEY, choice);
      this.apply(choice);
    }
  }

  private normalize(raw: ThemeChoice | null): ThemeChoice {
    return raw === 'light' || raw === 'dark' || raw === 'system' ? raw : 'system';
  }

  private apply(choice: ThemeChoice): void {
    const resolved = this.resolve(choice);
    document.documentElement.setAttribute('data-theme', resolved);
    const meta = document.getElementById('meta-theme-color');
    if (meta) {
      meta.setAttribute('content', resolved === 'light' ? '#faf7f0' : '#131418');
    }
  }

  private resolve(choice: ThemeChoice): 'light' | 'dark' {
    if (choice === 'system') {
      return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    return choice;
  }
}
