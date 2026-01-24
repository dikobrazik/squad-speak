import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from 'src/entities/Session';
import { SessionService } from './session.service';
import { SessionController } from './session.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Session])],
  providers: [SessionService],
  exports: [SessionService],
  controllers: [SessionController],
})
export class SessionModule {}
