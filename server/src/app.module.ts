import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthorizationModule } from './authorization/authorization.module';
import { Room } from './entities/Room';
import { User } from './entities/User';
import { EventsModule } from './events/events.module';
import { RoomModule } from './room/room.module';
import { UserModule } from './user/user.module';
import { TurnModule } from './turn/turn.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [User, Room],
        synchronize: true,
      }),
    }),
    RoomModule,
    EventsModule,
    AuthorizationModule,
    UserModule,
    TurnModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
