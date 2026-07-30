import type { Request } from 'express';

export interface RequestMetadata {
  ipAddress?: string;
  userAgent?: string;
  deviceId?: string;
  deviceName?: string;
}

export function getRequestMetadata(req: Request): RequestMetadata {
  return {
    ipAddress: req.ip,
    userAgent: req.get('user-agent')?.slice(0, 500),
    deviceId: req.get('x-device-id')?.slice(0, 200),
    deviceName: req.get('x-device-name')?.slice(0, 200),
  };
}
