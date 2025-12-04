import axios, { AxiosRequestConfig } from "axios";
import { PrismaClient } from "@db/client";
import { ResultService } from "@/modules/monitored-result/service";
import { CodeExecutorService } from "@/modules/code-executor/service";
import { NotificationService } from "@/modules/notification/service";

interface ServiceOptions {
  prisma: PrismaClient;
  resultService: ResultService;
  codeExecutorService: CodeExecutorService;
  notificationService?: NotificationService;
}

interface IntervalTask {
  intervalId: NodeJS.Timeout;
  intervalSeconds: number;
  lastExecutionTime: number;
}

/**
 * 构建探测请求的完整 URL
 * @param endpointUrl endpoint 的 URL（可能是完整 URL 或路径）
 * @param serviceUrl service 的 URL（基础域名）
 * @returns 完整的请求 URL
 */
function buildProbeUrl(
  endpointUrl: string | null,
  serviceUrl: string | null,
): string | null {
  // endpoint.url 存在
  if (endpointUrl) {
    // 如果是完整 URL（以 http:// 或 https:// 开头），直接使用
    if (
      endpointUrl.startsWith("http://") ||
      endpointUrl.startsWith("https://")
    ) {
      return endpointUrl;
    }

    // 否则是路径，需要拼接 service.url
    if (!serviceUrl) {
      return null;
    }

    // 确保 baseUrl 不以 / 结尾，path 以 / 开头
    const baseUrl = serviceUrl.endsWith("/")
      ? serviceUrl.slice(0, -1)
      : serviceUrl;
    const path = endpointUrl.startsWith("/") ? endpointUrl : `/${endpointUrl}`;
    return `${baseUrl}${path}`;
  }

  // endpoint.url 为空，直接使用 service.url
  return serviceUrl;
}

/**
 * 基于间隔时间的定时任务服务
 * 使用秒为单位的间隔执行定时探测任务
 */
export class IntervalProbeService {
  private activeTasks: Map<string, IntervalTask> = new Map();

  constructor(private options: ServiceOptions) {}

  /**
   * 保存探测结果并触发通知处理
   */
  private async saveProbeResultAndNotify(data: {
    endPointId: string;
    status?: number;
    responseTime?: number;
    success: boolean;
    message?: string;
  }) {
    // 保存结果
    await this.options.resultService.createProbeResult({
      endPointId: data.endPointId,
      status: data.status,
      responseTime: data.responseTime,
      success: data.success,
      message: data.message,
    });

    // 异步处理通知，不阻塞探测
    if (this.options.notificationService) {
      this.options.notificationService
        .processProbeResult({
          endPointId: data.endPointId,
          success: data.success,
          status: data.status,
          responseTime: data.responseTime,
          message: data.message,
        })
        .catch((err) => {
          console.error(
            `[Notification] Failed to process probe result: ${err.message}`,
          );
        });
    }
  }

  /**
   * 执行探测请求
   */
  private executeProbe = async (endPointId: string) => {
    try {
      // 获取 endpoint 详情
      const endPoint = await this.options.prisma.endPoint.findUnique({
        where: { id: endPointId },
      });

      if (!endPoint || !endPoint.enabled) {
        console.log(
          `Endpoint ${endPointId} not found or disabled, skipping probe`,
        );
        return;
      }

      // 获取 service 详情用于回退值
      const service = await this.options.prisma.monitoredHost.findUnique({
        where: { id: endPoint.hostId },
      });

      if (!service || !service.enabled) {
        console.log(
          `Service for endpoint ${endPointId} not found or disabled, skipping probe`,
        );
        return;
      }

      // 根据类型执行不同的探测逻辑
      if (endPoint.type === "CODE") {
        await this.executeCodeProbe(endPointId, endPoint, service);
      } else {
        await this.executeConfigProbe(endPointId, endPoint, service);
      }
    } catch (error: any) {
      console.log(
        `[Interval] Unexpected error for endpoint ${endPointId}: ${error.message}`,
      );
    }
  };

  /**
   * 执行 CODE 模式探测
   */
  private executeCodeProbe = async (
    endPointId: string,
    endPoint: {
      codeContent: string | null;
    },
    host: {
      id: string;
      name: string;
      url: string | null;
      headers: any;
    },
  ) => {
    const startTime = Date.now();

    if (!endPoint.codeContent) {
      await this.saveProbeResultAndNotify({
        endPointId,
        status: undefined,
        responseTime: 0,
        success: false,
        message: "Code content is empty",
      });
      return;
    }

    try {
      const result = await this.options.codeExecutorService.execute({
        code: endPoint.codeContent,
        timeout: 30000, // 代码执行最大 30 秒
        context: {
          // 注入 host 配置，供代码中使用
          host: {
            id: host.id,
            name: host.name,
            url: host.url,
            headers: host.headers,
          },
        },
      });

      const responseTime = Date.now() - startTime;

      if (result.success) {
        // 解析代码返回值
        // 格式: { result: { success, message, ... }, env: { KEY: value } }
        const rawResult = result.result as any;

        let probeResult:
          | {
              success?: boolean;
              message?: string;
              responseTime?: number;
              status?: number;
            }
          | undefined;

        if (rawResult && typeof rawResult === "object") {
          probeResult = rawResult.result;
        }

        const success = probeResult?.success ?? true;
        const message = probeResult?.message ?? "Code executed successfully";
        const finalResponseTime = probeResult?.responseTime ?? responseTime;
        const status = probeResult?.status;

        await this.saveProbeResultAndNotify({
          endPointId,
          status,
          responseTime: finalResponseTime,
          success,
          message,
        });

        console.log(
          `[Interval] Code probe completed for endpoint ${endPointId}: Success=${success}, Response time: ${finalResponseTime}ms`,
        );
      } else {
        await this.saveProbeResultAndNotify({
          endPointId,
          status: undefined,
          responseTime,
          success: false,
          message: result.error || "Code execution failed",
        });

        console.log(
          `[Interval] Code probe failed for endpoint ${endPointId}: ${result.error}`,
        );
      }
    } catch (error: any) {
      const responseTime = Date.now() - startTime;

      await this.saveProbeResultAndNotify({
        endPointId,
        status: undefined,
        responseTime,
        success: false,
        message: error.message || "Code execution error",
      });

      console.log(
        `[Interval] Code probe error for endpoint ${endPointId}: ${error.message}`,
      );
    }
  };

  /**
   * 执行 CONFIG 模式探测（HTTP 请求）
   */
  private executeConfigProbe = async (
    endPointId: string,
    endPoint: {
      url: string | null;
      method: string | null;
      headers: any;
      timeout: number | null;
      bodyContentType: string | null;
      bodyContent: string | null;
    },
    service: {
      url: string | null;
      headers: any;
    },
  ) => {
    let startTime = 0;

    try {
      // 构建完整 URL
      const url = buildProbeUrl(endPoint.url, service.url);
      if (!url) {
        const message = endPoint.url
          ? `Invalid URL configuration: endpoint.url is a relative path but service.url is missing`
          : `Invalid URL configuration: both endpoint.url and service.url are missing`;

        console.log(`[Interval] ${message} for endpoint ${endPointId}`);

        // 记录失败结果到数据库
        await this.saveProbeResultAndNotify({
          endPointId,
          status: undefined,
          responseTime: 0,
          success: false,
          message,
        });
        return;
      }

      const headers = {
        ...(typeof service.headers === "object" && service.headers !== null
          ? (service.headers as Record<string, string>)
          : {}),
        ...(typeof endPoint.headers === "object" && endPoint.headers !== null
          ? (endPoint.headers as Record<string, string>)
          : {}),
      };
      const timeout = (endPoint.timeout || 10) * 1000; // 默认 10 秒，转换为毫秒
      const method = endPoint.method || "GET"; // HTTP 请求方法，默认 GET

      // 准备请求配置
      const config: AxiosRequestConfig = {
        method,
        url,
        headers,
        timeout,
      };

      // 处理请求体
      if (endPoint.bodyContent && typeof endPoint.bodyContent === "string") {
        const contentType = endPoint.bodyContentType || "json";

        switch (contentType) {
          case "json": {
            config.headers = {
              ...config.headers,
              "Content-Type": "application/json",
            };
            // 解析 JSON 字符串
            try {
              config.data = JSON.parse(endPoint.bodyContent);
            } catch (error) {
              console.log(
                `[Interval] Failed to parse JSON body for endpoint ${endPointId}`,
              );
              config.data = endPoint.bodyContent;
            }
            break;
          }
          case "x-www-form-urlencoded": {
            config.headers = {
              ...config.headers,
              "Content-Type": "application/x-www-form-urlencoded",
            };
            // 解析 JSON 字符串，然后转换为 URLSearchParams
            try {
              const bodyObj = JSON.parse(endPoint.bodyContent);
              const params = new URLSearchParams();
              Object.entries(bodyObj).forEach(([key, value]) => {
                params.append(key, String(value));
              });
              config.data = params.toString();
            } catch (error) {
              console.log(
                `[Interval] Failed to parse form body for endpoint ${endPointId}`,
              );
              config.data = endPoint.bodyContent;
            }
            break;
          }
          case "xml":
            config.headers = {
              ...config.headers,
              "Content-Type": "application/xml",
            };
            // 直接使用字符串作为 XML
            config.data = endPoint.bodyContent;
            break;
        }
      }

      startTime = Date.now();
      const response = await axios(config);
      const responseTime = Date.now() - startTime;

      // 在数据库中创建探测结果
      await this.saveProbeResultAndNotify({
        endPointId,
        status: response.status,
        responseTime,
        success: true,
        message: "Success",
      });

      console.log(
        `[Interval] Probe completed for endpoint ${endPointId}: Method ${method} Status ${response.status}, Response time: ${responseTime}ms`,
      );
    } catch (error: any) {
      // 确定错误详情
      let status = null;
      let message = "Unknown error";

      if (error.response) {
        // 服务器响应了错误状态
        status = error.response.status;
        message = error.response.statusText || "Server error";
      } else if (error.request) {
        // 请求已发出但没有收到响应
        message = "No response received";
      } else {
        // 发生了其他错误
        message = error.message || "Request failed";
      }

      const responseTime = startTime === 0 ? 0 : Date.now() - startTime;
      // 在数据库中创建失败的探测结果
      await this.saveProbeResultAndNotify({
        endPointId,
        status: status ?? undefined,
        responseTime,
        success: false,
        message,
      });

      console.log(
        `[Interval] Probe failed for endpoint ${endPointId}: ${message}`,
      );
    }
  };

  /**
   * 启动所有已调度的探测
   */
  async startProbeScheduler() {
    console.log("[Interval] Starting interval-based probe scheduler...");

    // 获取所有启用的 endpoints
    const endpoints = await this.options.prisma.endPoint.findMany({
      where: { enabled: true },
      include: {
        monitoredHost: true,
      },
    });

    // 为每个 endpoint 调度任务
    for (const endpoint of endpoints) {
      const intervalTime = endpoint.intervalTime;

      if (intervalTime && intervalTime > 0) {
        await this.addEndpointToScheduler(endpoint.id, intervalTime);
      }
    }

    console.log(
      `[Interval] Probe scheduler started with ${this.activeTasks.size} tasks`,
    );
  }

  /**
   * 停止调度器并清除所有任务
   */
  stopProbeScheduler() {
    console.log("[Interval] Stopping probe scheduler...");
    this.activeTasks.forEach((task, id) => {
      console.log(`[Interval] Stopping task for endpoint ${id}`);
      clearInterval(task.intervalId);
    });
    this.activeTasks.clear();
    console.log("[Interval] Probe scheduler stopped");
  }

  /**
   * 添加新 endpoint 到调度器
   * @param endPointId endpoint ID
   * @param intervalSeconds 间隔秒数（如果不提供，会从数据库读取）
   */
  async addEndpointToScheduler(endPointId: string, intervalSeconds?: number) {
    // 获取 endpoint 详情
    const endpoint = await this.options.prisma.endPoint.findUnique({
      where: { id: endPointId },
      include: {
        monitoredHost: true,
      },
    });

    if (!endpoint || !endpoint.enabled) {
      return;
    }

    // 如果未提供间隔时间，从 endpoint 获取
    const effectiveInterval = intervalSeconds ?? endpoint.intervalTime;

    // 验证间隔时间
    if (!effectiveInterval || effectiveInterval <= 0) {
      console.log(
        `[Interval] No valid interval time for endpoint ${endPointId}`,
      );
      return;
    }

    // 取消该 endpoint 的现有任务
    if (this.activeTasks.has(endPointId)) {
      clearInterval(this.activeTasks.get(endPointId)!.intervalId);
      this.activeTasks.delete(endPointId);
    }

    // 创建并存储新任务
    const intervalId = setInterval(() => {
      this.executeProbe(endPointId);
      // 更新最后执行时间
      const task = this.activeTasks.get(endPointId);
      if (task) {
        task.lastExecutionTime = Date.now();
      }
    }, effectiveInterval * 1000); // 转换为毫秒

    this.activeTasks.set(endPointId, {
      intervalId,
      intervalSeconds: effectiveInterval,
      lastExecutionTime: Date.now(),
    });

    console.log(
      `[Interval] Scheduled probe for endpoint ${endPointId} with interval: ${effectiveInterval}s`,
    );

    // 立即执行一次
    await this.executeProbe(endPointId);
  }

  /**
   * 从调度器中移除 endpoint
   */
  removeEndpointFromScheduler(endPointId: string) {
    if (this.activeTasks.has(endPointId)) {
      clearInterval(this.activeTasks.get(endPointId)!.intervalId);
      this.activeTasks.delete(endPointId);
      console.log(`[Interval] Removed probe for endpoint ${endPointId}`);
    }
  }

  /**
   * 更新调度器中的 endpoint
   */
  async updateEndpointInScheduler(endPointId: string) {
    // 先移除旧任务
    this.removeEndpointFromScheduler(endPointId);

    // 然后添加更新后的任务（会自动从数据库读取最新的 intervalTime）
    await this.addEndpointToScheduler(endPointId);
  }

  /**
   * 获取所有活动任务的状态
   */
  getActiveTasksStatus() {
    const tasks: Array<{
      endPointId: string;
      intervalSeconds: number;
      lastExecutionTime: Date;
      nextExecutionTime: Date;
    }> = [];

    this.activeTasks.forEach((task, endPointId) => {
      const now = Date.now();
      const timeSinceLastExecution = now - task.lastExecutionTime;
      const timeUntilNextExecution =
        task.intervalSeconds * 1000 - timeSinceLastExecution;

      tasks.push({
        endPointId,
        intervalSeconds: task.intervalSeconds,
        lastExecutionTime: new Date(task.lastExecutionTime),
        nextExecutionTime: new Date(now + timeUntilNextExecution),
      });
    });

    return tasks;
  }

  /**
   * 暂停特定 endpoint 的探测
   */
  pauseEndpoint(endPointId: string) {
    const task = this.activeTasks.get(endPointId);
    if (task) {
      clearInterval(task.intervalId);
      console.log(`[Interval] Paused probe for endpoint ${endPointId}`);
    }
  }

  /**
   * 恢复特定 endpoint 的探测
   */
  async resumeEndpoint(endPointId: string) {
    const task = this.activeTasks.get(endPointId);
    if (task) {
      await this.addEndpointToScheduler(endPointId, task.intervalSeconds);
      console.log(`[Interval] Resumed probe for endpoint ${endPointId}`);
    }
  }

  /**
   * 手动触发单次探测
   */
  async triggerManualProbe(endPointId: string) {
    console.log(`[Interval] Manual probe triggered for endpoint ${endPointId}`);
    await this.executeProbe(endPointId);
  }
}
