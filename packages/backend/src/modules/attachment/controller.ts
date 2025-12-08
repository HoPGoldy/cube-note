import { Type } from "typebox";
import type { AttachmentService } from "./service";
import type { AppInstance } from "@/types";
import {
  createFileInfoVo,
  SchemaAccessTokenResponse,
  SchemaAttachmentInfo,
  SchemaDownloadQuery,
} from "./schema";
import { createReadStream } from "fs";
import { ErrorFileNotFound, ErrorNoFile, ErrorWrongSignature } from "./error";

interface RegisterOptions {
  server: AppInstance;
  attachmentService: AttachmentService;
}

export const registerController = (options: RegisterOptions) => {
  const { server, attachmentService } = options;

  server.post(
    "/attachments/upload",
    {
      schema: {
        description: "上传文件",
        tags: ["attachment"],
        consumes: ["multipart/form-data"],
        response: {
          200: SchemaAttachmentInfo,
        },
      },
    },
    async (request) => {
      const data = await request.file();

      if (!data) {
        throw new ErrorNoFile();
      }

      const fileBuffer = await data.toBuffer();
      const originalFilename = data.filename;
      const mimeType = data.mimetype;

      const result = await attachmentService.uploadFile(
        request.user.id,
        fileBuffer,
        originalFilename,
        mimeType,
      );

      return createFileInfoVo(result);
    },
  );

  server.post(
    "/attachments/request",
    {
      schema: {
        description: "请求文件访问令牌",
        tags: ["attachment"],
        body: Type.Object({
          id: Type.String(),
        }),
        response: {
          200: SchemaAccessTokenResponse,
        },
      },
    },
    async (request) => {
      const { id } = request.body;
      const info = await attachmentService.createAccessToken(id);
      return {
        url: `/api/attachments/download?i=${info.id}&t=${info.date}&s=${info.signature}`,
      };
    },
  );

  server.get(
    "/attachments/download",
    {
      config: {
        disableAuth: true,
      },
      schema: {
        description: "下载文件",
        tags: ["attachment"],
        querystring: SchemaDownloadQuery,
      },
    },
    async (request, reply) => {
      const { i: id, t: date, s: signature } = request.query;

      const verifySignature = attachmentService.generateFileAccessSignature(
        id,
        date,
      );
      if (verifySignature !== signature) {
        throw new ErrorWrongSignature();
      }

      const file = await attachmentService.getFileInfo(id);
      if (!file) {
        throw new ErrorFileNotFound();
      }

      reply.header("Content-Type", file.type);
      reply.header(
        "Content-Disposition",
        `attachment; filename=${encodeURIComponent(file.filename)}`,
      );
      reply.header("Content-Length", file.size.toString());
      reply.header("Cache-Control", "max-age=2592000"); // 缓存一个月

      const fileStream = createReadStream(file.path);
      return reply.send(fileStream);
    },
  );

  server.get(
    "/attachments/view",
    {
      config: {
        disableAuth: true,
      },
      schema: {
        description: "查看文件（图片等）",
        tags: ["attachment"],
        querystring: SchemaDownloadQuery,
      },
    },
    async (request, reply) => {
      const { i: id, t: date, s: signature } = request.query;

      const verifySignature = attachmentService.generateFileAccessSignature(
        id,
        date,
      );
      if (verifySignature !== signature) {
        throw new ErrorWrongSignature();
      }

      const file = await attachmentService.getFileInfo(id);
      if (!file) {
        throw new ErrorFileNotFound();
      }

      // 对于图片文件，使用 inline 显示而不是 attachment 下载
      const contentDisposition = file.type.startsWith("image/")
        ? `inline; filename=${encodeURIComponent(file.filename)}`
        : `attachment; filename=${encodeURIComponent(file.filename)}`;

      reply.header("Content-Type", file.type);
      reply.header("Content-Disposition", contentDisposition);
      reply.header("Content-Length", file.size.toString());
      reply.header("Cache-Control", "max-age=2592000"); // 缓存一个月

      const fileStream = createReadStream(file.path);
      return reply.send(fileStream);
    },
  );

  server.post(
    "/attachments/info",
    {
      schema: {
        description: "获取文件信息",
        tags: ["attachment"],
        body: Type.Object({
          id: Type.String(),
        }),
        response: {
          200: SchemaAttachmentInfo,
        },
      },
    },
    async (request) => {
      const { id } = request.body;
      const file = await attachmentService.getFileInfo(id);
      if (!file) {
        throw new ErrorFileNotFound();
      }
      return createFileInfoVo(file);
    },
  );
};
