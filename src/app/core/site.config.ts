/**
 * Single source of truth for studio identity, contact details, navigation
 * and portfolio data. Presentation components read from here only.
 */

export interface ContactDetails {
  phoneDisplay: string;
  phoneHref: string;
  email: string;
  emailHref: string;
  whatsappHref: string;
}

export interface NavItem {
  label: string;
  /** Opens the work view instead of scrolling to a section. */
  opensWork?: boolean;
  /** Section id on the home view. */
  fragment?: string;
}

/**
 * A slot for one visual of a project. Leave `src` undefined until a real
 * screenshot exists in /public/work/<slug>/ — the slot then shows a branded
 * preview card built from the project's real details instead of a fake image.
 */
export interface MediaSlot {
  kind: 'desktop' | 'catalogue' | 'mobile';
  /** Label shown in the floating pill while this media is on screen. */
  label: string;
  /** e.g. 'work/western-hardware-mart/home.webp' (relative to /public). */
  src?: string;
  alt: string;
}

export interface ProjectBrand {
  /** Background of the preview card. */
  surface: string;
  /** Text on the preview card. */
  ink: string;
  /** Accent used for the small inline dot and chips. */
  accent: string;
}

export interface Project {
  slug: string;
  number: string;
  name: string;
  url: string;
  displayUrl: string;
  summary: string;
  sector: string;
  scope: string;
  stack: string;
  /** Wording taken from the live site, used on the preview card. */
  tagline: string;
  /** Real product categories from the live site. */
  categories: string[];
  /** The client's own logo (relative to /public). */
  logo: string;
  /** 'tile': logo sits on a white app-icon tile; 'full': the logo already is a tile. */
  logoStyle: 'tile' | 'full';
  brand: ProjectBrand;
  media: MediaSlot[];
  /** The on-site chatbot, for sites that have one. */
  chatbot?: ProjectChatbot;
}

export interface ProjectChatbot {
  /** The chatbot's name on the client's site. */
  name: string;
  /** One line for the work view, shown after "Includes {name},". */
  blurb: string;
}

const WHATSAPP_NUMBER = '919073053864';
const WHATSAPP_MESSAGE =
  "Hi Mufaddal, I'd like to discuss a website for my business.";

/** Production address. Canonical URL, social tags, sitemap and JSON-LD all use it. */
export const SITE_URL = 'https://maimoon.digital';

/** The page title used in search results (kept to ~60 characters). */
export const SITE_TITLE = 'Maimoon Digital | Websites that move businesses forward';

export const SITE = {
  name: 'Maimoon Digital',
  url: SITE_URL,
  city: 'Kolkata',
  region: 'West Bengal',
  country: 'IN',
  wordmark: 'maimoon digital',
  founder: 'Mufaddal Maimoon',
  founderRole: 'Founder, Maimoon Digital',
  description:
    'Maimoon Digital partners with small and medium scale businesses to design and develop thoughtful, high-quality websites that make their products and services stand out.',
  contact: {
    phoneDisplay: '+91 90730 53864',
    phoneHref: 'tel:+919073053864',
    email: 'mufimaimoon@gmail.com',
    emailHref: 'mailto:mufimaimoon@gmail.com',
    whatsappHref: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`,
  } satisfies ContactDetails,
  social: {
    linkedin: 'https://www.linkedin.com/in/mufimaimoon',
    instagram: 'https://www.instagram.com/mufimaimoon/',
  },
  nav: [
    { label: 'Work', opensWork: true },
    { label: 'Services', fragment: 'services' },
    { label: 'About', fragment: 'about' },
    { label: 'Contact', fragment: 'contact' },
  ] satisfies NavItem[],
} as const;

export const PROJECTS: Project[] = [
  {
    slug: 'western-hardware-mart',
    number: '01',
    name: 'Western Hardware Mart',
    url: 'https://www.westernhardwaremart.com/',
    displayUrl: 'westernhardwaremart.com',
    summary:
      'Product catalogue for a Kolkata hydraulics and industrial supplier, with enquiries by WhatsApp and email.',
    sector: 'Hydraulics & industrial supply',
    scope: 'Design + Build',
    stack: 'Angular',
    tagline: 'Your Trusted Hydraulic Solutions Partner',
    categories: [
      'Hydraulic valves',
      'Couplings',
      'Tube fittings',
      'Process instrumentation',
      'Hand tools',
      'Lifting equipment',
    ],
    logo: 'work/western-hardware-mart/logo.webp',
    logoStyle: 'tile',
    brand: { surface: '#0e6690', ink: '#ffffff', accent: '#3c0c84' },
    chatbot: { name: 'Hydra', blurb: 'an on-site chatbot that answers product questions from the catalogue.' },
    media: [
      { kind: 'desktop', label: 'Western Hardware Mart site', alt: 'Western Hardware Mart homepage' },
      { kind: 'catalogue', label: 'Product catalogue', alt: 'Western Hardware Mart product catalogue' },
      { kind: 'mobile', label: 'Mobile view', alt: 'Western Hardware Mart on a phone' },
    ],
  },
  {
    slug: 'steel-tools-india',
    number: '02',
    name: 'Steel Tools India',
    url: 'https://steeltoolsindia.in/',
    displayUrl: 'steeltoolsindia.in',
    summary:
      'Catalogue for a Kolkata tooling business established in 1957, with quote requests by WhatsApp and email.',
    sector: 'Tooling & lifting equipment',
    scope: 'Design + Build',
    stack: 'Angular',
    tagline: 'Precision Tools for Modern Manufacturing',
    categories: [
      'Machine tool accessories',
      'Lathe centres',
      'Solid carbide tools',
      'HSS cutting tools',
      'Spanners & wrenches',
      'Lifting chain & rigging',
    ],
    logo: 'work/steel-tools-india/logo.webp',
    logoStyle: 'tile',
    brand: { surface: '#245490', ink: '#ffffff', accent: '#d8303c' },
    chatbot: { name: 'Sidekick', blurb: 'an on-site chatbot that answers product questions from the catalogue.' },
    media: [
      { kind: 'desktop', label: 'Steel Tools India site', alt: 'Steel Tools India homepage' },
      { kind: 'catalogue', label: 'Product catalogue', alt: 'Steel Tools India product catalogue' },
      { kind: 'mobile', label: 'Mobile view', alt: 'Steel Tools India on a phone' },
    ],
  },
  {
    slug: 'bh-rubber-products',
    number: '03',
    name: 'B H Rubber Products',
    url: 'https://www.bhrubberproducts.com/',
    displayUrl: 'bhrubberproducts.com',
    summary:
      'Catalogue for an industrial rubber and safety products business, with WhatsApp and email enquiries.',
    sector: 'Industrial rubber & safety',
    scope: 'Design + Build',
    stack: 'Angular',
    tagline: 'Industrial Rubber & Safety Solutions',
    categories: ['Safety gloves', 'Leather gloves', 'Workwear', 'Flanges'],
    logo: 'work/bh-rubber-products/logo.webp',
    logoStyle: 'tile',
    brand: { surface: '#1d1d1d', ink: '#ffffff', accent: '#e46018' },
    media: [
      { kind: 'desktop', label: 'B H Rubber Products site', alt: 'B H Rubber Products homepage' },
      { kind: 'catalogue', label: 'Product catalogue', alt: 'B H Rubber Products product catalogue' },
      { kind: 'mobile', label: 'Mobile view', alt: 'B H Rubber Products on a phone' },
    ],
  },
  {
    slug: 'burhani-seal-centre',
    number: '04',
    name: 'Burhani Seal Centre',
    url: 'https://burhanisealcentre.vercel.app/',
    displayUrl: 'burhanisealcentre.vercel.app',
    summary:
      'Website for a Kolkata industrial sealing business — oil seals, hydraulic seals, coupling spiders and more.',
    sector: 'Industrial sealing',
    scope: 'Design + Build',
    stack: 'Angular',
    tagline: 'Industrial Sealing Solutions',
    categories: [
      'Oil seals',
      'Hydraulic seals',
      'Seal kits',
      'PU coupling spiders',
      'O-ring kits',
      'SKF bearings',
    ],
    logo: 'work/burhani-seal-centre/logo.webp',
    logoStyle: 'tile',
    brand: { surface: '#0155b1', ink: '#ffffff', accent: '#0a2a5c' },
    media: [
      { kind: 'desktop', label: 'Burhani Seal Centre site', alt: 'Burhani Seal Centre homepage' },
      { kind: 'catalogue', label: 'Product range', alt: 'Burhani Seal Centre product range' },
      { kind: 'mobile', label: 'Mobile view', alt: 'Burhani Seal Centre on a phone' },
    ],
  },
];
