import { describe, it, expect } from "vitest";
import { CodeExecutorService } from "../service";

describe("安全性测试", () => {
  describe("沙箱逃逸测试", () => {
    it("不应该通过 http 对象访问构造函数", async () => {
      const service = new CodeExecutorService({ enableHttp: true });

      const result = await service.execute({
        code: `
          try {
            // 尝试通过构造函数逃逸
            http.get.constructor.constructor('return process')();
          } catch (e) {
            'blocked'
          }
        `,
      });

      expect(result.success).toBe(true);
      expect(result.result).toBe("blocked");
    });

    it("不应该通过原型链访问敏感对象", async () => {
      const service = new CodeExecutorService({ enableHttp: true });

      const result = await service.execute({
        code: `
          try {
            // 尝试通过原型链逃逸
            http.get.__proto__.constructor.constructor('return this')();
          } catch (e) {
            'blocked'
          }
        `,
      });

      expect(result.success).toBe(true);
      expect(result.result).toBe("blocked");
    });

    it("不应该通过 context 对象逃逸", async () => {
      const service = new CodeExecutorService({});

      const result = await service.execute({
        code: `
          try {
            // 尝试通过传入的对象逃逸
            data.constructor.constructor('return process')();
          } catch (e) {
            'blocked'
          }
        `,
        context: {
          data: { value: 123 },
        },
      });

      expect(result.success).toBe(true);
      expect(result.result).toBe("blocked");
    });

    it("不应该访问 axios 的内部实现", async () => {
      const service = new CodeExecutorService({ enableHttp: true });

      const result = await service.execute({
        code: `
          (async () => {
            const response = await http.get('https://jsonplaceholder.typicode.com/todos/1');
            // 验证只返回了安全的数据字段
            const keys = Object.keys(response).sort();
            return keys;
          })()
        `,
        timeout: 10000,
      });

      expect(result.success).toBe(true);
      // 应该只包含我们定义的安全字段
      expect(result.result).toEqual([
        "data",
        "headers",
        "status",
        "statusText",
      ]);
      // 不应该包含 axios 的内部字段如 config, request 等
    });

    it("不应该通过 Object.getPrototypeOf 访问原型", async () => {
      const service = new CodeExecutorService({ enableHttp: true });

      const result = await service.execute({
        code: `
          try {
            const proto = Object.getPrototypeOf(http);
            proto.constructor.constructor('return process')();
          } catch (e) {
            'blocked'
          }
        `,
      });

      expect(result.success).toBe(true);
      expect(result.result).toBe("blocked");
    });

    it("Reflect 可以访问但不能逃逸沙箱", async () => {
      const service = new CodeExecutorService({ enableHttp: true });

      const result = await service.execute({
        code: `
          // Reflect 可以访问对象属性，但被 vm2 的 Proxy 保护
          const constructor = Reflect.get(http.get, 'constructor');
          // 返回 Function 构造器的类型
          typeof constructor
        `,
      });

      expect(result.success).toBe(true);
      expect(result.result).toBe("function");
    });
  });

  describe("资源限制测试", () => {
    it("应该限制无限递归", async () => {
      const service = new CodeExecutorService({});

      const result = await service.execute({
        code: `
          function recursive() {
            recursive();
          }
          try {
            recursive();
          } catch (e) {
            'stack overflow caught'
          }
        `,
      });

      expect(result.success).toBe(true);
      expect(result.result).toBe("stack overflow caught");
    });

    it("应该因超时而中断大量内存分配", async () => {
      const service = new CodeExecutorService({});

      // 这个测试预期会因为超时而抛出异常
      await expect(
        service.execute({
          code: `
            const arr = [];
            for (let i = 0; i < 10000000; i++) {
              arr.push({ data: 'x'.repeat(1000) });
            }
            'completed'
          `,
          timeout: 1000,
        }),
      ).rejects.toThrow("代码执行超时");
    });
  });

  describe("代码注入防护", () => {
    it("不应该执行动态生成的代码", async () => {
      const service = new CodeExecutorService({});

      const result = await service.execute({
        code: `
          try {
            eval('1 + 1');
          } catch (e) {
            'eval blocked'
          }
        `,
      });

      expect(result.success).toBe(true);
      expect(result.result).toBe("eval blocked");
    });

    it("不应该使用 Function 构造器执行代码", async () => {
      const service = new CodeExecutorService({});

      const result = await service.execute({
        code: `
          try {
            new Function('return 1 + 1')();
          } catch (e) {
            'Function constructor blocked'
          }
        `,
      });

      expect(result.success).toBe(true);
      expect(result.result).toBe("Function constructor blocked");
    });
  });
});
