import { AuthService } from 'src/app/auth/auth.service';
import { Component, Input, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MatRippleModule } from '@angular/material/core';

@Component({
  selector: 'app-product-questions',
  templateUrl: './product-questions.component.html',
  styleUrls: ['./product-questions.component.scss'],
  standalone: true,
  imports: [MatRippleModule, RouterLink, MatIconModule, MatButtonModule],
})
export class ProductQuestionsComponent implements OnInit {
  private authService = inject(AuthService);

  @Input() product!: {
    owner?: string;
    questions?: {
      _id: string;
      question: string;
      answer?: string;
      questioner?: string;
    }[];
  };

  ownerVision = false;
  questions: {
    _id: string;
    question: string;
    answer?: string;
    questioner?: string;
  }[] = [];

  ngOnInit(): void {
    const currentUserId = this.authService.getUserValue()?._id;

    this.ownerVision = currentUserId === this.product.owner;

    // se for o dono, mostra todas as perguntas. Se for um usuário comum, mostra só as perguntas respondidas e as perguntas feitas por ele
    this.questions = this.ownerVision
      ? (this.product.questions ?? [])
      : (this.product.questions ?? []).filter(
          (q) => q.answer || q.questioner === currentUserId,
        );
  }
}
