import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Settings } from 'src/entities/Settings';
import { Repository } from 'typeorm';

@Injectable()
export class SettingsService {
  @InjectRepository(Settings)
  private readonly settingsRepository: Repository<Settings>;

  async setSystemSounds(userId: string, enabled: boolean) {
    const settings = await this.getUserSettings(userId);

    settings.system_sounds = enabled;

    await this.settingsRepository.save(settings);
  }

  public async getUserSettings(userId: string) {
    let settings = await this.settingsRepository.findOneBy({ user_id: userId });
    if (!settings) {
      settings = this.settingsRepository.create({
        user_id: userId,
      });

      await this.settingsRepository.save(settings);
    }
    return settings;
  }
}
