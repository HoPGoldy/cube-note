import NodeCache from "@cacheable/node-cache";
import { PrismaClient } from "@db/client";
import { SchemaProbeEnvCreateType, SchemaProbeEnvUpdateType } from "./schema";

interface ServiceOptions {
  prisma: PrismaClient;
}

const SECRET_MASK = "******";

export class ProbeEnvService {
  private cache = new NodeCache<string>({ stdTTL: 300, checkperiod: 60 });

  constructor(private options: ServiceOptions) {}

  /**
   * 获取所有环境变量（用于前端展示）
   * isSecret=true 的变量，value 返回 "******"
   */
  async getAll() {
    const envs = await this.options.prisma.probeEnv.findMany({
      orderBy: { key: "asc" },
    });

    return envs.map((env) => ({
      ...env,
      value: env.isSecret ? SECRET_MASK : env.value,
      createdAt: env.createdAt.toISOString(),
      updatedAt: env.updatedAt.toISOString(),
    }));
  }

  /**
   * 获取所有环境变量的实际值（用于注入到探针）
   * 返回 Record<string, string> 格式
   */
  async getAllForInjection(): Promise<Record<string, string>> {
    const cacheKey = "probeEnvVars";
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const envs = await this.options.prisma.probeEnv.findMany();
    const result = Object.fromEntries(envs.map((e) => [e.key, e.value]));

    this.cache.set(cacheKey, JSON.stringify(result));
    return result;
  }

  /**
   * 清除缓存
   */
  private clearCache() {
    this.cache.del("probeEnvVars");
  }

  /**
   * 创建环境变量
   */
  async create(data: SchemaProbeEnvCreateType) {
    const result = await this.options.prisma.probeEnv.create({
      data: {
        key: data.key,
        value: data.value,
        isSecret: data.isSecret ?? false,
        desc: data.desc ?? null,
      },
    });

    this.clearCache();
    return result;
  }

  /**
   * 更新环境变量
   * 如果 value 为 undefined 且 isSecret=true，保持原值不变
   */
  async update(data: SchemaProbeEnvUpdateType) {
    const { id, ...updateData } = data;

    // 如果没有提供 value，需要保持原值
    const updatePayload: Record<string, any> = {};

    if (updateData.key !== undefined) {
      updatePayload.key = updateData.key;
    }
    if (updateData.value !== undefined) {
      updatePayload.value = updateData.value;
    }
    if (updateData.isSecret !== undefined) {
      updatePayload.isSecret = updateData.isSecret;
    }
    if (updateData.desc !== undefined) {
      updatePayload.desc = updateData.desc;
    }

    const result = await this.options.prisma.probeEnv.update({
      where: { id },
      data: updatePayload,
    });

    this.clearCache();
    return result;
  }

  /**
   * 删除环境变量
   */
  async delete(id: string) {
    await this.options.prisma.probeEnv.delete({
      where: { id },
    });

    this.clearCache();
  }

  /**
   * 从探针执行结果中更新环境变量
   * 只更新已存在的 key，忽略不存在的 key
   * @param updates - 要更新的 key-value 对象
   * @returns 更新结果统计
   */
  async updateFromProbe(
    updates: Record<string, string>,
  ): Promise<{ updated: string[]; skipped: string[]; errors: string[] }> {
    const MAX_VALUE_LENGTH = 10000;
    const result = {
      updated: [] as string[],
      skipped: [] as string[],
      errors: [] as string[],
    };

    if (!updates || typeof updates !== "object") {
      return result;
    }

    for (const [key, value] of Object.entries(updates)) {
      // 跳过非字符串值
      if (typeof value !== "string") {
        result.errors.push(`${key}: value must be string`);
        continue;
      }

      // 检查长度限制
      if (value.length > MAX_VALUE_LENGTH) {
        result.errors.push(
          `${key}: value exceeds max length (${MAX_VALUE_LENGTH})`,
        );
        continue;
      }

      try {
        // 只更新已存在的 key
        const existing = await this.options.prisma.probeEnv.findUnique({
          where: { key },
        });

        if (!existing) {
          result.skipped.push(key);
          continue;
        }

        await this.options.prisma.probeEnv.update({
          where: { key },
          data: { value },
        });

        result.updated.push(key);
      } catch (error: any) {
        result.errors.push(`${key}: ${error.message}`);
      }
    }

    // 有更新时清除缓存
    if (result.updated.length > 0) {
      this.clearCache();
    }

    return result;
  }
}
