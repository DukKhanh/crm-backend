import type { AccessTokenPayload } from './auth';

declare module 'express-serve-static-core' {
  interface Request {
    requestId: string;
    user: AccessTokenPayload;
  }
}

export {};