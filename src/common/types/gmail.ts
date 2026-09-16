
interface GmailMessagePartBody {
  data?: string;
  size?: number;
  attachmentId?: string;
}

interface GmailMessagePart {
  mimeType?: string;
  filename?: string;
  headers?: Array<{
    name: string;
    value: string;
  }>;
  body?: GmailMessagePartBody;
  parts?: GmailMessagePart[];
}

 export interface GmailPayload {
  mimeType?: string;
  filename?: string;
  headers?: Array<{
    name: string;
    value: string;
  }>;
  body?: GmailMessagePartBody;
  parts?: GmailMessagePart[];
}
