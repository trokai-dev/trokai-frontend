import { User } from '@trokai/shared-core';
import { Clothes } from '@trokai/shared-core';
import { StorageService } from '@trokai/shared-core';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  OnInit,
  inject,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { AlertService } from '@trokai/shared-ui';
import { ProductService } from '@trokai/shared-data-access';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import { QUESTIONS_SECURITY_DIALOG_AGREED_KEY } from '@trokai/shared-ui';
import { DialogService } from 'src/app/services/dialog.service';
import { CompletingInformationService } from '@trokai/shared-data-access';

@Component({
  selector: 'app-questions-page',
  templateUrl: './questions-page.component.html',
  styleUrls: ['./questions-page.component.scss'],
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, FormsModule, MatButtonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class QuestionsPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private alert = inject(AlertService);
  private productService = inject(ProductService);
  private router = inject(Router);
  private dialogService = inject(DialogService);
  private completingInformationService = inject(CompletingInformationService);
  private storage = inject(StorageService);

  productId: string | undefined;
  product!: Clothes;

  user!: User;
  isOwner = false;
  message = '';

  questionId: string | null = null;
  question: {
    _id: string;
    question: string;
    answer?: string;
    questioner?: string;
  } | null = null;
  sent = false;

  ngOnInit(): void {
    try {
      const slug = this.route.snapshot.paramMap.get('product_title_id');
      if (!slug) throw new Error('Produto não encontrado');
      const param = slug.split('-');
      this.productId = param[param.length - 1];

      this.questionId = this.route.snapshot.paramMap.get('question_id');

      this.authService.user$.subscribe((u) => {
        if (!u) return;
        this.user = u;
      });
    } catch {
      this.alert.alert('Produto não encontrado!');
      this.router.navigateByUrl('/');
    }
    this.start();
  }

  async start() {
    // nao dar prompt alertas antes de verificar se pode continuar

    if (!this.productId) return;

    this.message = '';
    this.sent = false;

    try {
      this.product = (
        await this.productService.fetchCompleteProduct(this.productId)
      ).clothes;
      this.isOwner = this.product.owner === this.user?._id;

      if (this.questionId && this.product.questions)
        this.question =
          this.product.questions.find((q) => q._id == this.questionId) ?? null;

      if (!this.question && this.isOwner) {
        this.router.navigateByUrl(
          this.productService.mountProductLink(this.product),
        );
        this.alert.alert('Pergunta não encontrada!');
      }

      await this.handleAlerts();
    } catch {
      /* intentional */
    }
  }

  async handleAlerts() {
    const agreed = await this.storage.has(QUESTIONS_SECURITY_DIALOG_AGREED_KEY);
    if (agreed) return;

    await this.dialogService.openQuestionsSecurityDialog(this.isOwner);

    const agreedAfter = await this.storage.has(
      QUESTIONS_SECURITY_DIALOG_AGREED_KEY,
    );

    if (!agreedAfter) {
      this.router.navigateByUrl(
        this.productService.mountProductLink(this.product),
      );
    }
  }

  showForm() {
    return (
      !this.sent &&
      ((this.isOwner && this.question?.question && !this.question?.answer) ||
        (!this.isOwner && !this.question?.question))
    );
  }

  async send() {
    if (!(this.message && this.message.toString().trim().length > 0)) return;
    if (!this.product._id) return;

    try {
      if (this.isOwner) {
        if (this.questionId)
          await this.productService.answerQuestion(
            this.questionId,
            this.product._id,
            this.message,
          );
        this.alert.alert('Resposta enviada!');
      } else {
        await this.productService.askQuestion(this.product._id, this.message);
        this.alert.alert('Pergunta enviada!');
      }

      this.sent = true;
    } finally {
      /* intentional */
    }
  }
}
