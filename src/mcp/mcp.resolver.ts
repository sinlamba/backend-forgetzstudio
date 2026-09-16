import { Resolver, Tool } from '@nestjs-mcp/server';
import { z } from 'zod';
import { McpService } from './mcp.service';

@Resolver()
export class McpResolver {
  constructor(private readonly mcpService: McpService) {}

  @Tool({
    name: 'add',
    description: 'Tambah dua angka',
    paramsSchema: {
      a: z.number(),
      b: z.number(),
    },
  })
  add({ a, b }: { a: number; b: number }) {
    const result = this.mcpService.add(a, b);

    return {
      content: [
        {
          type: 'text',
          text: String(result),
        },
      ],
    };
  }
}
