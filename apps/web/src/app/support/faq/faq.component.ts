import {
  Component,
  Renderer2,
  PLATFORM_ID,
  DOCUMENT,
  inject,
  OnInit,
} from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GlobalService } from 'src/app/services/global.service';
import { FaqData } from '@trokai/shared-core';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [MatExpansionModule, MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss',
})
export class FaqComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private renderer = inject(Renderer2);
  private globalService = inject(GlobalService);
  private document = inject<Document>(DOCUMENT);
  private platformId = inject(PLATFORM_ID);

  faq?: FaqData;

  async ngOnInit() {
    try {
      const slug = this.route.snapshot.paramMap.get('slug');

      if (!slug) throw new Error('Slug not found');

      this.faq = await this.globalService.getFaq(slug);

      if (!this.faq) throw new Error('FAQ not found');

      this.globalService.setTitle(`FAQ - ${this.faq.title}`);
      this.globalService.setMetaDescription(
        `Veja as perguntas frequentes de ${this.faq.title} no Trokaí.`,
      );

      if (isPlatformServer(this.platformId))
        this.renderJsonLdScript([this.faq]);
    } catch {
      this.router.navigate(['/help']);
    }
  }

  renderJsonLdScript(faqAll: FaqData[]) {
    const faqJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqAll.flatMap((section) =>
        section.topics.flatMap((topic) =>
          topic.questions.map((q) => ({
            '@type': 'Question',
            name: q.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: q.answer
                .replace(/<b>/gi, '')
                .replace(/<\/b>/gi, '')
                .replace(/<br>/gi, '\n')
                .replace(/\n/g, ' '),
            },
          })),
        ),
      ),
    };
    const script = this.renderer.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(faqJsonLd);
    this.renderer.appendChild(this.document.head, script);
  }

  getAnswerHtml(answer: string) {
    return answer.replace(/\n/g, '<br>');
  }
}
