import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { User } from 'src/decorators/user.decorator';
import { UserEntity } from 'src/entities/User';
import { SetSystemSoundsDto } from './dto';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
  @Inject(SettingsService)
  private readonly settingsService: SettingsService;

  @Get()
  getSettings(@User() user: UserEntity) {
    return this.settingsService.getUserSettings(user.id).then((settings) => ({
      systemSounds: settings.system_sounds,
    }));
  }

  @Post('system-sounds')
  async setSystemSounds(
    @User() user: UserEntity,
    @Body() body: SetSystemSoundsDto,
  ) {
    await this.settingsService.setSystemSounds(user.id, body.enabled);
  }
}
