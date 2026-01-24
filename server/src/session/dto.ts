import { IsUUID } from 'class-validator';

export class SessionDeleteDto {
  @IsUUID()
  id: string;
}
