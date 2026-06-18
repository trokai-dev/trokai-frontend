import { User } from './user';

export class AppleResponse {
  authorization!: {
    code: string;
    id_token: string;
  };
  user?: {
    email: string;
    name: {
      firstName: string;
      lastName: string;
    };
  };
}

export class AuthResponseData {
  token!: string;
  user!: User;
  isRegister?: boolean; // app superset
}

export class AuthSessionData {
  token!: string;
  name!: string;
  email!: string;
  avatar!: string;
  _id!: string;
}
