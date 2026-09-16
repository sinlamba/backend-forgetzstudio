import { Module } from '@nestjs/common';

import { McpService } from './mcp.service';
import { ToolService } from './getTools.service';
import { GmailModule } from '../gmail/gmail.module';

@Module({
  imports: [GmailModule],
  providers: [McpService, ToolService,],
  exports: [McpService, ToolService],
})
export class McpModule { }
