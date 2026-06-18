import { Address } from '../models/user';

export function equalAddresses(a1: Address, a2: Address): boolean {
  return (
    a1?.street === a2?.street &&
    a1?.number === a2?.number &&
    a1?.complement === a2?.complement &&
    a1?.neighborhood === a2?.neighborhood &&
    a1?.city === a2?.city &&
    a1?.state === a2?.state &&
    a1?.zipCode === a2?.zipCode
  );
}
