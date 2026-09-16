import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

import type { WebhookEvent } from '@clerk/backend';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: DatabaseService,
  ) { }

  async handleClerkWebhook(data: WebhookEvent) {
    switch (data.type) {
      case 'user.created': {
        const clerkUser = data.data;

        const email =
          clerkUser.email_addresses[0]?.email_address;

        if (!email) {
          throw new Error('Email user tidak ditemukan');
        }

        const name = [
          clerkUser.first_name,
          clerkUser.last_name,
        ]
          .filter(Boolean)
          .join(' ');

        await this.prisma.user.create({
          data: {
            clerkId: clerkUser.id,
            email,
            name: name || null,
          },
        });
        break;
      }
      case 'user.deleted': {
        const user = data.data

        await this.prisma.user.deleteMany({
          where: {
            clerkId: user.id
          }
        })
        break
      }
      default: {
        console.log(
          'Unhandled Clerk event:',
          data.type,
        );
      }
    }

    return {
      received: true,
    };
  }
}