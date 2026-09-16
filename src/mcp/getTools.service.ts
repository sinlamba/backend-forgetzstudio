import { Injectable } from '@nestjs/common';
import { McpService } from './mcp.service';
import { GmailService } from '../gmail/gmail.service';

@Injectable()
export class ToolService {
  constructor(private readonly mcpService: McpService, private readonly gmailService: GmailService) { }

  getTools() {
    return [
      {
        type: 'function',

        function: {
          name: 'add',

          description: 'Menjumlahkan dua angka',

          parameters: {
            type: 'object',

            properties: {
              a: {
                type: 'number',
                description: 'Angka pertama',
              },

              b: {
                type: 'number',
                description: 'Angka kedua',
              },
            },

            required: ['a', 'b'],
          },
        },
      },

      {
        type: 'function',

        function: {
          name: 'getDatas',

          description: 'Mengambil data users dari database Firebase',

          parameters: {
            type: 'object',
            properties: {},
          },
        },
      },
      {
        type: 'function',

        function: {
          name: 'sendEmail',

          description: `
Mengirim email menggunakan akun Gmail user yang sedang login.

WAJIB gunakan tool ini ketika user meminta email dikirim.

Tool ini benar-benar mengirim email, bukan hanya membuat draft.

ARGUMENT WAJIB:
1. to
   - Alamat email penerima.
2. subject
   - Subject email.
3. body
   - Isi lengkap email.

ATURAN PENTING:
- Ketiga argument "to", "subject", dan "body" WAJIB selalu diberikan.
- "body" tidak boleh kosong.
- Jika user tidak memberikan subject, buat subject yang sesuai dengan tujuan email.
- Jika user tidak memberikan body, buat body email sendiri berdasarkan tujuan yang diberikan user.
- Body harus profesional, jelas, dan relevan.
- Jangan mengarang fakta atau informasi spesifik yang tidak diberikan user.
- Jangan hanya membuat draft jika user meminta email dikirim.
`,

          parameters: {
            type: 'object',

            properties: {
              to: {
                type: 'string',
                description:
                  'Alamat email penerima. WAJIB diisi.',
              },

              subject: {
                type: 'string',
                description:
                  'Subject email. WAJIB diisi. Jika user tidak memberikan subject, buat sendiri berdasarkan tujuan email.',
              },

              body: {
                type: 'string',
                description:
                  'Isi lengkap email. WAJIB diisi dan tidak boleh kosong. Jika user tidak memberikan isi, buat sendiri berdasarkan tujuan email.',
              },
            },

            required: [
              'to',
              'subject',
              'body',
            ],
          },
        },
      }
    ];
  }

  async execute(
    name: string,
    args: any = {},
    userId: string,
  ) {

    const { accessToken, refreshToken } = await this.gmailService.getAccessTokenFromDb({
      userId: userId,
      provider: "Gmail"
    })
    if (!accessToken || !refreshToken) {
      throw new Error("Token not found")
    }

    const handlers = {
      add: () =>
        this.mcpService.add(
          args.a,
          args.b,
        ),

      getDatas: () =>
        this.mcpService.getDatas(),

      sendEmail: () =>
        this.gmailService.sendMessage(
          userId,
          {
            to: args.to,
            subject: args.subject,
            body: args.body,
          }
        )
    };

    const handler = handlers[name];

    if (!handler) {
      throw new Error(`Tool ${name} tidak ditemukan`);
    }

    return handler();
  }
}