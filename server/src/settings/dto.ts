import { Transform } from 'class-transformer';
import { IsBoolean } from 'class-validator';

export class SetSystemSoundsDto {
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  enabled: boolean;
}
