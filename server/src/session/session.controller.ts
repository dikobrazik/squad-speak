import { Controller, Delete, Get, Inject, Param } from '@nestjs/common';
import { DeviceId } from 'src/decorators/device-id.decorator';
import { User } from 'src/decorators/user.decorator';
import { UserEntity } from 'src/entities/User';
import { SessionDeleteDto } from './dto';
import { SessionService } from './session.service';

@Controller('session')
export class SessionController {
  @Inject(SessionService)
  private readonly sessionService: SessionService;

  @Get('active')
  getActiveSessions(@User() user: UserEntity, @DeviceId() deviceId: string) {
    return this.sessionService.getActiveSessions(user.id).then((sessions) =>
      sessions
        .map((session) => ({
          ...session,
          deviceId:
            session.deviceId === deviceId ? 'current' : session.deviceId,
        }))
        .sort((a, b) =>
          a.deviceId === 'current' ? -1 : b.deviceId === 'current' ? 1 : 0,
        ),
    );
  }

  @Delete(':id')
  async removeSession(@Param() params: SessionDeleteDto) {
    await this.sessionService.removeSession(params.id);
  }
}
