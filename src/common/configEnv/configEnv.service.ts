import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class Apikey {
  constructor(private readonly configService: ConfigService) {}

  getApikey(url: string): string {
    return this.configService.getOrThrow<string>(url);
  }
  
}
