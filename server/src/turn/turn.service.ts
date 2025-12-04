import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TurnService {
  @Inject(HttpService)
  private readonly httpService: HttpService;
  @Inject(ConfigService)
  private readonly configService: ConfigService;

  public async getTurnCredentials() {
    const apiToken = this.configService.get<string>('CLOUDFLARE_API_TOKEN');
    const turnKey = this.configService.get<string>('CLOUDFLARE_TURN_KEY');

    const response = await firstValueFrom(
      this.httpService.post(
        `https://rtc.live.cloudflare.com/v1/turn/keys/${turnKey}/credentials/generate-ice-servers`,
        { ttl: 86400 },
        {
          headers: {
            Authorization: `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
          },
        },
      ),
    );

    return response.data;
  }
}
