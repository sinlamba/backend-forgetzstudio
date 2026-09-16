import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { DatabaseModule } from '../database/database.module';
import { ClerkModule } from '../clerk/clerk.module';
import { UsersService } from './users.service';


@Module({
  imports:[DatabaseModule , ClerkModule],
  controllers: [UsersController],
  providers:[UsersService]
})
export class UsersModule {}
