import { Controller, forwardRef, Get, Inject, Res } from '@nestjs/common';
import type { Response } from 'express';
import { User } from 'src/decorators/user.decorator';
import { User as UserEntity } from 'src/entities/User';
import { TelegramService } from 'src/telegram/telegram.service';
import { UserService } from './user.service';

@Controller('user')
export class UserController {}
