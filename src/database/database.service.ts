import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Apikey } from '../common/configEnv/configEnv.service';

@Injectable()
export class DatabaseService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly prisma: ReturnType<typeof this.createClient>;

  constructor(private readonly apiKey: Apikey) {
    this.prisma = this.createClient();
  }

  private createClient() {
    const adapter = new PrismaPg({
      connectionString: this.apiKey.getApikey('DATABASE_URL'),
    });

    const prisma = new PrismaClient({
      adapter,
    });

    return prisma.$extends({
      query: {
        $allModels: {
          async findUnique({  args, query }) {
            const start = performance.now();

            const result = await query(args);

            const latency = performance.now() - start;
   

             console.log(`kecepatan dari performance query anda ${latency.toFixed(2)}`)
             

            return result;
          },
        },
      },
    });
  }

  async onModuleInit() {
    await this.prisma.$connect();
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }

  get user() {
    return this.prisma.user;
  }

  get PlatformIntegration() {
    return this.prisma.platformIntegration;
  }

  get ContainerId() {
    return this.prisma.containerId
  }
  get Gallery() {
    return this.prisma.gallery
  }
}