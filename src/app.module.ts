import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AiModule } from './ai/ai.module';
import { GmailModule } from './gmail/gmail.module';
import { ConfigModule } from '@nestjs/config';
import { McpModule } from '@nestjs-mcp/server';
import { GraphModule } from './graph/graph.module';
import { QdrantService } from './qdrant/qdrant.service';
import { QdrantModule } from './qdrant/qdrant.module';
import { RagModule } from './rag/rag.module';
import { configEnvModule } from './common/configEnv/config.module';
import { LangfuseModule } from './langfuse/langfuse.module';

import { TesseractModule } from './tesseract/tesseract.module';
import { TesseractService } from './tesseract/tesseract.service';

import { APP_GUARD } from '@nestjs/core';
import { GithubService } from './github/github.service';
import { ClerkModule } from './clerk/clerk.module';
import { ClerkAuthGuard } from './common/guard/clerk.guard';
import { DatabaseModule } from './database/database.module';
import { UsersService } from './users/users.service';
import { UsersModule } from './users/users.module';
import { GithubModule } from './github/github.module';
import { PrismaHelper } from './common/utils/prismaPattern';
import { InstagramModule } from './instagram/instagram.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    McpModule.forRoot({
      name: 'My MCP Server',
      version: '1.0.0',
    }),
    configEnvModule,
    AiModule,
    ScheduleModule.forRoot(),
    RagModule,
    QdrantModule,
    GmailModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    GraphModule,
    LangfuseModule,
    TesseractModule,
    ClerkModule,
    DatabaseModule,
    UsersModule,
    GithubModule,
    InstagramModule
  ],
  controllers: [AppController],
  providers: [
    PrismaHelper,
    AppService,
    QdrantService,
    TesseractService,
    {
      provide: APP_GUARD,
      useClass: ClerkAuthGuard,
    },
    GithubService,
    UsersService,
  ],
})
export class AppModule { }
