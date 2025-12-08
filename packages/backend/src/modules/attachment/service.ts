import { PrismaClient, Prisma } from "@db/client";
import { createHash, createHmac } from "crypto";
import { writeFile } from "fs/promises";
import { join } from "path";
import { ENV_JWT_SECRET } from "@/config/env";
import { PATH_USER_FILE } from "@/config/path";

interface ServiceOptions {
  prisma: PrismaClient;
}

export class AttachmentService {
  constructor(private options: ServiceOptions) {}

  async uploadFile(
    userId: string,
    fileBuffer: Buffer,
    originalFilename: string,
    mimeType: string,
  ) {
    const fileHash = createHash("sha256").update(fileBuffer).digest("hex");
    const filePath = join(PATH_USER_FILE, `${fileHash}-${originalFilename}`);

    await writeFile(filePath, fileBuffer);

    const fileInfo: Prisma.AttachmentCreateInput = {
      userId,
      filename: originalFilename,
      size: fileBuffer.length,
      hash: fileHash,
      path: filePath,
      type: mimeType,
    };

    return this.options.prisma.attachment.create({ data: fileInfo });
  }

  /** 生成文件访问签名 */
  generateFileAccessSignature(fileId: string, date: string): string {
    const content = `${date}\n${fileId}`;
    return createHmac("sha256", ENV_JWT_SECRET).update(content).digest("hex");
  }

  async createAccessToken(fileId: string) {
    // 一个月内都可以访问
    const now = new Date();
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const signature = this.generateFileAccessSignature(fileId, date);

    return {
      id: fileId,
      date,
      signature,
    };
  }

  async getFileInfo(fileId: string) {
    return this.options.prisma.attachment.findUnique({ where: { id: fileId } });
  }
}
