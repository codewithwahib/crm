// src/utils/parseFormData.ts
import { Readable } from 'stream';

export interface FileData {
  filename: string;
  mimetype: string;
  encoding: string;
  stream: Readable;
  [key: string]: unknown;
}

export interface ParsedFormData {
  jsonData?: string;
  files: FileData[];
}

export async function parseFormData(request: Request): Promise<ParsedFormData> {
  const formData = await request.formData();
  const result: ParsedFormData = { files: [] };

  // Using Array.from() to safely iterate over FormData entries
  const entries = Array.from(formData.entries());
  
  for (const [key, value] of entries) {
    if (typeof value === 'string') {
      if (key === 'jsonData') {
        result.jsonData = value;
      }
    } else {
      const file: FileData = {
        filename: value.name,
        mimetype: value.type,
        encoding: '7bit',
        stream: Readable.from(Buffer.from(await value.arrayBuffer()))
      };
      result.files.push(file);
    }
  }

  return result;
}