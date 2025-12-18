// This file extends the Express namespace to include Multer types
// This is necessary because the @types/express package doesn't include Multer types
declare namespace Express {
  // Keep your existing Multer interface
  namespace Multer {
    interface File {
      fieldname: string;
      originalname: string;
      mimetype: string;
      size: number;
      destination?: string;
      filename?: string;
      path?: string;
      buffer?: Buffer;
      location?: string;
    }
  }

  // 👇 Add this new interface for Stripe raw body
  interface Request {
    rawBody?: string | Buffer;
  }
}
