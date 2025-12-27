import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthorizationModule } from './authorization/authorization.module';
import { JwtAuthGuard } from './authorization/guards/jwt.guard';
import { Room } from './entities/Room';
import { TelegramAccount } from './entities/TelegramAccount';
import { User } from './entities/User';
import { EventsModule } from './events/events.module';
import { RolesGuard } from './guards/roles.guard';
import { RoomModule } from './room/room.module';
import { TelegramModule } from './telegram/telegram.module';
import { TelegramAuthSessionService } from './telegram/telegram-auth-session.service';
import { TurnModule } from './turn/turn.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      global: true,
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow('JWT_SECRET'),
      }),
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [User, Room, TelegramAccount],
        synchronize: true,
      }),
    }),
    RoomModule,
    EventsModule,
    AuthorizationModule,
    UserModule,
    TurnModule,
    TelegramModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // Используем кастомный Guard
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    TelegramAuthSessionService,
  ],
})
export class AppModule {}
