import { ClothesStatus } from '../services/inventory.service';

const statusForVisitor = [
  {
    name: 'Todos',
    value: null,
  },
  {
    name: 'Disponíveis',
    value: ClothesStatus.PUBLISHED,
  },
  {
    name: 'Reservados',
    value: ClothesStatus.RESERVED,
  },
  {
    name: 'Vendidos',
    value: ClothesStatus.SOLD,
  },
];

const statusForOwner = [
  {
    name: 'Todos',
    value: null,
  },
  {
    name: 'Requer ajustes',
    value: ClothesStatus.WAITING_ADJUSTMENT,
  },
  {
    name: 'Disponíveis',
    value: ClothesStatus.PUBLISHED,
  },
  {
    name: 'Em análise',
    value: ClothesStatus.WAITING_PUBLICATION,
  },
  {
    name: 'Reservados',
    value: ClothesStatus.RESERVED,
  },
  {
    name: 'Pausados',
    value: ClothesStatus.PAUSED_BY_USER,
  },
  {
    name: 'Expirados',
    value: ClothesStatus.EXPIRED,
  },
  {
    name: 'Vendendo',
    value: ClothesStatus.NEGOTIATING_SELL,
  },
  {
    name: 'Vendidos',
    value: ClothesStatus.SOLD,
  },
];

export { statusForVisitor, statusForOwner };
