import type { AuthenticatedActor } from '../modules/authorization/actor';

declare module 'express-serve-static-core' {
  interface Request {
    requestId: string;
    user: AuthenticatedActor;
  }
}

export {};
