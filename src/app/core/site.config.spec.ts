import { PROJECTS, SITE } from './site.config';

describe('site config', () => {
  it('has working contact links', () => {
    expect(SITE.contact.phoneHref).toBe('tel:+919073053864');
    expect(SITE.contact.emailHref).toBe('mailto:mufimaimoon@gmail.com');
    expect(SITE.contact.whatsappHref.startsWith('https://wa.me/919073053864?text=')).toBe(true);
  });

  it('encodes the WhatsApp message so it survives the URL', () => {
    const text = new URL(SITE.contact.whatsappHref).searchParams.get('text');
    expect(text).toBe("Hi Mufaddal, I'd like to discuss a website for my business.");
    expect(SITE.contact.whatsappHref).not.toContain(' ');
  });

  it('lists exactly the four real projects with their live URLs', () => {
    expect(PROJECTS.map((p) => p.url)).toEqual([
      'https://www.westernhardwaremart.com/',
      'https://steeltoolsindia.in/',
      'https://www.bhrubberproducts.com/',
      'https://burhani-seal-centre.vercel.app/',
    ]);
  });

  it('gives every media slot a label and alt text, and only points at /work images', () => {
    for (const p of PROJECTS) {
      expect(new Set(PROJECTS.map((x) => x.slug)).size).toBe(PROJECTS.length);
      for (const m of p.media) {
        expect(m.label.length).toBeGreaterThan(0);
        expect(m.alt.length).toBeGreaterThan(0);
        if (m.src) expect(m.src.startsWith(`work/${p.slug}/`)).toBe(true);
      }
    }
  });
});
