import axios from "axios";
import { PrismaClient, NotificationChannel, MonitoredHost } from "@db/client";
import { renderTemplate, TemplateContext } from "./template";

interface ServiceOptions {
  prisma: PrismaClient;
}

interface HostStatus {
  failedEndpoints: Map<string, number>; // endpointId -> 连续失败次数
  currentStatus: "UP" | "DOWN";
  lastNotifiedAt: Date | null;
}

interface ProbeResultData {
  endPointId: string;
  success: boolean;
  status?: number | null;
  responseTime?: number | null;
  message?: string | null;
}

export interface FailedEndpointDetail {
  endpointId: string;
  endpointName: string;
  consecutiveFailures: number;
}

export interface HostStatusDetail {
  hostId: string;
  hostName: string;
  hostEnabled: boolean;
  currentStatus: "UP" | "DOWN";
  lastNotifiedAt: Date | null;
  failedEndpoints: Array<FailedEndpointDetail>;
}

export class NotificationService {
  /** 内存状态：存储每个 Host 的状态 */
  private hostStatus: Map<string, HostStatus> = new Map();

  constructor(private options: ServiceOptions) {}

  // ==================== Channel CRUD ====================

  async createChannel(data: {
    name: string;
    webhookUrl: string;
    headers?: any;
    bodyTemplate: string;
    enabled?: boolean;
  }) {
    return await this.options.prisma.notificationChannel.create({
      data: {
        name: data.name,
        webhookUrl: data.webhookUrl,
        headers: data.headers || null,
        bodyTemplate: data.bodyTemplate,
        enabled: data.enabled ?? true,
      },
    });
  }

  async updateChannel(data: {
    id: string;
    name?: string;
    webhookUrl?: string;
    headers?: any;
    bodyTemplate?: string;
    enabled?: boolean;
  }) {
    const { id, ...updateData } = data;
    return await this.options.prisma.notificationChannel.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteChannel(id: string) {
    return await this.options.prisma.notificationChannel.delete({
      where: { id },
    });
  }

  async getChannelById(id: string) {
    return await this.options.prisma.notificationChannel.findUnique({
      where: { id },
    });
  }

  async listChannels() {
    return await this.options.prisma.notificationChannel.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  // ==================== Log CRUD ====================

  async listLogs(params: {
    hostId?: string;
    endpointId?: string;
    channelId?: string;
    limit?: number;
  }) {
    const { hostId, endpointId, channelId, limit = 100 } = params;

    const where: any = {};
    if (hostId) where.hostId = hostId;
    if (endpointId) where.endpointId = endpointId;
    if (channelId) where.channelId = channelId;

    return await this.options.prisma.notificationLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  // ==================== 核心通知逻辑 ====================

  /**
   * 处理探测结果，检查是否需要触发通知
   */
  async processProbeResult(result: ProbeResultData): Promise<void> {
    const { endPointId, success } = result;

    // 获取端点和服务信息
    const endpoint = await this.options.prisma.endPoint.findUnique({
      where: { id: endPointId },
      include: { monitoredHost: true },
    });

    if (!endpoint) {
      console.log(`[Notification] Endpoint ${endPointId} not found, skipping`);
      return;
    }

    const service = endpoint.monitoredHost;

    // 检查服务是否启用通知
    if (!service.notifyEnabled) {
      return;
    }

    // 获取通知渠道 ID 列表
    const channelIds = service.notifyChannelIds as string[];
    if (!channelIds || channelIds.length === 0) {
      return;
    }

    // 获取或初始化 Host 状态
    let hostState = this.hostStatus.get(service.id);
    if (!hostState) {
      hostState = {
        failedEndpoints: new Map(),
        currentStatus: "UP",
        lastNotifiedAt: null,
      };
      this.hostStatus.set(service.id, hostState);
    }

    const previousHostStatus = hostState.currentStatus;

    // 更新端点连续失败次数
    if (success) {
      hostState.failedEndpoints.delete(endPointId);
    } else {
      const currentFailures = hostState.failedEndpoints.get(endPointId) || 0;
      hostState.failedEndpoints.set(endPointId, currentFailures + 1);
    }

    // 检查是否有任意端点达到失败阈值
    const hasFailedEndpoint = this.hasEndpointReachedThreshold(
      hostState,
      service.notifyFailureCount,
    );

    // 判断 Host 当前状态
    if (hasFailedEndpoint) {
      hostState.currentStatus = "DOWN";
    } else if (hostState.failedEndpoints.size === 0) {
      // 所有失败端点都恢复了
      hostState.currentStatus = "UP";
    }

    // 构建模板上下文
    const context: TemplateContext = {
      eventType: success ? "RECOVERY" : "FAILURE",
      endpoint: {
        id: endpoint.id,
        name: endpoint.name,
        url: endpoint.url,
      },
      service: {
        id: service.id,
        name: service.name,
        url: service.url,
      },
      details: {
        status: result.status ?? null,
        responseTime: result.responseTime ?? null,
        message: result.message ?? null,
        consecutiveFailures: hostState.failedEndpoints.get(endPointId) || 0,
      },
      timestamp: new Date().toISOString(),
    };

    // 获取所有启用的渠道
    const channels = await this.options.prisma.notificationChannel.findMany({
      where: {
        id: { in: channelIds },
        enabled: true,
      },
    });

    if (channels.length === 0) {
      return;
    }

    // 场景1：一直正常，无需通知
    if (hostState.currentStatus === "UP" && previousHostStatus === "UP") {
      return;
    }

    // 场景2：Host 从 UP 变为 DOWN（故障通知）
    if (hostState.currentStatus === "DOWN" && previousHostStatus === "UP") {
      // 检查冷却时间
      if (
        this.isInCooldown(hostState.lastNotifiedAt, service.notifyCooldownMin)
      ) {
        console.log(
          `[Notification] Host ${service.name} is in cooldown, skipping`,
        );
        return;
      }

      context.eventType = "FAILURE";
      await this.sendNotificationToChannels(channels, context, service.id);
      hostState.lastNotifiedAt = new Date();
      return;
    }

    // 场景3：Host 从 DOWN 变为 UP（恢复通知，强制发送）
    if (hostState.currentStatus === "UP" && previousHostStatus === "DOWN") {
      context.eventType = "RECOVERY";
      await this.sendNotificationToChannels(channels, context, service.id);
      hostState.lastNotifiedAt = new Date();
      return;
    }

    // 场景4：持续故障中，检查是否需要重复通知
    if (hostState.currentStatus === "DOWN" && previousHostStatus === "DOWN") {
      // 可选：可以添加持续故障的周期性提醒
      // 目前设计不做持续通知，只在状态变化时通知
      return;
    }
  }

  /**
   * 检查是否有任意端点达到失败阈值
   */
  private hasEndpointReachedThreshold(
    hostState: HostStatus,
    threshold: number,
  ): boolean {
    const values = Array.from(hostState.failedEndpoints.values());
    for (const failures of values) {
      if (failures >= threshold) {
        return true;
      }
    }
    return false;
  }

  /**
   * 检查是否在冷却时间内
   */
  private isInCooldown(
    lastNotifiedAt: Date | null,
    cooldownMinutes: number,
  ): boolean {
    if (!lastNotifiedAt) return false;

    const cooldownMs = cooldownMinutes * 60 * 1000;
    const elapsed = Date.now() - lastNotifiedAt.getTime();
    return elapsed < cooldownMs;
  }

  /**
   * 发送通知到多个渠道
   */
  private async sendNotificationToChannels(
    channels: NotificationChannel[],
    context: TemplateContext,
    hostId: string,
  ): Promise<void> {
    const title = `${context.eventType} - ${context.service.name}`;

    for (const channel of channels) {
      await this.sendNotificationToChannel(channel, context, hostId, title);
    }
  }

  /**
   * 发送通知到单个渠道
   */
  private async sendNotificationToChannel(
    channel: NotificationChannel,
    context: TemplateContext,
    hostId: string,
    title: string,
  ): Promise<void> {
    // 渲染模板
    const body = renderTemplate(channel.bodyTemplate, context);

    let success = false;
    let errorMsg: string | null = null;

    try {
      // 解析请求头
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...((channel.headers as Record<string, string>) || {}),
      };

      // 发送 Webhook 请求
      await axios.post(channel.webhookUrl, JSON.parse(body), {
        headers,
        timeout: 10000,
      });

      success = true;
      console.log(
        `[Notification] Sent ${context.eventType} notification for ${context.service.name} via ${channel.name}`,
      );
    } catch (error: any) {
      errorMsg = error.message || "Unknown error";
      console.error(
        `[Notification] Failed to send notification via ${channel.name}: ${errorMsg}`,
      );
    }

    // 记录日志
    await this.options.prisma.notificationLog.create({
      data: {
        hostId: hostId,
        endpointId: context.endpoint.id,
        channelId: channel.id,
        eventType: context.eventType,
        title,
        content: body,
        success,
        errorMsg,
      },
    });
  }

  /**
   * 测试渠道配置
   */
  async testChannel(
    channelId: string,
  ): Promise<{ success: boolean; error?: string }> {
    const channel = await this.getChannelById(channelId);
    if (!channel) {
      return { success: false, error: "Channel not found" };
    }

    // 构建测试上下文
    const context: TemplateContext = {
      eventType: "FAILURE",
      endpoint: {
        id: "test-endpoint-id",
        name: "测试端点",
        url: "/api/health",
      },
      service: {
        id: "test-service-id",
        name: "测试服务",
        url: "https://example.com",
      },
      details: {
        status: 500,
        responseTime: 1234,
        message: "这是一条测试通知",
        consecutiveFailures: 3,
      },
      timestamp: new Date().toISOString(),
    };

    const body = renderTemplate(channel.bodyTemplate, context);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...((channel.headers as Record<string, string>) || {}),
      };

      await axios.post(channel.webhookUrl, JSON.parse(body), {
        headers,
        timeout: 10000,
      });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || "Unknown error" };
    }
  }

  /**
   * 清除指定 Host 的内存状态（Host 被删除时调用）
   */
  clearHostStatus(hostId: string): void {
    this.hostStatus.delete(hostId);
  }

  /**
   * 清除指定端点的状态（端点被删除时调用）
   */
  clearEndpointStatus(hostId: string, endpointId: string): void {
    const hostState = this.hostStatus.get(hostId);
    if (hostState) {
      hostState.failedEndpoints.delete(endpointId);
      // 如果没有失败的端点了，状态变为 UP
      if (hostState.failedEndpoints.size === 0) {
        hostState.currentStatus = "UP";
      }
    }
  }

  /**
   * 获取 Host 当前状态（用于调试/监控）
   */
  getHostStatus(hostId: string): HostStatus | undefined {
    return this.hostStatus.get(hostId);
  }

  /**
   * 获取所有 Host 的通知状态
   */
  async getAllHostStatus(): Promise<Array<HostStatusDetail>> {
    const result: Array<HostStatusDetail> = [];

    // 获取所有启用的服务
    const services = await this.options.prisma.monitoredHost.findMany({
      where: { enabled: true },
      include: { endpoints: true },
    });

    for (const service of services) {
      const hostState = this.hostStatus.get(service.id);

      // 构建失败端点列表
      const failedEndpoints: Array<FailedEndpointDetail> = [];

      if (hostState) {
        const entries = Array.from(hostState.failedEndpoints.entries());
        for (const [endpointId, failures] of entries) {
          const endpoint = service.endpoints.find((e) => e.id === endpointId);
          failedEndpoints.push({
            endpointId,
            endpointName: endpoint?.name || "未知端点",
            consecutiveFailures: failures,
          });
        }
      }

      result.push({
        hostId: service.id,
        hostName: service.name,
        hostEnabled: service.enabled,
        currentStatus: hostState?.currentStatus || "UP",
        lastNotifiedAt: hostState?.lastNotifiedAt || null,
        failedEndpoints,
      });
    }

    return result;
  }
}
