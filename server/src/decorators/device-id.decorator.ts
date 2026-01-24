import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const DeviceId = createParamDecorator(
  (data: never, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest() as Request;
    return request.cookies.deviceId;
  },
);
