import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnInit,
} from '@angular/core';
import { SellerHealth, SellerHealthStatus } from '@trokai/shared-core';

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
  selector: 'tk-seller-health',
  standalone: true,
  imports: [NgClass],
  templateUrl: './seller-health.component.html',
  styleUrls: ['./seller-health.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TkSellerHealthComponent implements OnInit, OnChanges {
  // Real seller health, carried inside the user payload (GET /users/me).
  @Input() health?: SellerHealth | null;
  @Input() sellerName = '';

  healthData: SellerHealthData | null = null;
  healthStatus!: HealthStatus;
  tipList: TipItem[] = [];

  ngOnInit(): void {
    this.rebuild();
  }

  ngOnChanges(): void {
    this.rebuild();
  }

  private rebuild(): void {
    this.healthData = this.health ? this.mapHealth(this.health) : null;
    if (this.healthData) this.computeDerivedData();
  }

  // Map the backend health shape (score 0-1, raw metric values) into the
  // component's view model (score 0-100, per-metric good/warning/critical).
  private mapHealth(h: SellerHealth): SellerHealthData {
    const m = h.metrics ?? {};
    const metrics: SellerHealthData['metrics'] = {};

    if (m.cancelRate != null)
      metrics.cancellationRate = this.toMetric(
        'Taxa de Cancelamento',
        m.cancelRate,
        this.thresholdLower(m.cancelRate, 0.05, 0.15),
      );
    if (m.avgShippingDays != null)
      metrics.deliveryTime = this.toMetric(
        'Tempo de Envio (Dias)',
        m.avgShippingDays,
        this.thresholdLower(m.avgShippingDays, 2, 4),
      );
    if (m.reviewsAvg != null)
      metrics.reviewsAverage = this.toMetric(
        'Média de Avaliações',
        m.reviewsAvg,
        this.thresholdHigher(m.reviewsAvg, 4.5, 4),
      );
    if (m.questionResponseRate != null)
      metrics.responseRate = this.toMetric(
        'Taxa de Resposta',
        m.questionResponseRate,
        this.thresholdHigher(m.questionResponseRate, 0.9, 0.7),
      );

    return {
      sellerName: this.sellerName,
      finalScore: Math.round((h.score ?? 0) * 100),
      metrics,
    };
  }

  private toMetric(
    label: string,
    value: number,
    status: MetricDetail['status'],
  ): MetricDetail {
    return { value, score: 0, label, status };
  }

  // Lower is better (cancel rate, shipping days).
  private thresholdLower(
    v: number,
    good: number,
    warn: number,
  ): MetricDetail['status'] {
    if (v <= good) return 'good';
    if (v <= warn) return 'warning';
    return 'critical';
  }

  // Higher is better (reviews average, response rate).
  private thresholdHigher(
    v: number,
    good: number,
    warn: number,
  ): MetricDetail['status'] {
    if (v >= good) return 'good';
    if (v >= warn) return 'warning';
    return 'critical';
  }

  private computeDerivedData(): void {
    this.healthStatus = this.resolveHealthStatus();
    this.tipList = this.resolveTipList();
  }

  private resolveHealthStatus(): HealthStatus {
    // Brand-new sellers have no score yet.
    if (this.health?.status === SellerHealthStatus.INCUBATING || this.health?.score == null)
      return { label: 'Em formação', color: '#58b692', class: 'good' };

    const score = this.healthData?.finalScore ?? 0;
    if (score >= 90)
      return { label: 'Excelente', color: '#0f800d', class: 'excellent' };
    if (score >= 70) return { label: 'Bom', color: '#58b692', class: 'good' };
    if (score >= 50)
      return { label: 'Atenção', color: '#faca23', class: 'warning' };
    return { label: 'Crítico', color: '#d43c3c', class: 'critical' };
  }

  private resolveTipList(): TipItem[] {
    return (
      Object.entries(this.healthData?.metrics ?? {}) as [
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
}
