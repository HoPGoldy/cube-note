import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { buildApp } from "../../../app/build-app";
import type { FastifyInstance } from "fastify";

describe("CodeExecutor API Integration Tests", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("POST /api/code-executor/execute", () => {
    it("应该成功执行简单代码", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/code-executor/execute",
        payload: {
          code: "1 + 1",
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.success).toBe(true);
      expect(body.data.result).toBe(2);
      expect(body.data.executionTime).toBeGreaterThanOrEqual(0);
    });

    it("应该支持上下文变量", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/code-executor/execute",
        payload: {
          code: "x * y",
          context: {
            x: 5,
            y: 6,
          },
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.result).toBe(30);
    });

    it("应该捕获 console 输出", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/code-executor/execute",
        payload: {
          code: "console.log('test'); 42",
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.result).toBe(42);
      expect(body.data.logs).toContain("test");
    });

    it("应该处理代码错误", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/code-executor/execute",
        payload: {
          code: "throw new Error('test error')",
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.success).toBe(false);
      expect(body.data.error).toContain("test error");
    });

    it("应该拒绝无效的请求（缺少 code）", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/code-executor/execute",
        payload: {},
      });

      expect(response.statusCode).toBe(500); // Fastify 验证错误返回 500
    });

    it("应该处理超时", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/code-executor/execute",
        payload: {
          code: "while(true) {}",
          timeout: 100,
        },
      });

      expect(response.statusCode).toBe(408);
    });

    it("应该拒绝超过最大超时时间的请求", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/code-executor/execute",
        payload: {
          code: "1 + 1",
          timeout: 40000,
        },
      });

      expect(response.statusCode).toBe(500); // Fastify 验证错误返回 500
    });
  });

  describe("POST /api/code-executor/validate", () => {
    it("应该验证有效代码", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/code-executor/validate",
        payload: {
          code: "const x = 1 + 1;",
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.valid).toBe(true);
      expect(body.data.error).toBeUndefined();
    });

    it("应该检测语法错误", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/code-executor/validate",
        payload: {
          code: "const x = ;",
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.valid).toBe(false);
      expect(body.data.error).toBeDefined();
    });

    it("应该拒绝无效的请求（缺少 code）", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/code-executor/validate",
        payload: {},
      });

      expect(response.statusCode).toBe(500); // Fastify 验证错误返回 500
    });
  });
});
