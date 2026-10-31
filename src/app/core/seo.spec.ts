import { META_DESCRIPTION, headTags, services, structuredData } from './seo';
import { PROJECTS, SITE, SITE_TITLE, SITE_URL } from './site.config';

describe('seo', () => {
  it('uses the production domain everywhere', () => {
    expect(SITE_URL).toBe('https://maimoon.digital');
    expect(JSON.stringify(headTags())).not.toContain('maimoondigital.vercel.app');
    const canonical = headTags().find((t) => t.attrs['rel'] === 'canonical');
    expect(canonical?.attrs['href']).toBe('https://maimoon.digital/');
  });

  it('keeps the title and description within search-result lengths', () => {
    expect(SITE_TITLE.length).toBeLessThanOrEqual(60);
    expect(META_DESCRIPTION.length).toBeGreaterThanOrEqual(110);
    expect(META_DESCRIPTION.length).toBeLessThanOrEqual(160);
  });

  it('emits exactly one of each head tag', () => {
    const keys = headTags().map((t) => t.attrs['name'] ?? t.attrs['property'] ?? t.attrs['rel']);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('builds the JSON-LD from the site config', () => {
    const graph = (structuredData() as { '@graph': Record<string, unknown>[] })['@graph'];
    const business = graph.find((n) => n['@type'] === 'ProfessionalService')!;
    expect(business['name']).toBe(SITE.name);
    expect(business['email']).toBe(SITE.contact.email);
    expect(business['telephone']).toBe('+919073053864');
    expect(business['knowsAbout']).toEqual(services());
    const page = graph.find((n) => n['@type'] === 'WebPage')!;
    expect((page['mentions'] as { url: string }[]).map((m) => m.url)).toEqual(PROJECTS.map((p) => p.url));
  });

  it('lists the six services shown on the page', () => {
    expect(services()).toEqual([
      'Website design',
      'Angular development',
      'Product catalogues',
      'Responsive builds',
      'Redesigns',
      'Deployment & domains',
    ]);
  });
});
