import { PrismaClient } from "@db/client";
import { SchemaEndPointCreateType, SchemaEndPointUpdateType } from "./schema";
import { IntervalProbeService } from "@/modules/probe-task/interval-service";

interface ServiceOptions {
  prisma: PrismaClient;
  intervalProbeService: IntervalProbeService;
}

export class EndPointService {
  constructor(private options: ServiceOptions) {}

  async createEndPoint(data: SchemaEndPointCreateType) {
    const endPoint = await this.options.prisma.endPoint.create({
      data: {
        hostId: data.hostId,
        name: data.name,
        url: data.url,
        desc: data.desc || null,
        method: data.method || "GET",
        headers: data.headers || null,
        intervalTime: data.intervalTime || null,
        enabled: data.enabled ?? true,
        timeout: data.timeout || null,
      },
    });

    // 如果端点启用，添加到定时任务调度器（不等待探测完成）
    if (endPoint.enabled) {
      this.options.intervalProbeService.addEndpointToScheduler(endPoint.id);
    }

    return endPoint;
  }

  async getEndPointById(id: string) {
    return await this.options.prisma.endPoint.findUnique({
      where: { id },
    });
  }

  async getAllEndPoints(hostId?: string) {
    return await this.options.prisma.endPoint.findMany({
      where: hostId ? { hostId } : undefined,
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async updateEndPoint(data: SchemaEndPointUpdateType) {
    const { id, ...updateData } = data;

    // 获取更新前的状态
    const oldEndPoint = await this.options.prisma.endPoint.findUnique({
      where: { id },
    });

    const endPoint = await this.options.prisma.endPoint.update({
      where: { id },
      data: {
        ...updateData,
        headers:
          updateData.headers !== undefined ? updateData.headers : undefined,
      },
    });

    // 处理定时任务调度器的更新
    const wasEnabled = oldEndPoint?.enabled ?? false;
    const isEnabled = endPoint.enabled;

    if (wasEnabled && !isEnabled) {
      // 从启用变为禁用：移除任务
      this.options.intervalProbeService.removeEndpointFromScheduler(id);
    } else if (!wasEnabled && isEnabled) {
      // 从禁用变为启用：添加任务（不等待探测完成）
      this.options.intervalProbeService.addEndpointToScheduler(id);
    } else if (isEnabled) {
      // 保持启用状态但配置可能变化：更新任务（不等待探测完成）
      this.options.intervalProbeService.updateEndpointInScheduler(id);
    }

    return endPoint;
  }

  async deleteEndPoint(id: string) {
    // 先从调度器移除任务
    this.options.intervalProbeService.removeEndpointFromScheduler(id);

    // 再删除数据库记录
    return await this.options.prisma.endPoint.delete({
      where: { id },
    });
  }

  /**
   * 复制一个 EndPoint
   * 复制所有配置，但名称添加 "(副本)" 后缀，默认禁用
   */
  async copyEndPoint(id: string) {
    // 获取原始端点
    const original = await this.options.prisma.endPoint.findUnique({
      where: { id },
    });

    if (!original) {
      throw new Error("Endpoint not found");
    }

    // 解构排除不需要复制的字段（id, createdAt, updatedAt 由数据库自动生成）
    const {
      id: _id,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      name,
      headers,
      ...rest
    } = original;

    // 创建新端点
    const newEndPoint = await this.options.prisma.endPoint.create({
      data: {
        ...rest,
        name: `${name} (副本)`,
        headers: headers ?? undefined, // 处理 null 值
        enabled: false, // 默认禁用，避免立即开始探测
      },
    });

    return newEndPoint;
  }
}
