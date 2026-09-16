import { Injectable } from '@nestjs/common';
import { Document } from '@langchain/core/documents';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { chunkit } from 'semantic-chunking';
import { randomUUID } from 'crypto';
import { QdrantService } from '../qdrant/qdrant.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RagService {
  private readonly embeddings: GoogleGenerativeAIEmbeddings;

  constructor(
    private readonly qdrant: QdrantService,
    private readonly configService: ConfigService,
  ) {
    this.embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: this.configService.getOrThrow('GEMINI_APIKEY'),
      model: 'gemini-embedding-001',
    });
  }

  async split(text: string): Promise<Document[]> {
    const chunks = await chunkit(
      [
        {
          document_name: 'document',
          document_text: text,
        },
      ],
      {
        maxTokenSize: 500,
        similarityThreshold: 0.5,
      },
    );

    return chunks.map(
      (chunk, index) =>
        new Document({
          pageContent: chunk.text,
          metadata: {
            chunk: index,
          },
        }),
    );
  }

  async insertDocument(text: string, metadata?: Record<string, any>) {
    const docs = await this.split(text);

    const vectors = await this.embeddings.embedDocuments(
      docs.map((doc) => doc.pageContent),
    );

    await this.qdrant.ensureCollectionExists('company-doc-v2', 768);

    await this.qdrant.client.upsert('company-doc-v2', {
      wait: true,

      points: docs.map((doc, index) => ({
        id: randomUUID(),

        vector: vectors[index],

        payload: {
          text: doc.pageContent,
          chunk: index,
          createdAt: new Date().toISOString(),
          ...metadata,
        },
      })),
    });

    return {
      inserted: docs.length,
    };
  }

async search(question: string) {
  const vector = await this.embeddings.embedQuery(question);

  const result = await this.qdrant.client.query('company-doc-v2', {
    query: vector,
    limit: 5,
    with_payload: true,
    with_vector: false,
  });

  return result.points
    .map((item) => item.payload?.text as string)
    .filter(Boolean)
    .join('\n\n');
}
}
