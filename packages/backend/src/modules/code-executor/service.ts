import { VM } from "vm2";
import axios, { AxiosRequestConfig } from "axios";
import {
  SchemaCodeExecuteRequestType,
  SchemaCodeExecuteResponseType,
} from "./schema";
import {
  CodeExecutionError,
  CodeExecutionTimeoutError,
  CodeExecutorError,
} from "./error";
import { ProbeEnvService } from "@/modules/probe-env/service";

interface ServiceOptions {
  /**
   * 是否启用 HTTP 请求功能
   * @default false
   */
  enableHttp?: boolean;
  /**
   * HTTP 请求超时时间（毫秒）
   * @default 10000
   */
  httpTimeout?: number;
  /**
   * 允许的域名白名单（如果为空则允许所有域名）
   */
  allowedDomains?: string[];
  /**
   * 环境变量服务（可选，用于注入 env 到沙箱）
   */
  probeEnvService?: ProbeEnvService;
}

export class CodeExecutorService {
  private readonly DEFAULT_TIMEOUT = 5000; // 默认超时时间 5 秒
  private readonly MAX_TIMEOUT = 30000; // 最大超时时间 30 秒
  private readonly DEFAULT_HTTP_TIMEOUT = 10000; // HTTP 请求默认超时 10 秒

  constructor(private options: ServiceOptions) {}

  /**
   * 创建安全的 HTTP 请求函数
   * 使用纯函数而非对象方法，减少原型链攻击面
   */
  private createHttpFunction() {
    const httpTimeout = this.options.httpTimeout || this.DEFAULT_HTTP_TIMEOUT;
    const allowedDomains = this.options.allowedDomains || [];

    // 使用闭包创建纯函数，避免暴露 axios 实例
    const makeRequest = async (
      method: string,
      url: string,
      data?: any,
      config?: AxiosRequestConfig,
    ) => {
      this.validateUrl(url);

      // 只返回必要的数据，不暴露完整的 axios response
      const response = await axios({
        method,
        url,
        data,
        ...config,
        timeout: httpTimeout,
      });

      // 只返回安全的数据部分
      return {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      };
    };

    return {
      /**
       * 发起 GET 请求
       */
      get: async (url: string, config?: AxiosRequestConfig) => {
        return makeRequest("GET", url, undefined, config);
      },
      /**
       * 发起 POST 请求
       */
      post: async (url: string, data?: any, config?: AxiosRequestConfig) => {
        return makeRequest("POST", url, data, config);
      },
      /**
       * 发起 PUT 请求
       */
      put: async (url: string, data?: any, config?: AxiosRequestConfig) => {
        return makeRequest("PUT", url, data, config);
      },
      /**
       * 发起 DELETE 请求
       */
      delete: async (url: string, config?: AxiosRequestConfig) => {
        return makeRequest("DELETE", url, undefined, config);
      },
      /**
       * 通用请求方法
       */
      request: async (config: AxiosRequestConfig) => {
        if (config.url) {
          this.validateUrl(config.url);
        }

        const response = await axios.request({
          ...config,
          timeout: httpTimeout,
        });

        return {
          data: response.data,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        };
      },
    };
  }

  /**
   * 验证 URL 是否在允许的域名列表中
   */
  private validateUrl(url: string) {
    const allowedDomains = this.options.allowedDomains || [];

    if (allowedDomains.length === 0) {
      return; // 没有限制，允许所有域名
    }

    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;

      const isAllowed = allowedDomains.some((domain) => {
        // 支持通配符，如 *.example.com
        if (domain.startsWith("*.")) {
          const baseDomain = domain.slice(2);
          return hostname.endsWith(baseDomain);
        }
        return hostname === domain;
      });

      if (!isAllowed) {
        throw new CodeExecutorError(`域名 ${hostname} 不在允许的白名单中`);
      }
    } catch (error: any) {
      if (error instanceof CodeExecutorError) {
        throw error;
      }
      throw new CodeExecutorError(`无效的 URL: ${url}`);
    }
  }

  /**
   * 执行代码
   * @param params 执行参数
   * @returns 执行结果
   */
  async execute(
    params: SchemaCodeExecuteRequestType,
  ): Promise<SchemaCodeExecuteResponseType> {
    const { code, timeout = this.DEFAULT_TIMEOUT, context = {} } = params;

    // 验证超时时间
    if (timeout > this.MAX_TIMEOUT) {
      throw new CodeExecutorError(`超时时间不能超过 ${this.MAX_TIMEOUT}ms`);
    }

    // 获取环境变量用于注入
    const env = this.options.probeEnvService
      ? await this.options.probeEnvService.getAllForInjection()
      : {};

    // 记录 console.log 输出
    const logs: string[] = [];
    const startTime = Date.now();

    try {
      // 创建一个安全的 VM 实例
      const vm = new VM({
        timeout,
        sandbox: {
          ...context,
          env, // 注入环境变量
          // 如果启用 HTTP，注入 http 对象
          ...(this.options.enableHttp && { http: this.createHttpFunction() }),
          console: {
            log: (...args: any[]) => {
              logs.push(args.map((arg) => String(arg)).join(" "));
            },
            error: (...args: any[]) => {
              logs.push("[ERROR] " + args.map((arg) => String(arg)).join(" "));
            },
            warn: (...args: any[]) => {
              logs.push("[WARN] " + args.map((arg) => String(arg)).join(" "));
            },
            info: (...args: any[]) => {
              logs.push("[INFO] " + args.map((arg) => String(arg)).join(" "));
            },
          },
        },
        eval: false, // 禁用 eval
        wasm: false, // 禁用 WebAssembly
      });

      // 执行代码
      const result = vm.run(code);

      // 如果结果是 Promise，等待它完成
      const finalResult = result instanceof Promise ? await result : result;

      const executionTime = Date.now() - startTime;

      // 处理环境变量更新
      if (
        this.options.probeEnvService &&
        finalResult &&
        typeof finalResult === "object" &&
        finalResult.env
      ) {
        try {
          const updateResult =
            await this.options.probeEnvService.updateFromProbe(finalResult.env);
          if (updateResult.updated.length > 0) {
            logs.push(`[ENV] Updated: ${updateResult.updated.join(", ")}`);
          }
          if (updateResult.skipped.length > 0) {
            logs.push(
              `[ENV] Skipped (not exist): ${updateResult.skipped.join(", ")}`,
            );
          }
          if (updateResult.errors.length > 0) {
            logs.push(`[ENV] Errors: ${updateResult.errors.join("; ")}`);
          }
        } catch (envError: any) {
          logs.push(`[ENV] Update failed: ${envError.message}`);
        }
      }

      return {
        success: true,
        result: finalResult,
        executionTime,
        logs,
      };
    } catch (error: any) {
      const executionTime = Date.now() - startTime;

      // 检查是否是超时错误
      if (
        error.message &&
        error.message.includes("Script execution timed out")
      ) {
        throw new CodeExecutionTimeoutError(timeout);
      }

      // 其他执行错误
      return {
        success: false,
        error: error.message || String(error),
        executionTime,
        logs,
      };
    }
  }

  /**
   * 验证代码语法（不执行）
   * @param code 要验证的代码
   * @returns 是否有效
   */
  async validate(code: string): Promise<{ valid: boolean; error?: string }> {
    try {
      // 尝试创建 VM 并编译代码（不执行）
      const vm = new VM({
        timeout: 100,
        sandbox: {},
      });

      // 使用 Function 构造器来检查语法
      new Function(code);

      return { valid: true };
    } catch (error: any) {
      return {
        valid: false,
        error: error.message || String(error),
      };
    }
  }
}
