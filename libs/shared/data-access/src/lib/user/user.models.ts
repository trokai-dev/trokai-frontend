import { User } from '@trokai/shared-core';

export interface UserAuthResponse {
  token: string;
  user: User;
  isRegister?: boolean;
}
