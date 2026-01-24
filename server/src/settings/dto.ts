import { Transform } from 'class-transformer';
import { IsBoolean } from 'class-validator';

export class SetSystemSoundsDto {
  @IsBoolean()
  @Transform(({ value }) => {
    console.log(value);
    return value === 'true' || value === true;
  })
  enabled: boolean;
}
