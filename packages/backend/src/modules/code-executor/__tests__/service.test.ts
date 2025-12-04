import { describe, it, expect, beforeEach } from "vitest";
import { CodeExecutorService } from "../service";

describe("CodeExecutorService", () => {
  let service: CodeExecutorService;

  beforeEach(() => {
    service = new CodeExecutorService({});
  });

  describe("execute", () => {
    it("应该成功执行简单的 JavaScript 代码", async () => {
      const result = await service.execute({
        code: "1 + 1",
      });

      expect(result.success).toBe(true);
      expect(result.result).toBe(2);
      expect(result.executionTime).toBeGreaterThanOrEqual(0);
      expect(result.logs).toEqual([]);
    });

    it("应该捕获 console.log 输出", async () => {
      const result = await service.execute({
        code: `
          console.log('Hello');
          console.log('World');
          'Done'
        `,
      });

      expect(result.success).toBe(true);
      expect(result.result).toBe("Done");
      expect(result.logs).toEqual(["Hello", "World"]);
    });

    it("应该支持不同类型的 console 输出", async () => {
      const result = await service.execute({
        code: `
          console.log('Log message');
          console.error('Error message');
          console.warn('Warning message');
          console.info('Info message');
        `,
      });

      expect(result.success).toBe(true);
      expect(result.logs).toEqual([
        "Log message",
        "[ERROR] Error message",
        "[WARN] Warning message",
        "[INFO] Info message",
      ]);
    });

    it("应该支持传递上下文变量", async () => {
      const result = await service.execute({
        code: "a + b",
        context: {
          a: 10,
          b: 20,
        },
      });

      expect(result.success).toBe(true);
      expect(result.result).toBe(30);
    });

    it("应该支持复杂的上下文对象", async () => {
      const result = await service.execute({
        code: `
          const sum = user.scores.reduce((acc, score) => acc + score, 0);
          sum / user.scores.length;
        `,
        context: {
          user: {
            name: "Test",
            scores: [80, 90, 85],
          },
        },
      });

      expect(result.success).toBe(true);
      expect(result.result).toBe(85);
    });

    it("应该处理代码执行错误", async () => {
      const result = await service.execute({
        code: "throw new Error('Test error');",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Test error");
      expect(result.executionTime).toBeGreaterThanOrEqual(0);
    });

    it("应该处理语法错误", async () => {
      const result = await service.execute({
        code: "const x = ;", // 语法错误
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("应该在超时后抛出错误", async () => {
      await expect(
        service.execute({
          code: "while(true) {}", // 无限循环
          timeout: 100,
        }),
      ).rejects.toThrow("代码执行超时");
    });

    it("应该支持自定义超时时间", async () => {
      const result = await service.execute({
        code: `
          let sum = 0;
          for (let i = 0; i < 1000000; i++) {
            sum += i;
          }
          sum;
        `,
        timeout: 1000,
      });

      expect(result.success).toBe(true);
      expect(result.executionTime).toBeLessThan(1000);
    });

    it("应该拒绝超过最大超时时间的请求", async () => {
      await expect(
        service.execute({
          code: "1 + 1",
          timeout: 40000, // 超过最大值 30000
        }),
      ).rejects.toThrow("超时时间不能超过");
    });

    it("应该处理返回对象的代码", async () => {
      const result = await service.execute({
        code: `
          ({
            name: 'Test',
            value: 42,
            nested: { foo: 'bar' }
          })
        `,
      });

      expect(result.success).toBe(true);
      expect(result.result).toEqual({
        name: "Test",
        value: 42,
        nested: { foo: "bar" },
      });
    });

    it("应该处理返回数组的代码", async () => {
      const result = await service.execute({
        code: "[1, 2, 3].map(x => x * 2)",
      });

      expect(result.success).toBe(true);
      expect(result.result).toEqual([2, 4, 6]);
    });

    it("应该阻止访问 eval", async () => {
      const result = await service.execute({
        code: 'eval("1 + 1")',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("应该支持 JSON 操作", async () => {
      const result = await service.execute({
        code: `
          const data = JSON.stringify({ test: 'value' });
          JSON.parse(data);
        `,
      });

      expect(result.success).toBe(true);
      expect(result.result).toEqual({ test: "value" });
    });

    it("应该支持数学运算", async () => {
      const result = await service.execute({
        code: `
          Math.sqrt(16) + Math.pow(2, 3)
        `,
      });

      expect(result.success).toBe(true);
      expect(result.result).toBe(12);
    });

    it("应该支持字符串操作", async () => {
      const result = await service.execute({
        code: `
          const str = 'Hello World';
          str.split(' ').reverse().join(' ')
        `,
      });

      expect(result.success).toBe(true);
      expect(result.result).toBe("World Hello");
    });

    it("应该阻止访问 require", async () => {
      const result = await service.execute({
        code: "require('fs')",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("应该阻止访问文件系统（通过 fs）", async () => {
      const result = await service.execute({
        code: `
          const fs = require('fs');
          fs.writeFileSync('/tmp/test.txt', 'test');
        `,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("应该阻止访问 process", async () => {
      const result = await service.execute({
        code: "process.exit(0)",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("沙箱中的 global 对象不会影响宿主环境", async () => {
      // 在沙箱中修改 global 是允许的，但不会影响 Node.js 的真实 global
      const result = await service.execute({
        code: "global.testValue = 'test'; global.testValue",
      });

      expect(result.success).toBe(true);
      expect(result.result).toBe("test");
      // 验证宿主环境的 global 没有被污染
      expect((global as any).testValue).toBeUndefined();
    });
  });

  describe("validate", () => {
    it("应该验证有效的代码", async () => {
      const result = await service.validate("const x = 1 + 1;");

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("应该检测语法错误", async () => {
      const result = await service.validate("const x = ;");

      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("应该验证复杂的代码块", async () => {
      const result = await service.validate(`
        function test() {
          const arr = [1, 2, 3];
          return arr.map(x => x * 2);
        }
        test();
      `);

      expect(result.valid).toBe(true);
    });

    it("应该检测未闭合的括号", async () => {
      const result = await service.validate("function test() {");

      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("HTTP 功能", () => {
    let httpService: CodeExecutorService;

    beforeEach(() => {
      httpService = new CodeExecutorService({
        enableHttp: true,
        httpTimeout: 5000,
      });
    });

    it("应该支持发起 GET 请求", async () => {
      const result = await httpService.execute({
        code: `
          (async () => {
            const response = await http.get('https://jsonplaceholder.typicode.com/todos/1');
            return response.data;
          })()
        `,
        timeout: 10000,
      });

      expect(result.success).toBe(true);
      expect(result.result).toHaveProperty("id", 1);
      expect(result.result).toHaveProperty("title");
    });

    it("应该支持发起 POST 请求", async () => {
      const result = await httpService.execute({
        code: `
          (async () => {
            const response = await http.post(
              'https://jsonplaceholder.typicode.com/posts',
              { title: 'Test', body: 'Test body', userId: 1 }
            );
            return response.data;
          })()
        `,
        timeout: 10000,
      });

      expect(result.success).toBe(true);
      expect(result.result).toHaveProperty("title", "Test");
    });

    it("未启用 HTTP 时不应该有 http 对象", async () => {
      const result = await service.execute({
        code: "typeof http",
      });

      expect(result.success).toBe(true);
      expect(result.result).toBe("undefined");
    });

    it("应该支持域名白名单限制", async () => {
      const restrictedService = new CodeExecutorService({
        enableHttp: true,
        allowedDomains: ["jsonplaceholder.typicode.com"],
      });

      // 允许的域名
      const result1 = await restrictedService.execute({
        code: `
          (async () => {
            const response = await http.get('https://jsonplaceholder.typicode.com/todos/1');
            return response.data.id;
          })()
        `,
        timeout: 10000,
      });

      expect(result1.success).toBe(true);

      // 不允许的域名
      const result2 = await restrictedService.execute({
        code: `
          (async () => {
            const response = await http.get('https://api.github.com/users/github');
            return response.data;
          })()
        `,
        timeout: 10000,
      });

      expect(result2.success).toBe(false);
      expect(result2.error).toContain("不在允许的白名单中");
    });

    it("应该支持通配符域名", async () => {
      const wildcardService = new CodeExecutorService({
        enableHttp: true,
        allowedDomains: ["*.typicode.com"],
      });

      const result = await wildcardService.execute({
        code: `
          (async () => {
            const response = await http.get('https://jsonplaceholder.typicode.com/todos/1');
            return response.data.id;
          })()
        `,
        timeout: 10000,
      });

      expect(result.success).toBe(true);
    });
  });
});
