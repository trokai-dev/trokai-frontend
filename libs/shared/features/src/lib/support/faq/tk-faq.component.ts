import { Component, Input } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { FaqData } from '@trokai/shared-core';

/**
 * Presentational FAQ accordion (canonical web `mat-expansion` UX). Fetching,
 * routing and SEO/JSON-LD stay in each platform's thin page shell, which passes
 * the resolved `faq` in.
 */
@Component({
  selector: 'tk-faq',
  standalone: true,
  imports: [MatExpansionModule],
  templateUrl: './tk-faq.component.html',
  styleUrl: './tk-faq.component.scss',
})
export class TkFaqComponent {
  @Input({ required: true }) faq!: FaqData;

  getAnswerHtml(answer: string) {
    return answer.replace(/\n/g, '<br>');
  }
}
