import { User } from '@trokai/shared-core';

export type NegotiationType = 'sale' | 'purchase';

const SEMANA = [
  'Domingo',
  'Segunda-Feira',
  'Terça-Feira',
  'Quarta-Feira',
  'Quinta-Feira',
  'Sexta-Feira',
  'Sábado',
];

export class Chat {
  negotiationId!: string;
  negotiationType!: NegotiationType;
  unreadCount!: number;
  lastMessage!: {
    _id: string;
    text: string;
    createdAt: Date;
  };
  otherUser!: User;
}

export class Message {
  _id!: string;
  senderId!: string;
  targetId!: string;
  negotiationId!: string;
  negotiationType!: NegotiationType;
  text!: string;
  delivered!: number;
  createdAt!: Date;

  constructor(init?: Partial<Message>) {
    if (init) Object.assign(this, init);
  }

  get timeFormatted(): string {
    const t = new Date(this.createdAt);
    const h = t.getHours().toString().padStart(2, '0');
    const m = t.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  }

  get dayDiff(): number {
    const MS_PER_DAY = 1000 * 60 * 60 * 24;
    const a = new Date(this.createdAt);
    const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const now = new Date();
    const utc2 = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.floor((utc2 - utc1) / MS_PER_DAY);
  }

  get dayLabel(): string {
    const diff = this.dayDiff;
    if (diff === 0) return 'Hoje';
    if (diff === 1) return 'Ontem';
    const a = new Date(this.createdAt);
    if (diff < 7) return SEMANA[a.getDay()];
    const day = a.getDate().toString().padStart(2, '0');
    const month = (a.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}/${a.getFullYear()}`;
  }
}

export interface ChatTimeDivider {
  timeDiff: true;
  senderId: string;
  text: string;
}

export type ChatEntry = Message | ChatTimeDivider;
