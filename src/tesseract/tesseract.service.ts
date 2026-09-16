import { Injectable, Logger } from '@nestjs/common';
import { createWorker } from 'tesseract.js';
import * as mammoth from 'mammoth';

// pdf-parse adalah CommonJS-only module yang tidak memiliki ESM export.
// Karena runtime NestJS berjalan di CJS (tidak ada "type":"module" di package.json),
// kita gunakan require() langsung dengan type assertion yang aman.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse') as (
  buffer: Buffer,
  options?: Record<string, unknown>,
) => Promise<{ text: string; numpages: number; info: Record<string, unknown> }>;


@Injectable()
export class TesseractService {
  private readonly logger = new Logger(TesseractService.name);

  async extractTextFromFile(file: Express.Multer.File): Promise<string> {
    if (!file || !file.buffer) {
      throw new Error('File buffer tidak valid atau kosong');
    }

    const mimeType = file.mimetype ? file.mimetype.toLowerCase() : '';

    // 1. Text & Markdown files
    if (mimeType.startsWith('text/') || mimeType === 'application/json') {
      return file.buffer.toString('utf-8');
    }

    // 2. PDF Documents
    if (mimeType === 'application/pdf' || file.originalname?.endsWith('.pdf')) {
      try {
        const pdfData = await pdfParse(file.buffer);
        if (pdfData.text && pdfData.text.trim().length > 0) {
          return pdfData.text;
        }
      } catch (err) {
        this.logger.warn('Gagal membaca PDF text stream, mencoba OCR fallback...', err);
      }
    }

    // 3. Word Documents (DOCX)
    if (
      mimeType ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimeType === 'application/msword' ||
      file.originalname?.endsWith('.docx')
    ) {
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      return result.value;
    }

    // 4. Images (PNG, JPEG, WEBP) -> OCR via Tesseract.js
    if (mimeType.startsWith('image/')) {
      return this.ocrImage(file.buffer);
    }

    // Default Fallback
    return file.buffer.toString('utf-8');
  }

  async ocrImage(buffer: Buffer): Promise<string> {
    const worker = await createWorker('eng');
    try {
      const ret = await worker.recognize(buffer);
      await worker.terminate();
      return ret.data.text;
    } catch (err) {
      await worker.terminate();
      this.logger.error('Error saat menjalankan OCR pada gambar:', err);
      throw err;
    }
  }
}

