import { PrismaClient } from "@db/client";
import { SchemaServiceCreateType, SchemaServiceUpdateType } from "./schema";

interface ServiceOptions {
  prisma: PrismaClient;
}

export class MonitoredHostService {
  constructor(private options: ServiceOptions) {}

  async createService(data: SchemaServiceCreateType) {
    return await this.options.prisma.monitoredHost.create({
      data: {
        name: data.name,
        url: data.url,
        desc: data.desc || null,
        headers: data.headers || null,
        enabled: data.enabled ?? true,
        notifyEnabled: data.notifyEnabled ?? false,
        notifyFailureCount: data.notifyFailureCount ?? 3,
        notifyCooldownMin: data.notifyCooldownMin ?? 30,
        notifyChannelIds: data.notifyChannelIds ?? [],
      },
    });
  }

  async getServiceById(id: string) {
    return await this.options.prisma.monitoredHost.findUnique({
      where: { id },
      include: {
        endpoints: true,
      },
    });
  }

  async getAllServices() {
    return await this.options.prisma.monitoredHost.findMany({
      include: {
        endpoints: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async updateService(data: SchemaServiceUpdateType) {
    const { id, ...updateData } = data;
    return await this.options.prisma.monitoredHost.update({
      where: { id },
      data: {
        name: updateData.name,
        url: updateData.url,
        desc: updateData.desc,
        headers:
          updateData.headers !== undefined ? updateData.headers : undefined,
        enabled: updateData.enabled,
        notifyEnabled: updateData.notifyEnabled,
        notifyFailureCount: updateData.notifyFailureCount,
        notifyCooldownMin: updateData.notifyCooldownMin,
        notifyChannelIds: updateData.notifyChannelIds,
      },
    });
  }

  async deleteService(id: string) {
    return await this.options.prisma.monitoredHost.delete({
      where: { id },
    });
  }

  /**
   * 复制一个 Service 及其所有 Endpoint
   * 复制所有配置，但名称添加 "(副本)" 后缀，服务和端点都默认禁用
   */
  async copyService(id: string) {
    // 获取原始服务及其端点
    const original = await this.options.prisma.monitoredHost.findUnique({
      where: { id },
      include: { endpoints: true },
    });

    if (!original) {
      throw new Error("Service not found");
    }

    // 解构排除不需要复制的字段（id, createdAt, updatedAt 由数据库自动生成）
    const {
      id: _id,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      endpoints,
      name,
      headers,
      notifyChannelIds,
      ...serviceRest
    } = original;

    // 使用事务确保原子性
    return await this.options.prisma.$transaction(async (tx) => {
      // 创建新服务
      const newService = await tx.monitoredHost.create({
        data: {
          ...serviceRest,
          name: `${name} (副本)`,
          headers: headers ?? undefined, // 处理 null 值
          notifyChannelIds: (notifyChannelIds as string[]) ?? [],
          enabled: false, // 默认禁用
        },
      });

      // 复制所有端点
      if (endpoints.length > 0) {
        await tx.endPoint.createMany({
          data: endpoints.map((ep) => {
            const {
              id: _epId,
              createdAt: _epCreatedAt,
              updatedAt: _epUpdatedAt,
              hostId: _hostId,
              headers: epHeaders,
              ...epRest
            } = ep;
            return {
              ...epRest,
              hostId: newService.id,
              headers: epHeaders ?? undefined, // 处理 null 值
              enabled: false, // 所有端点默认禁用
            };
          }),
        });
      }

      // 返回新服务及其端点
      return await tx.monitoredHost.findUnique({
        where: { id: newService.id },
        include: { endpoints: true },
      });
    });
  }
}
