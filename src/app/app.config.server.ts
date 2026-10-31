import { DOCUMENT } from '@angular/common';
import { ApplicationConfig, inject, mergeApplicationConfig, provideAppInitializer } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { headTags, structuredData } from './core/seo';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    // Write the SEO tags and JSON-LD into the prerendered <head>. They are
    // built from site.config.ts, so they always match what the page shows.
    provideAppInitializer(() => {
      const doc = inject(DOCUMENT);
      const anchor = doc.head.querySelector('link[rel="icon"]');
      for (const tag of headTags()) {
        const el = doc.createElement(tag.kind);
        for (const [k, v] of Object.entries(tag.attrs)) el.setAttribute(k, v);
        doc.head.insertBefore(el, anchor);
      }
      const script = doc.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      script.textContent = JSON.stringify(structuredData()).replace(/</g, '\\u003c');
      doc.head.appendChild(script);
    }),
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
