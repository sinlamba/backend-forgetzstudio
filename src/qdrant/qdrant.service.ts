import { Injectable } from '@nestjs/common';
import { QdrantClient } from '@qdrant/js-client-rest';

@Injectable()
export class QdrantService {
  public client: QdrantClient;

  constructor() {
    this.client = new QdrantClient({
      url: process.env.QDRANT_URL || process.env.QRANT_URL,
      apiKey: process.env.QDRANT_KEY,
    });
  }

  async ensureCollectionExists(collectionName: string, vectorSize = 768) {
    try {
      const collections = await this.client.getCollections();
      const exists = collections.collections.some(
        (c) => c.name === collectionName,
      );
      if (!exists) {
        await this.client.createCollection(collectionName, {
          vectors: {
            size: vectorSize,
            distance: 'Cosine',
          },
        });
      }
    } catch (err) {
      console.error(`Error ensuring Qdrant collection '${collectionName}' exists:`, err);
    }
  }
}

