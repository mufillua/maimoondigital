import { homeParagraphs } from './home-content';
import { PROJECTS, SITE, SITE_TITLE, SITE_URL } from './site.config';

/**
 * Everything search engines and link previews read about the page.
 * Built from site.config.ts and home-content.ts so it can never drift
 * from what the page actually shows.
 */

/** Shown under the title in search results (kept to ~155 characters). */
export const META_DESCRIPTION =
  'Website design and development for small and medium businesses in Kolkata. Product catalogues, WhatsApp enquiries and phone-first builds.';

/** Title used when the link is shared (WhatsApp, LinkedIn, Instagram, X). */
export const SHARE_TITLE = 'Maimoon Digital: websites that move businesses forward';

export const SHARE_IMAGE = {
  url: `${SITE_URL}/og-image.png`,
  width: 1200,
  height: 630,
  alt: 'Maimoon Digital: we build digital experiences that move businesses forward.',
};

export const LOGO = { url: `${SITE_URL}/icon-512.png`, width: 512, height: 512 };

/** The six services, exactly as listed in the Services paragraph. */
export function services(): string[] {
  const block = homeParagraphs({ whatsapp: '', linkedin: '' }).find((p) => p.id === 'services');
  return (block?.segments ?? [])
    .filter((s) => s.kind === 'styled')
    .map((s) => (s as { text: string }).text.replace(/\.$/, ''));
}

export interface HeadTag {
  kind: 'meta' | 'link';
  attrs: Record<string, string>;
}

/** Meta and link tags for the <head>. */
export function headTags(): HeadTag[] {
  const meta = (attrs: Record<string, string>): HeadTag => ({ kind: 'meta', attrs });
  return [
    meta({ name: 'description', content: META_DESCRIPTION }),
    meta({ name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1' }),
    meta({ name: 'author', content: SITE.founder }),
    { kind: 'link', attrs: { rel: 'canonical', href: `${SITE_URL}/` } },
    meta({ property: 'og:type', content: 'website' }),
    meta({ property: 'og:site_name', content: SITE.name }),
    meta({ property: 'og:locale', content: 'en_IN' }),
    meta({ property: 'og:url', content: `${SITE_URL}/` }),
    meta({ property: 'og:title', content: SHARE_TITLE }),
    meta({ property: 'og:description', content: META_DESCRIPTION }),
    meta({ property: 'og:image', content: SHARE_IMAGE.url }),
    meta({ property: 'og:image:type', content: 'image/png' }),
    meta({ property: 'og:image:width', content: String(SHARE_IMAGE.width) }),
    meta({ property: 'og:image:height', content: String(SHARE_IMAGE.height) }),
    meta({ property: 'og:image:alt', content: SHARE_IMAGE.alt }),
    meta({ name: 'twitter:card', content: 'summary_large_image' }),
    meta({ name: 'twitter:title', content: SHARE_TITLE }),
    meta({ name: 'twitter:description', content: META_DESCRIPTION }),
    meta({ name: 'twitter:image', content: SHARE_IMAGE.url }),
    meta({ name: 'twitter:image:alt', content: SHARE_IMAGE.alt }),
  ];
}

/** schema.org JSON-LD describing the studio, its founder, the site and the page. */
export function structuredData(): object {
  const id = (frag: string) => `${SITE_URL}/#${frag}`;
  const svc = services();
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ProfessionalService',
        '@id': id('business'),
        name: SITE.name,
        url: `${SITE_URL}/`,
        description: SITE.description,
        logo: { '@type': 'ImageObject', ...LOGO },
        image: SHARE_IMAGE.url,
        email: SITE.contact.email,
        telephone: SITE.contact.phoneHref.replace('tel:', ''),
        founder: { '@id': id('founder') },
        address: {
          '@type': 'PostalAddress',
          addressLocality: SITE.city,
          addressRegion: SITE.region,
          addressCountry: SITE.country,
        },
        areaServed: [
          { '@type': 'City', name: SITE.city },
          { '@type': 'Country', name: 'India' },
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'sales',
          telephone: SITE.contact.phoneHref.replace('tel:', ''),
          email: SITE.contact.email,
        },
        sameAs: [SITE.social.instagram],
        knowsAbout: svc,
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Services',
          itemListElement: svc.map((name) => ({
            '@type': 'Offer',
            itemOffered: { '@type': 'Service', name, provider: { '@id': id('business') } },
          })),
        },
      },
      {
        '@type': 'Person',
        '@id': id('founder'),
        name: SITE.founder,
        jobTitle: 'Founder',
        worksFor: { '@id': id('business') },
        sameAs: [SITE.social.linkedin, SITE.social.instagram],
      },
      {
        '@type': 'WebSite',
        '@id': id('website'),
        url: `${SITE_URL}/`,
        name: SITE.name,
        inLanguage: 'en',
        publisher: { '@id': id('business') },
      },
      {
        '@type': 'WebPage',
        '@id': id('webpage'),
        url: `${SITE_URL}/`,
        name: SITE_TITLE,
        description: META_DESCRIPTION,
        inLanguage: 'en',
        isPartOf: { '@id': id('website') },
        about: { '@id': id('business') },
        primaryImageOfPage: { '@type': 'ImageObject', url: SHARE_IMAGE.url, width: SHARE_IMAGE.width, height: SHARE_IMAGE.height },
        // The client websites shown on the page.
        mentions: PROJECTS.map((p) => ({ '@type': 'WebSite', name: p.name, url: p.url })),
      },
    ],
  };
}
