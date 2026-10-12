import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { HomePageComponent } from './home-page';

// jsdom lacks the browser observers the views use for motion.
class NoopObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): [] {
    return [];
  }
}

beforeAll(() => {
  const g = globalThis as Record<string, unknown>;
  g['IntersectionObserver'] ??= NoopObserver;
  g['ResizeObserver'] ??= NoopObserver;
  window.matchMedia ??= ((query: string) =>
    ({ matches: false, media: query, addEventListener() {}, removeEventListener() {} }) as unknown as MediaQueryList);
});

describe('HomePageComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: '', component: HomePageComponent }])],
    });
  });

  it('renders the home stack with the hero sentence revealed', async () => {
    const harness = await RouterTestingHarness.create('/');
    const el = harness.routeNativeElement!;
    // jsdom has no layout, so test the marked opening sentence rather than
    // scroll positions (the reveal itself is checked in a real browser).
    const lead = Array.from(el.querySelectorAll('.w[data-lead]')).map((w) => w.textContent).join(' ');
    expect(lead).toBe('We build digital experiences that move businesses forward.');
    expect(el.querySelectorAll('a.proj').length).toBe(4);
    expect(el.querySelector('#services')).toBeTruthy();
    expect(el.querySelector('#about')).toBeTruthy();
    expect(el.querySelector('#contact')).toBeTruthy();
    expect(el.querySelector('.pill--home')?.textContent).toContain('Explore our work');
  });

  it('switches to the work view for ?work=open', async () => {
    const harness = await RouterTestingHarness.create('/?work=open');
    const el = harness.routeNativeElement!;
    expect(el.querySelectorAll('article.project').length).toBe(4);
    expect(el.querySelectorAll('app-media-panel').length).toBe(12);
    expect(el.querySelector('.pill--work')).toBeTruthy();
    expect(el.querySelector('app-home-stack')).toBeNull();
  });
});
