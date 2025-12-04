import bcrypt from "bcryptjs";
import { UserRole } from "@db/client";
import { signJwtToken } from "./utils";
import { AppInstance } from "@/types";
import { ErrorUnauthorized } from "@/types/error";
import { ErrorAuthFailed, ErrorBanned } from "./error";
import { hashPassword, shaWithSalt } from "@/lib/crypto";
import { ENV_BACKEND_LOGIN_PASSWORD } from "@/config/env";

declare module "fastify" {
  interface FastifyContextConfig {
    /**
     * 是否禁用用户登录访问（允许公开访问呢）
     * @default false
     */
    disableAuth?: boolean;
    /**
     * 是否为管理员权限才能访问
     * @default false
     */
    requireAdmin?: boolean;
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { id: string; username: string; role: string };
    user: { id: string; username: string; role: string };
  }
}

interface RegisterOptions {
  server: AppInstance;
}

export const registerController = (options: RegisterOptions) => {
  const { server } = options;

  // 根据配置给路由添加 swagger 安全定义
  server.addHook("onRoute", (routeOptions) => {
    const { disableAuth } = routeOptions.config || {};

    if (!disableAuth && routeOptions.schema) {
      routeOptions.schema.security = routeOptions.schema.security || [];
      (routeOptions.schema.security as any[]).push({ bearerAuth: [] });
    }
  });

  server.addHook("preHandler", async (request) => {
    const { disableAuth, requireAdmin } = request.routeOptions.config;
    if (!disableAuth) {
      try {
        await request.jwtVerify();
      } catch (err) {
        console.error(err);
        throw new ErrorUnauthorized();
      }

      if (requireAdmin && request.user.role !== UserRole.ADMIN) {
        throw new ErrorBanned();
      }
    }
  });

  server.post(
    "/auth/login",
    {
      config: {
        disableAuth: true,
      },
      schema: {
        description: "用户登录",
        tags: ["auth"],
        body: {
          type: "object",
          required: ["password"],
          properties: {
            password: {
              type: "string",
            },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              token: { type: "string", description: "JWT 令牌" },
            },
          },
        },
      },
    },
    async (request) => {
      const { password } = request.body;

      // 验证密码
      const isPasswordValid = await bcrypt.compare(
        password,
        hashPassword(shaWithSalt(ENV_BACKEND_LOGIN_PASSWORD, "admin")),
      );
      if (!isPasswordValid) {
        throw new ErrorAuthFailed();
      }

      // 生成 JWT 令牌
      const token = signJwtToken(server, {
        id: "admin",
        username: "admin",
        role: UserRole.ADMIN,
      });

      return {
        token,
      };
    },
  );

  server.post(
    "/auth/renew",
    {
      schema: {
        description: "续期 JWT 令牌",
        tags: ["auth"],
        response: {
          200: {
            type: "object",
            properties: {
              token: { type: "string", description: "新的 JWT 令牌" },
            },
          },
          401: {
            type: "object",
            properties: {
              error: { type: "string", description: "错误信息" },
            },
          },
        },
      },
    },
    async (request) => {
      // 已经在 preHandler 中验证了 JWT，这里直接生成新的令牌
      const user = request.user;
      const newToken = signJwtToken(server, user);

      return {
        token: newToken,
      };
    },
  );
};
