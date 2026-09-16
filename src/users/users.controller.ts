import {
  Controller,
  Get,
  Post,
  Req,
} from '@nestjs/common';

import { UsersService } from './users.service';
import type { Request } from 'express';
import { Public } from '../common/decorator/public.decorator';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) { }

@Public()
@Post('webhook/clerk')
async clerkWebhook(@Req() req: Request) {
  return this.usersService.handleClerkWebhook(req.body);
}
}