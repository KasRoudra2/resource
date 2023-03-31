interface Resource {
  id: string;
  password: string;
  content?: string;
  file?: {
    fileName: string;
    fileType: string;
    fileSize: number;
    fileContent: Buffer;
  };
  expiresAt: number;
}

export { Resource };
