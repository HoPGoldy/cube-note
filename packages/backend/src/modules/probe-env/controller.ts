import type { ProbeEnvService } from "./service";
import type { AppInstance } from "@/types";
import {
  SchemaProbeEnvListResponse,
  SchemaProbeEnvCreate,
  SchemaProbeEnvUpdate,
  SchemaProbeEnvDelete,
} from "./schema";
import { Type } from "typebox";

interface RegisterOptions {
  server: AppInstance;
  probeEnvService: ProbeEnvService;
}

export const registerController = (options: RegisterOptions) => {
  const { server, probeEnvService } = options;

  // 获取所有环境变量
  server.get(
    "/probe-env/list",
    {
      config: {
        requireAdmin: true,
      },
      schema: {
        description: "获取所有探针环境变量",
        tags: ["probe-env"],
        response: {
          200: SchemaProbeEnvListResponse,
        },
      },
    },
    async () => {
      const list = await probeEnvService.getAll();
      return { list };
    },
  );

  // 创建环境变量
  server.post(
    "/probe-env/add",
    {
      config: {
        requireAdmin: true,
      },
      schema: {
        description: "创建探针环境变量",
        tags: ["probe-env"],
        body: SchemaProbeEnvCreate,
        response: {
          200: Type.Object({ success: Type.Boolean() }),
        },
      },
    },
    async (request) => {
      await probeEnvService.create(request.body);
      return { success: true };
    },
  );

  // 更新环境变量
  server.post(
    "/probe-env/update",
    {
      config: {
        requireAdmin: true,
      },
      schema: {
        description: "更新探针环境变量",
        tags: ["probe-env"],
        body: SchemaProbeEnvUpdate,
        response: {
          200: Type.Object({ success: Type.Boolean() }),
        },
      },
    },
    async (request) => {
      await probeEnvService.update(request.body);
      return { success: true };
    },
  );

  // 删除环境变量
  server.post(
    "/probe-env/delete",
    {
      config: {
        requireAdmin: true,
      },
      schema: {
        description: "删除探针环境变量",
        tags: ["probe-env"],
        body: SchemaProbeEnvDelete,
        response: {
          200: Type.Object({ success: Type.Boolean() }),
        },
      },
    },
    async (request) => {
      await probeEnvService.delete(request.body.id);
      return { success: true };
    },
  );
};
