import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * The home page is prerendered at build time, so search engines and link
 * previews get the full text in the HTML. Anything else falls back to the
 * client-rendered shell.
 */
export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: '**', renderMode: RenderMode.Client },
];
