import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import { gmail_v1, google } from 'googleapis';
import { Credentials } from 'google-auth-library';
import { PDFParse } from 'pdf-parse';

import { MessagesDTO } from '../common/dto/MessagesDTO';
import { PytonResult } from '../common/types/pyResultType';

import { gmailRepoPort, REPO_PORT } from './port/gmailRepoPort';
import { CLIENT_PORT, gmailClientPort } from './port/gmailClientPort';
import { provider } from '../common/types';

@Injectable()
export class GmailService {
  constructor(



    // HEXAGONAL PATTERN
    @Inject(REPO_PORT)
    private readonly gmailRepository: gmailRepoPort,
     
    @Inject(CLIENT_PORT)
    private readonly gmailClient: gmailClientPort


  ) { }






  async getUrl(userId: string) {
   return this.gmailClient.getOauthUrl(userId)
  }
    
  async getUser(userId :string) {
    return this.gmailRepository.getUserId(userId)
  }
   
//  ini batas dari hxg pattern 
  async handleCallback(
    code: string,
    userId: string,
  ) {
    if (!userId) {
      throw new InternalServerErrorException(
        'User ID tidak ditemukan',
      );
    }

    const tokenData = await this.exchangeToken(code);

    if (!tokenData.access_token) {
      throw new InternalServerErrorException(
        'Access token tidak ditemukan',
      );
    }

    if (!tokenData.refresh_token) {
      throw new InternalServerErrorException(
        'Refresh token tidak ditemukan',
      );
    }

    await this.gmailRepository.saveTokens({
      userId,
      provider: "Gmail",
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      platfromUserId: tokenData.id_token!
    });

    return {
      success: true,
    };
  }

  async checkUserConnection(userId: string, provider:provider):Promise<string> {
    const user = await this.gmailRepository.findUnique(userId, provider);
    return user?.accessToken;
  }

  async getAccessTokenFromDb(userId : string) {
    const result = await this.gmailRepository.findUnique(userId, "Gmail")



    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken
    };
  }

  async getRefreshToken(userId: string) {
    const result = await this.gmailRepository.findUnique(
      userId,
      "Gmail"
    );

    return result || '';
  }

  private async getGmailClient(userId: string) {
    if (!userId) {
      throw new InternalServerErrorException(
        'User ID tidak ditemukan',
      );
    }

    const token = await this.getAccessTokenFromDb(
    userId
 
    )



    if (!token?.accessToken) {
      throw new InternalServerErrorException(
        'Integrasi Gmail tidak ditemukan',
      );
    }

    if (!token.refreshToken) {
      throw new InternalServerErrorException(
        'Refresh token Gmail tidak ditemukan',
      );
    }

    const oauth2Client = this.gmailClient.createClient();

    oauth2Client.setCredentials({
      access_token: token.accessToken || undefined,
      refresh_token: token.refreshToken,
    });

    return google.gmail({
      version: 'v1',
      auth: oauth2Client,
    });
  }

  async getMessages(userId: string) {
    const gmail = await this.getGmailClient(userId);

    const response =
      await gmail.users.messages.list({
        userId: 'me',
        q: 'is:unread has:attachment filename:pdf',
        labelIds: ['INBOX'],
        maxResults: 10,
      });

    return response.data.messages ?? [];
  }


  async getMessage(
    userId: string,
    messageId: string,
  ) {
    if (!messageId?.trim()) {
      throw new InternalServerErrorException(
        'Gmail message ID wajib diisi',
      );
    }

    const gmail = await this.getGmailClient(userId);

    const response =
      await gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full',
      });

    return response.data;
  }

  async getMessageContent(
    userId: string,
    messageId: string,
  ) {
    const message = await this.getMessage(
      userId,
      messageId,
    );

    const headers =
      message.payload?.headers ?? [];

    const getHeader = (name: string) =>
      headers.find(
        (header) =>
          header.name?.toLowerCase() ===
          name.toLowerCase(),
      )?.value ?? '';

    return {
      id: message.id,
      threadId: message.threadId,
      snippet: message.snippet,
      subject: getHeader('subject'),
      from: getHeader('from'),
      to: getHeader('to'),
      body: this.decodeBody(message.payload),
    };
  }

  async exchangeToken(
    code: string,
  ): Promise<Credentials> {
    if (!code) {
      throw new InternalServerErrorException(
        'Authorization code tidak ditemukan',
      );
    }

    const oauth2Client = this.gmailClient.createClient();

    const { tokens } =
      await oauth2Client.getToken(code);

    if (!tokens.access_token) {
      throw new InternalServerErrorException(
        'Gagal mendapatkan access token dari Google',
      );
    }

    return tokens;
  }

  private decodeBase64Url(
    data: string,
  ): string {
    const normalized = data
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const padding = '='.repeat(
      (4 - (normalized.length % 4)) % 4,
    );

    return Buffer.from(
      normalized + padding,
      'base64',
    ).toString('utf-8');
  }

  private decodeBody(
    payload?:
      | gmail_v1.Schema$MessagePart
      | null,
  ): string {
    if (!payload) {
      return '';
    }

    // Body langsung
    if (payload.body?.data) {
      return this.decodeBase64Url(
        payload.body.data,
      );
    }

    if (!payload.parts?.length) {
      return '';
    }

    // Cari text/plain
    const plainPart = payload.parts.find(
      (part) =>
        part.mimeType === 'text/plain',
    );

    if (plainPart?.body?.data) {
      return this.decodeBase64Url(
        plainPart.body.data,
      );
    }

    // Cari text/html
    const htmlPart = payload.parts.find(
      (part) =>
        part.mimeType === 'text/html',
    );

    if (htmlPart?.body?.data) {
      return this.decodeBase64Url(
        htmlPart.body.data,
      );
    }


    for (const part of payload.parts) {
      const nestedBody =
        this.decodeBody(part);

      if (nestedBody) {
        return nestedBody;
      }
    }

    return '';
  }


  async sendMessage(
    userId: string,
    dto: MessagesDTO,
  ) {
    const gmail =
      await this.getGmailClient(userId);

    const raw = [
      `To: ${dto.to}`,
      `Subject: ${dto.subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset=utf-8',
      'Content-Transfer-Encoding: 7bit',
      '',
      dto.body,
    ].join('\r\n');

    const response =
      await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: Buffer.from(raw).toString(
            'base64url',
          ),
        },
      });

    return response.data;
  }


  private findPdfPart(
    part?:
      | gmail_v1.Schema$MessagePart
      | null,
  ): gmail_v1.Schema$MessagePart | null {
    if (!part) {
      return null;
    }

    // PDF ditemukan
    if (
      part.mimeType ===
      'application/pdf'
    ) {
      return part;
    }

    // Cari di child parts
    if (part.parts?.length) {
      for (const child of part.parts) {
        const result =
          this.findPdfPart(child);

        if (result) {
          return result;
        }
      }
    }

    return null;
  }


  async getPdfTextAndSendToPython(
    userId: string,
    messageId: string,
  ) {
    if (!messageId?.trim()) {
      throw new InternalServerErrorException(
        'Message ID wajib diisi',
      );
    }

    if (!userId) {
      throw new Error("TIDAK ADA USERID NYA")
    }

    const gmail =
      await this.getGmailClient(userId);

    // Ambil email
    const message =
      await gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full',
      });

    // Cari PDF
    const pdfPart =
      this.findPdfPart(
        message.data.payload,
      );

    if (!pdfPart) {
      throw new InternalServerErrorException(
        'PDF attachment tidak ditemukan',
      );
    }

    // Ambil attachment ID
    const attachmentId =
      pdfPart.body?.attachmentId;

    if (!attachmentId) {
      throw new InternalServerErrorException(
        'Attachment ID tidak ditemukan',
      );
    }

    // Download attachment
    const attachment =
      await gmail.users.messages.attachments.get(
        {
          userId: 'me',
          messageId,
          id: attachmentId,
        },
      );

    const base64UrlData =
      attachment.data.data;

    if (!base64UrlData) {
      throw new InternalServerErrorException(
        'Attachment data kosong',
      );
    }

    // Base64URL → Buffer
    const pdfBuffer = Buffer.from(
      base64UrlData,
      'base64url',
    );

    // PDF → text
    const pdfData = new PDFParse({
      data: pdfBuffer,
    });

    const textResult =
      await pdfData.getText();

    const text = textResult.text;

    // Text → chunks
    const chunks =
      this.splitText(text);



    // Kirim ke Python
    const pythonResponse =
      await fetch(
        'http://127.0.0.1:8001/predict',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            chunks,
          }),
        },
      );

    const responseText =
      await pythonResponse.text();

    if (!pythonResponse.ok) {
      throw new InternalServerErrorException(
        `Python API error: ${pythonResponse.status} ${responseText}`,
      );
    }

    let pythonResult: PytonResult;

    try {
      pythonResult =
        JSON.parse(
          responseText,
        ) as PytonResult;
    } catch {
      throw new InternalServerErrorException(
        'Response dari Python bukan JSON valid',
      );
    }

    return {
      filename: pdfPart.filename,
      size: pdfBuffer.length,
      text,
      chunks,
      pythonResult,
    };
  }


  private splitText(
    text: string,
    chunkSize = 1500,
    overlap = 200,
  ): string[] {
    if (overlap >= chunkSize) {
      throw new InternalServerErrorException(
        'Overlap harus lebih kecil dari chunkSize',
      );
    }

    const chunks: string[] = [];

    let start = 0;

    while (start < text.length) {
      const end =
        start + chunkSize;

      const chunk =
        text
          .slice(start, end)
          .trim();

      if (chunk) {
        chunks.push(chunk);
      }

      start +=
        chunkSize - overlap;
    }

    return chunks;
  }

  async filteringData(
    userId: string,
    messageId: string,
  ) {
    const pyRes =
      await this.getPdfTextAndSendToPython(
        userId,
        messageId,
      );

    const result =
      pyRes.pythonResult;



    // Jika tidak lolos
    if (result.score < 0.5) {
      const message =
        await this.getMessageContent(
          userId,
          messageId,
        );

      const candidateEmail =
        this.extractEmail(
          message.from,
        );

      if (!candidateEmail) {
        throw new InternalServerErrorException(
          'Email pelamar tidak ditemukan',
        );
      }

      await this.sendMessage(
        userId,
        {
          to: candidateEmail,
          subject:
            'BERKAS TIDAK LOLOS',
          body:
            'Terima kasih Anda telah meluangkan waktu untuk melamar di tempat kami. Mohon maaf, kami tidak dapat melanjutkan proses karena berkas Anda tidak lolos seleksi.',
        },
      );
    }

    return {
      scoreResume: result.score,
      consistency:
        result.consistency,
      confidence:
        result.confidence,
    };
  }

  private extractEmail(
    from: string,
  ): string | null {
    const match =
      from.match(
        /<([^>]+)>/,
      );

    if (match?.[1]) {
      return match[1];
    }


    if (
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        from.trim(),
      )
    ) {
      return from.trim();
    }

    return null;
  }

}


