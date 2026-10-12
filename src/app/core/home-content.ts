/**
 * The home view is one continuous editorial stack of paragraphs (the
 * reference's structure). Each paragraph is a list of segments so plain
 * words, styled words, inline objects and links can share one text flow.
 */

export type InlineObject = 'appIcon' | 'monogram' | 'toggle' | 'wave' | 'devices' | 'sparkle' | 'globe' | 'designDev' | 'laptop' | 'puzzle';

export type StyledVariant = 'outline' | 'mono' | 'serif' | 'squeeze' | 'redo' | 'select' | 'selected';

export type Segment =
  | { kind: 'text'; text: string; lead?: boolean }
  | { kind: 'styled'; text: string; variant: StyledVariant }
  | { kind: 'object'; object: InlineObject; label?: string; lead?: boolean }
  | { kind: 'project'; slug: string; suffix?: string }
  | { kind: 'break' }
  | { kind: 'link'; text: string; href: string; external?: boolean; note?: string }
  | { kind: 'work'; text: string };

export interface Paragraph {
  /** Anchor id used by the navigation. */
  id?: string;
  /** Visually hidden heading so the page keeps a sensible outline. */
  heading?: string;
  /** Show the client showcase card after this paragraph (phones/tablets). */
  showcase?: boolean;
  segments: Segment[];
}

export interface HomeLinks {
  whatsapp: string;
  linkedin: string;
}

export function homeParagraphs(links: HomeLinks): Paragraph[] {
  return [
    {
      heading: 'Maimoon Digital',
      showcase: true,
      segments: [
        { kind: 'text', text: 'We build digital experiences that move businesses forward.', lead: true },
        { kind: 'object', object: 'appIcon', lead: true },
        {
          kind: 'text',
          text: 'Maimoon Digital partners with small and medium scale businesses to design and develop',
        },
        { kind: 'object', object: 'designDev' },
        {
          kind: 'text',
          text: 'thoughtful, high-quality websites that make their products and services stand out.',
        },
        { kind: 'object', object: 'sparkle' },
      ],
    },
    {
      id: 'about',
      heading: 'About the studio',
      segments: [
        { kind: 'text', text: 'Independent by design. An independent studio founded by' },
        { kind: 'link', text: 'Mufaddal Maimoon', href: links.linkedin, external: true, note: 'on LinkedIn' },
        { kind: 'object', object: 'monogram' },
        {
          kind: 'text',
          text: 'built around the details that make a difference, helping businesses earn a stronger presence online.',
        },
        { kind: 'object', object: 'globe' },
      ],
    },
    {
      id: 'services',
      heading: 'Services',
      segments: [
        { kind: 'text', text: 'A good website takes many disciplines.' },
        { kind: 'styled', variant: 'outline', text: 'Website design.' },
        { kind: 'styled', variant: 'mono', text: 'Angular development.' },
        { kind: 'styled', variant: 'serif', text: 'Product catalogues.' },
        { kind: 'styled', variant: 'squeeze', text: 'Responsive builds.' },
        { kind: 'styled', variant: 'redo', text: 'Redesigns.' },
        { kind: 'styled', variant: 'select', text: 'Deployment & domains.' },
      ],
    },
    {
      segments: [
        { kind: 'text', text: 'Considered design and functional, responsive development,' },
        { kind: 'object', object: 'puzzle' },
        { kind: 'text', text: 'brought together by one person from first sketch to live domain.' },
        { kind: 'text', text: 'You focus on your business.' },
        { kind: 'styled', variant: 'selected', text: "That's where we step in." },
      ],
    },
    {
      segments: [
        { kind: 'text', text: 'Every site is planned for the phone first' },
        { kind: 'object', object: 'devices' },
        { kind: 'text', text: 'then refined for every screen,' },
        { kind: 'object', object: 'laptop' },
        { kind: 'text', text: 'with the care, clarity and speed your customers expect.' },
        { kind: 'object', object: 'toggle' },
      ],
    },
    {
      heading: 'Selected work',
      segments: [
        { kind: 'text', text: 'Recent sites for' },
        { kind: 'project', slug: 'western-hardware-mart', suffix: ',' },
        { kind: 'project', slug: 'steel-tools-india', suffix: ',' },
        { kind: 'project', slug: 'bh-rubber-products' },
        { kind: 'text', text: 'and' },
        { kind: 'project', slug: 'burhani-seal-centre', suffix: '.' },
        { kind: 'break' },
        { kind: 'work', text: 'Explore our work.' },
      ],
    },
    {
      id: 'contact',
      heading: 'Contact',
      segments: [
        { kind: 'text', text: 'Have a project in mind?' },
        {
          kind: 'text',
          text: "Let's build a website that gives your business the digital presence it deserves.",
        },
        { kind: 'break' },
        { kind: 'link', text: "Let's talk", href: links.whatsapp, external: true },
        { kind: 'object', object: 'wave' },
      ],
    },
  ];
}
