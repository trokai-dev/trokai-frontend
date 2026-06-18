import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnInit,
} from '@angular/core';

export interface MetricDetail {
  value: number;
  score: number;
  label: string;
  status: 'good' | 'warning' | 'critical' | 'neutral';
}

export interface SellerHealthData {
  sellerName: string;
  finalScore: number;
  metrics: {
    cancellationRate?: MetricDetail;
    deliveryTime?: MetricDetail;
    reviewsAverage?: MetricDetail;
    responseRate?: MetricDetail;
  };
}

interface HealthStatus {
  label: string;
  color: string;
  class: 'excellent' | 'good' | 'warning' | 'critical';
}

interface TipItem {
  isGood: boolean;
  title: string;
  message: string;
}

const METRIC_CONFIG: Record<
  string,
  {
    goodTitle: string;
    goodMessage: string;
    badTitle: string;
    badMessage: (value: number) => string;
  }
> = {
  cancellationRate: {
    goodTitle: '✅ Cancelamentos baixos',
    goodMessage:
      'Sua taxa de cancelamento está ótima! Isso aumenta sua visibilidade nas buscas.',
    badTitle: '📉 Alerta de cancelamento',
    badMessage: (v) =>
      `Sua taxa está em ${(v * 100).toFixed(1)}%. Evite cancelar vendas para não perder exposição nos resultados de busca.`,
  },
  deliveryTime: {
    goodTitle: '📦 Envio rápido',
    goodMessage:
      'Você envia rápido! Isso melhora sua reputação e aumenta suas chances de ganhar selos de destaque.',
    badTitle: '📦 Envio demorado',
    badMessage: (v) =>
      `Seu tempo médio é de ${v} dias. Postar em até 24h úteis aumenta suas chances de destaque.`,
  },
  reviewsAverage: {
    goodTitle: '⭐ Ótimas avaliações',
    goodMessage:
      'Seus compradores adoram você! Continue caprichando na embalagem e no atendimento.',
    badTitle: '⭐ Melhore a experiência',
    badMessage: (v) =>
      `Sua média está em ${v} estrelas. Embale com cuidado e envie um bilhete de agradecimento para melhorar seus reviews.`,
  },
  responseRate: {
    goodTitle: '💬 Atendimento ativo',
    goodMessage:
      'Sua taxa de resposta está ótima! Compradores confiam mais em vendedores comunicativos.',
    badTitle: '💬 Responda mais rápido',
    badMessage: (v) =>
      `Sua taxa de resposta é de ${(v * 100).toFixed(0)}%. Responder rápido aumenta suas conversões.`,
  },
};

@Component({
  selector: 'app-seller-health',
  standalone: true,
  imports: [NgClass],
  templateUrl: './seller-health.component.html',
  styleUrls: ['./seller-health.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SellerHealthComponent implements OnInit, OnChanges {
  @Input() healthData!: SellerHealthData;

  healthStatus!: HealthStatus;
  tipList: TipItem[] = [];

  ngOnInit(): void {
    if (!this.healthData) {
      this.healthData = this.getMockData();
    }
    this.computeDerivedData();
  }

  ngOnChanges(): void {
    if (this.healthData) {
      this.computeDerivedData();
    }
  }

  private computeDerivedData(): void {
    this.healthStatus = this.resolveHealthStatus();
    this.tipList = this.resolveTipList();
  }

  private resolveHealthStatus(): HealthStatus {
    const score = this.healthData.finalScore;
    if (score >= 90)
      return { label: 'Excelente', color: '#0f800d', class: 'excellent' };
    if (score >= 70) return { label: 'Bom', color: '#58b692', class: 'good' };
    if (score >= 50)
      return { label: 'Atenção', color: '#faca23', class: 'warning' };
    return { label: 'Crítico', color: '#d43c3c', class: 'critical' };
  }

  private resolveTipList(): TipItem[] {
    return (
      Object.entries(this.healthData.metrics) as [
        string,
        MetricDetail | undefined,
      ][]
    )
      .filter(
        (entry): entry is [string, MetricDetail] => entry[1] !== undefined,
      )
      .map(([key, metric]) => {
        const config = METRIC_CONFIG[key];
        if (!config) return null;
        const isGood = metric.status === 'good';
        return {
          isGood,
          title: isGood ? config.goodTitle : config.badTitle,
          message: isGood
            ? config.goodMessage
            : config.badMessage(metric.value),
        };
      })
      .filter((tip): tip is TipItem => tip !== null);
  }

  private getMockData(): SellerHealthData {
    return {
      sellerName: 'Loja do Trokaí',
      finalScore: 68,
      metrics: {
        cancellationRate: {
          value: 0.12,
          score: 4,
          label: 'Taxa de Cancelamento',
          status: 'critical',
        },
        deliveryTime: {
          value: 1.5,
          score: 9,
          label: 'Tempo de Envio (Dias)',
          status: 'good',
        },
        reviewsAverage: {
          value: 4.2,
          score: 8,
          label: 'Média de Avaliações',
          status: 'good',
        },
      },
    };
  }
}
