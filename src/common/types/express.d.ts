import { ClerkClient } from '@clerk/backend';
import 'express';

declare module 'express' {
  interface Request {
    id: number;
    auth: {
      userId: string;
      sessionId: string | null;
      actor: unknown;
      orgId: string | null;
      orgRole: string | null;
      orgSlug: string | null;
    };
    access_token: string;
  
    user: {
      uid:string
      avatar_url: string
      githubId: number;
      login: string;
      access_token: string
    };
  }

}

declare global {
  namespace Express {
    namespace Multer {
      interface File {
        /** Field name specified in the form */
        fieldname: string;
        /** Name of the file on the user's computer */
        originalname: string;
        /** Encoding type of the file */
        encoding: string;
        /** Mime type of the file */
        mimetype: string;
        /** Size of the file in bytes */
        size: number;
        /** The folder to which the file has been saved (DiskStorage) */
        destination?: string;
        /** The name of the file within the destination (DiskStorage) */
        filename?: string;
        /** The full path to the uploaded file (DiskStorage) */
        path?: string;
        /** A Buffer of the entire file (MemoryStorage) */
        buffer: Buffer;
        /** A readable stream of the file (only available on certain storage) */
        stream?: import('stream').Readable;
      }
    }
  }
}

