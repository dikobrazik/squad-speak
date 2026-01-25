import { Transform } from 'class-transformer';
import { IsBoolean, IsUUID } from 'class-validator';

export class AuthorizeDeviceParamsDto {
  @IsUUID()
  id: string;
}

export class AuthorizeDeviceBodyDto {
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  rememberMe: boolean;
}
