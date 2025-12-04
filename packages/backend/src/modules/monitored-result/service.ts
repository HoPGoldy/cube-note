import { PrismaClient } from "@db/client";
import { SchemaProbeResultCreateType } from "./schema";

interface ServiceOptions {
  prisma: PrismaClient;
}

export class ResultService {
  constructor(private options: ServiceOptions) {}

  async createProbeResult(data: SchemaProbeResultCreateType) {
    return await this.options.prisma.probeResult.create({
      data: {
        endPointId: data.endPointId,
        status: data.status || null,
        responseTime: data.responseTime || null,
        success: data.success,
        message: data.message || null,
      },
    });
  }

  async getProbeResultById(id: number) {
    return await this.options.prisma.probeResult.findUnique({
      where: { id },
    });
  }

  async getProbeResults(params: {
    endPointId?: string;
    hostId?: string;
    limit?: number;
  }) {
    const { endPointId, hostId, limit } = params;

    // 构建查询条件
    const where: any = {};

    if (endPointId) {
      where.endPointId = endPointId;
    } else if (hostId) {
      where.endPoint = {
        hostId,
      };
    }

    return await this.options.prisma.probeResult.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      take: limit || 100, // 默认 100 条记录
    });
  }

  async deleteProbeResult(id: number) {
    return await this.options.prisma.probeResult.delete({
      where: { id },
    });
  }

  // Get latest probe results for dashboard
  async getLatestProbeResults() {
    // Get the most recent probe result for each endpoint
    const latestResults = await this.options.prisma.$queryRaw<
      Array<{
        id: number;
        createdAt: Date;
        endPointId: string;
        status: number | null;
        responseTime: number | null;
        success: boolean;
        message: string | null;
      }>
    >`
      SELECT pr.*
      FROM ProbeResult pr
      INNER JOIN (
        SELECT endPointId, MAX(createdAt) as maxCreatedAt
        FROM ProbeResult
        GROUP BY endPointId
      ) groupedpr ON pr.endPointId = groupedpr.endPointId AND pr.createdAt = groupedpr.maxCreatedAt
      ORDER BY pr.createdAt DESC
    `;

    return latestResults;
  }
}
