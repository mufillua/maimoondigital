import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ClientLogoComponent } from '../../components/client-logo/client-logo';
import { InlineObjectComponent } from '../../components/inline-object/inline-object';
import { ShowcaseReelComponent } from '../../components/showcase-reel/showcase-reel';
import { MeasureDirective } from '../../core/measure.directive';
import { InlineObject, Paragraph, StyledVariant, homeParagraphs } from '../../core/home-content';
import { ScrollRevealDirective } from '../../core/scroll-reveal.directive';
import { PROJECTS, Project, SITE } from '../../core/site.config';
import { WorkStateService } from '../../core/work-state.service';

/** Flattened, template-friendly form of a paragraph segment. */
interface Token {
  type: 'words' | 'styled' | 'object' | 'break' | 'link' | 'project' | 'work';
  words: string[];
  text?: string;
  lead?: boolean;
  variant?: StyledVariant;
  object?: InlineObject;
  label?: string;
  href?: string;
  external?: boolean;
  project?: Project;
  suffix?: string;
  /** Extra words for screen readers only (e.g. "on LinkedIn"). */
  note?: string;
  /** An inline object glued to the last word, so it never starts a line alone. */
  trailing?: { object: InlineObject; label?: string; lead?: boolean };
}

interface ParagraphView {
  id?: string;
  heading?: string;
  showcase?: boolean;
  tokens: Token[];
}

const words = (text: string) => text.split(/\s+/).filter(Boolean);

@Component({
  selector: 'app-home-stack',
  imports: [InlineObjectComponent, ClientLogoComponent, ShowcaseReelComponent, ScrollRevealDirective, MeasureDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home-stack.html',
  styleUrl: './home-stack.scss',
})
export class HomeStackComponent {
  private readonly work = inject(WorkStateService);

  readonly paragraphs: ParagraphView[] = homeParagraphs({
    whatsapp: SITE.contact.whatsappHref,
    linkedin: SITE.social.linkedin,
  }).map(toView);

  openWork(event: Event, slug?: string): void {
    event.preventDefault();
    this.work.open(slug);
  }
}

function toView(p: Paragraph): ParagraphView {
  const tokens = p.segments.map((s): Token => {
    switch (s.kind) {
      case 'text':
        return { type: 'words', words: words(s.text), lead: s.lead };
      case 'styled':
        return { type: 'styled', words: [], text: s.text, variant: s.variant };
      case 'object':
        return { type: 'object', words: [], object: s.object, label: s.label, lead: s.lead };
      case 'break':
        return { type: 'break', words: [] };
      case 'link':
        return { type: 'link', words: words(s.text), href: s.href, external: s.external, note: s.note };
      case 'work':
        return { type: 'work', words: words(s.text) };
      case 'project': {
        const project = PROJECTS.find((x) => x.slug === s.slug);
        if (!project) throw new Error(`Unknown project "${s.slug}" in home content`);
        return { type: 'project', words: words(project.name), project, suffix: s.suffix };
      }
    }
  });
  // Fold each object into the words before it so the pair wraps together.
  const merged: Token[] = [];
  for (const t of tokens) {
    const prev = merged[merged.length - 1];
    if (t.type === 'object' && (prev?.type === 'words' || prev?.type === 'link') && !prev.trailing) {
      prev.trailing = { object: t.object!, label: t.label, lead: t.lead };
    } else {
      merged.push(t);
    }
  }
  return { id: p.id, heading: p.heading, showcase: p.showcase, tokens: merged };
}
