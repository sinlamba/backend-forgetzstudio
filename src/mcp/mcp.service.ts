import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Users } from '../common/types/index';
import { MessagesDTO } from '../common/dto/MessagesDTO';
import { google } from 'googleapis';
import { DatabaseService } from '../database/database.service';
import { GmailService } from '../gmail/gmail.service';

@Injectable()
export class McpService {

  constructor(private Prisma: DatabaseService, private gmailService: GmailService) {}

  add(a: number, b: number) {
    return a + b;
  }


  async getDatas() {
    const prismaClient = await this.Prisma.user.findMany()

    return prismaClient
  }




  
}

