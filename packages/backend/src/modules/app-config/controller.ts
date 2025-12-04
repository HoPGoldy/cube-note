import type { AppConfigService } from "./service";
import type { AppInstance } from "@/types";
import { SchemaAppConfig } from "./schema";

interface RegisterOptions {
  server: AppInstance;
  appConfigService: AppConfigService;
}

export const registerController = (options: RegisterOptions) => {
  const { server, appConfigService } = options;

  server.post(
    "/config",
    {
      config: {
        requireAdmin: true,
      },
      schema: {
        description: "获取所有配置列表",
        tags: ["config"],
        response: {
          200: SchemaAppConfig,
        },
      },
    },
    async () => {
      return appConfigService.getAll();
    },
  );

  server.post(
    "/config/update",
    {
      config: {
        requireAdmin: true,
      },
      schema: {
        description: "更新配置",
        tags: ["config"],
        body: SchemaAppConfig,
      },
    },
    async (request) => {
      await appConfigService.setConfigValues(request.body);
      return { success: true };
    },
  );
};
