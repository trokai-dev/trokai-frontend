import { Clothes, StorageService, User } from '@trokai/shared-core';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { NavController } from '@ionic/angular/standalone';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { ProductService } from '@trokai/shared-data-access';
import {
  AlertService,
  QUESTIONS_SECURITY_DIALOG_AGREED_KEY,
  TkQuestionsSecurityDialogComponent,
} from '@trokai/shared-ui';
import { AuthService } from 'src/app/services/auth.service';
import { BackButtonComponent } from '../../shared/components/back-button/back-button.component';

@Component({
  selector: 'app-questions-page',
  templateUrl: './questions-page.page.html',
  styleUrls: ['./questions-page.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    BackButtonComponent,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
})
export class QuestionsPage implements OnInit {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private alert = inject(AlertService);
  private productService = inject(ProductService);
  private navCtrl = inject(NavController);
  private matDialog = inject(MatDialog);
  private storage = inject(StorageService);

  productId: string | undefined;
  product: Clothes;

  user: User;
  isOwner = false;
  message = '';

  questionId: string | null = null;
  question = null;
  sent = false;

  ngOnInit(): void {
    this.productId = this.findParam('product_id');
    this.questionId = this.findParam('question_id') ?? null;
    this.user = this.authService.getUserValue();
    this.start();
  }

  /** product_id lives on the parent `product/:product_id` route segment. */
  private findParam(name: string): string | undefined {
    let snap: ActivatedRouteSnapshot | null = this.route.snapshot;
    while (snap) {
      const value = snap.paramMap.get(name);
      if (value) return value;
      snap = snap.parent;
    }
    return undefined;
  }

  async start() {
    if (!this.productId) {
      this.alert.alert('Produto não encontrado!');
      this.navCtrl.back();
      return;
    }

    this.message = null;
    this.sent = false;

    try {
      this.product = (
        await this.productService.fetchCompleteProduct(this.productId)
      ).clothes;
      this.isOwner = this.product.owner === this.user?._id;

      if (this.questionId && this.product.questions)
        this.question = this.product.questions.find(
          (q) => q._id == this.questionId,
        );

      if (!this.question && this.isOwner) {
        this.alert.alert('Pergunta não encontrada!');
        this.navCtrl.back();
        return;
      }

      await this.handleAlerts();
    } catch {
      /* intentional */
    }
  }

  async handleAlerts() {
    const agreed = await this.storage.has(QUESTIONS_SECURITY_DIALOG_AGREED_KEY);
    if (agreed) return;

    const ref = this.matDialog.open(TkQuestionsSecurityDialogComponent, {
      panelClass: 'dialog-security-questions',
      disableClose: true,
      data: { seller: this.isOwner },
    });
    await firstValueFrom(ref.afterClosed());

    const agreedAfter = await this.storage.has(
      QUESTIONS_SECURITY_DIALOG_AGREED_KEY,
    );
    if (!agreedAfter) this.navCtrl.back();
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

    if (this.isOwner) {
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
  }
}
