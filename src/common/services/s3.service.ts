import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';

@Injectable()
export class S3Service {
  private s3Client: S3Client;

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION'),
    });
  }

  async uploadFile(file: Express.Multer.File, key: string): Promise<string> {
    const bucketName = this.configService.get<string>('AWS_S3_BUCKET');

    const upload = new Upload({
      client: this.s3Client,
      params: {
        Bucket: bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      },
    });

    await upload.done();

    return `https://${bucketName}.s3.amazonaws.com/${key}`;
  }

  async generatePresignedUrl(
    key: string,
    bucketName?: string,
  ): Promise<string> {
    const bucket =
      bucketName || this.configService.get<string>('AWS_S3_BUCKET');
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const url = await getSignedUrl(this.s3Client, command, {
      expiresIn: 300, // 5 minutes
    });

    return url;
  }

  async uploadImageFile(
    buffer: Buffer,
    mimetype: string,
    key: string,
  ): Promise<string> {
    const bucketName = this.configService.get<string>(
      'S3_BUCKET_IGEO_PUBLIC_RESOURCES',
    );

    if (!bucketName) {
      throw new Error(
        'S3_BUCKET_NAME is not configured. Please set S3_BUCKET_NAME environment variable.',
      );
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png'];
    if (!allowedMimeTypes.includes(mimetype)) {
      throw new Error(`Unsupported file type: ${mimetype}`);
    }

    const upload = new Upload({
      client: this.s3Client,
      params: {
        Bucket: bucketName,
        Key: key,
        Body: buffer,
        ContentType: mimetype,
      },
    });

    await upload.done();
    return `https://${bucketName}.s3.amazonaws.com/${key}`;
  }

  async putObject(
    fileContent: string,
    key: string,
    bucketName?: string,
  ): Promise<string> {
    const bucket =
      bucketName || this.configService.get<string>('S3_BUCKET_NAME');

    const upload = new Upload({
      client: this.s3Client,
      params: {
        Bucket: bucket,
        Key: key,
        Body: fileContent,
        ContentType: 'text/plain',
      },
    });

    await upload.done();

    return key;
  }

  async getFileContent(key: string, bucketName: string) {
    const response = await this.s3Client.send(
      new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      }),
    );
    if (!response.Body) {
      throw new Error('S3 response body is empty');
    }
    return await this.streamToString(response.Body as Readable);
  }

  async getObject(key: string, bucketName?: string): Promise<Buffer> {
    const targetBucket =
      bucketName || this.configService.get<string>('S3_BUCKET_NAME');

    if (!targetBucket) {
      throw new Error(
        'S3_BUCKET_NAME is not configured. Please set S3_BUCKET_NAME environment variable.',
      );
    }

    try {
      const response = await this.s3Client.send(
        new GetObjectCommand({
          Bucket: targetBucket,
          Key: key,
        }),
      );

      if (!response.Body) {
        throw new Error('S3 response body is empty');
      }

      const arrayBuffer = await response.Body.transformToByteArray();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      throw new Error(`S3 download failed: ${error.message}`);
    }
  }

  async streamToString(stream: Readable): Promise<string> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      stream.on('error', (err) => reject(err));
      stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    });
  }
}
