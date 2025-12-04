import { PrismaClient } from "@db/client";
import { logger } from "@/lib/logger";
import dayjs from "dayjs";

interface AggregationServiceOptions {
  prisma: PrismaClient;
}

/**
 * 探针统计聚合服务
 * 负责将原始 ProbeResult 数据聚合到小时表和日表
 */
export class ProbeStatsAggregationService {
  private hourlyAggregationInterval: NodeJS.Timeout | null = null;
  private dailyAggregationInterval: NodeJS.Timeout | null = null;

  // 小时聚合：每小时执行一次
  private readonly HOURLY_AGGREGATION_INTERVAL_MS = 60 * 60 * 1000; // 1 hour
  // 日聚合：每天执行一次
  private readonly DAILY_AGGREGATION_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

  constructor(private options: AggregationServiceOptions) {}

  /**
   * 启动聚合调度器
   */
  async startAggregationScheduler() {
    logger.info("Starting probe stats aggregation scheduler");

    // 启动时先执行一次聚合，补齐可能遗漏的数据
    await this.performHourlyAggregation();
    await this.performDailyAggregation();

    // 定时执行小时聚合
    this.hourlyAggregationInterval = setInterval(async () => {
      await this.performHourlyAggregation();
    }, this.HOURLY_AGGREGATION_INTERVAL_MS);

    // 定时执行日聚合
    this.dailyAggregationInterval = setInterval(async () => {
      await this.performDailyAggregation();
    }, this.DAILY_AGGREGATION_INTERVAL_MS);

    logger.info("Aggregation scheduler started");
  }

  /**
   * 停止聚合调度器
   */
  stopAggregationScheduler() {
    if (this.hourlyAggregationInterval) {
      clearInterval(this.hourlyAggregationInterval);
      this.hourlyAggregationInterval = null;
    }
    if (this.dailyAggregationInterval) {
      clearInterval(this.dailyAggregationInterval);
      this.dailyAggregationInterval = null;
    }
    logger.info("Aggregation scheduler stopped");
  }

  /**
   * 执行小时级聚合
   * 聚合上一个完整小时的数据
   */
  async performHourlyAggregation() {
    try {
      // 计算上一个完整小时的时间范围
      const now = dayjs();
      const lastHourStart = now.subtract(1, "hour").startOf("hour");
      const lastHourEnd = lastHourStart.add(1, "hour");

      logger.info(
        `Starting hourly aggregation for ${lastHourStart.format("YYYY-MM-DD HH:00")}`,
      );

      // 获取所有在该小时有数据的 endpoint
      const endpointResults = await this.options.prisma.probeResult.groupBy({
        by: ["endPointId"],
        where: {
          createdAt: {
            gte: lastHourStart.toDate(),
            lt: lastHourEnd.toDate(),
          },
        },
        _count: {
          id: true,
        },
        _sum: {
          responseTime: true,
        },
        _min: {
          responseTime: true,
        },
        _max: {
          responseTime: true,
        },
      });

      let aggregatedCount = 0;

      for (const result of endpointResults) {
        // 获取该 endpoint 在该小时的成功次数
        const successCount = await this.options.prisma.probeResult.count({
          where: {
            endPointId: result.endPointId,
            createdAt: {
              gte: lastHourStart.toDate(),
              lt: lastHourEnd.toDate(),
            },
            success: true,
          },
        });

        // 计算平均响应时间（仅成功的请求）
        const successfulResults =
          await this.options.prisma.probeResult.aggregate({
            where: {
              endPointId: result.endPointId,
              createdAt: {
                gte: lastHourStart.toDate(),
                lt: lastHourEnd.toDate(),
              },
              success: true,
              responseTime: {
                not: null,
              },
            },
            _avg: {
              responseTime: true,
            },
            _min: {
              responseTime: true,
            },
            _max: {
              responseTime: true,
            },
          });

        // 使用 upsert 避免重复插入
        await this.options.prisma.probeHourlyStat.upsert({
          where: {
            endPointId_hourTimestamp: {
              endPointId: result.endPointId,
              hourTimestamp: lastHourStart.toDate(),
            },
          },
          update: {
            totalChecks: result._count.id,
            successCount: successCount,
            avgResponseTime: successfulResults._avg.responseTime
              ? Math.round(successfulResults._avg.responseTime)
              : null,
            minResponseTime: successfulResults._min.responseTime,
            maxResponseTime: successfulResults._max.responseTime,
          },
          create: {
            endPointId: result.endPointId,
            hourTimestamp: lastHourStart.toDate(),
            totalChecks: result._count.id,
            successCount: successCount,
            avgResponseTime: successfulResults._avg.responseTime
              ? Math.round(successfulResults._avg.responseTime)
              : null,
            minResponseTime: successfulResults._min.responseTime,
            maxResponseTime: successfulResults._max.responseTime,
          },
        });

        aggregatedCount++;
      }

      logger.info(
        `Hourly aggregation completed: processed ${aggregatedCount} endpoints for ${lastHourStart.format("YYYY-MM-DD HH:00")}`,
      );

      return aggregatedCount;
    } catch (error) {
      logger.error("Failed to perform hourly aggregation:", error);
      throw error;
    }
  }

  /**
   * 执行日级聚合
   * 从小时表聚合前一天的数据到日表
   */
  async performDailyAggregation() {
    try {
      // 计算前一天的时间范围
      const now = dayjs();
      const yesterdayStart = now.subtract(1, "day").startOf("day");
      const yesterdayEnd = yesterdayStart.add(1, "day");

      logger.info(
        `Starting daily aggregation for ${yesterdayStart.format("YYYY-MM-DD")}`,
      );

      // 从小时表获取前一天所有 endpoint 的聚合数据
      const hourlyStats = await this.options.prisma.probeHourlyStat.groupBy({
        by: ["endPointId"],
        where: {
          hourTimestamp: {
            gte: yesterdayStart.toDate(),
            lt: yesterdayEnd.toDate(),
          },
        },
        _sum: {
          totalChecks: true,
          successCount: true,
        },
        _min: {
          minResponseTime: true,
        },
        _max: {
          maxResponseTime: true,
        },
      });

      let aggregatedCount = 0;

      for (const stat of hourlyStats) {
        // 计算加权平均响应时间
        const hourlyDetails =
          await this.options.prisma.probeHourlyStat.findMany({
            where: {
              endPointId: stat.endPointId,
              hourTimestamp: {
                gte: yesterdayStart.toDate(),
                lt: yesterdayEnd.toDate(),
              },
              avgResponseTime: {
                not: null,
              },
              successCount: {
                gt: 0,
              },
            },
            select: {
              successCount: true,
              avgResponseTime: true,
            },
          });

        // 计算加权平均: SUM(successCount * avgResponseTime) / SUM(successCount)
        let weightedAvgResponseTime: number | null = null;
        if (hourlyDetails.length > 0) {
          const totalSuccessCount = hourlyDetails.reduce(
            (sum, h) => sum + h.successCount,
            0,
          );
          const weightedSum = hourlyDetails.reduce(
            (sum, h) => sum + h.successCount * (h.avgResponseTime || 0),
            0,
          );
          if (totalSuccessCount > 0) {
            weightedAvgResponseTime = Math.round(
              weightedSum / totalSuccessCount,
            );
          }
        }

        const totalChecks = stat._sum.totalChecks || 0;
        const successCount = stat._sum.successCount || 0;

        // 计算在线率
        const uptimePercentage =
          totalChecks > 0
            ? Math.round((successCount / totalChecks) * 10000) / 100
            : null;

        // 使用 upsert 避免重复插入
        await this.options.prisma.probeDailyStat.upsert({
          where: {
            endPointId_date: {
              endPointId: stat.endPointId,
              date: yesterdayStart.toDate(),
            },
          },
          update: {
            totalChecks: totalChecks,
            successCount: successCount,
            uptimePercentage: uptimePercentage,
            avgResponseTime: weightedAvgResponseTime,
            minResponseTime: stat._min.minResponseTime,
            maxResponseTime: stat._max.maxResponseTime,
          },
          create: {
            endPointId: stat.endPointId,
            date: yesterdayStart.toDate(),
            totalChecks: totalChecks,
            successCount: successCount,
            uptimePercentage: uptimePercentage,
            avgResponseTime: weightedAvgResponseTime,
            minResponseTime: stat._min.minResponseTime,
            maxResponseTime: stat._max.maxResponseTime,
          },
        });

        aggregatedCount++;
      }

      logger.info(
        `Daily aggregation completed: processed ${aggregatedCount} endpoints for ${yesterdayStart.format("YYYY-MM-DD")}`,
      );

      return aggregatedCount;
    } catch (error) {
      logger.error("Failed to perform daily aggregation:", error);
      throw error;
    }
  }

  /**
   * 手动触发小时聚合（用于测试或管理操作）
   */
  async triggerManualHourlyAggregation() {
    logger.info("Manual hourly aggregation triggered");
    return await this.performHourlyAggregation();
  }

  /**
   * 手动触发日聚合（用于测试或管理操作）
   */
  async triggerManualDailyAggregation() {
    logger.info("Manual daily aggregation triggered");
    return await this.performDailyAggregation();
  }

  /**
   * 获取多个端点的聚合统计数据（内部方法）
   * @param endpointIds 端点 ID 数组
   */
  private async getAggregatedStatsForEndpoints(endpointIds: string[]) {
    const now = dayjs();
    const ranges = {
      "24h": now.subtract(24, "hour").toDate(),
      "30d": now.subtract(30, "day").startOf("day").toDate(),
      "1y": now.subtract(1, "year").startOf("day").toDate(),
    };
    const currentHourStart = now.startOf("hour").toDate();
    const todayStart = now.startOf("day").toDate();

    // 24小时统计：从小时表
    const hourlyStats = await this.options.prisma.probeHourlyStat.findMany({
      where: {
        endPointId: { in: endpointIds },
        hourTimestamp: { gte: ranges["24h"] },
      },
    });

    // 当前小时实时数据
    const currentHourAgg = await this.options.prisma.probeResult.aggregate({
      where: {
        endPointId: { in: endpointIds },
        createdAt: { gte: currentHourStart },
      },
      _count: { id: true },
      _avg: { responseTime: true },
      _sum: { responseTime: true },
    });
    const currentHourSuccess = await this.options.prisma.probeResult.count({
      where: {
        endPointId: { in: endpointIds },
        createdAt: { gte: currentHourStart },
        success: true,
      },
    });

    // 计算 24h 统计
    const totalChecks24h =
      hourlyStats.reduce((sum, h) => sum + h.totalChecks, 0) +
      currentHourAgg._count.id;
    const successCount24h =
      hourlyStats.reduce((sum, h) => sum + h.successCount, 0) +
      currentHourSuccess;

    // 计算加权平均响应时间
    const hourlyWithAvg = hourlyStats.filter(
      (h) => h.avgResponseTime !== null && h.successCount > 0,
    );
    let avgResponseTime24h: number | null = null;
    if (hourlyWithAvg.length > 0 || currentHourSuccess > 0) {
      const totalWeight =
        hourlyWithAvg.reduce((sum, h) => sum + h.successCount, 0) +
        currentHourSuccess;
      const weightedSum =
        hourlyWithAvg.reduce(
          (sum, h) => sum + h.successCount * (h.avgResponseTime || 0),
          0,
        ) + (currentHourAgg._sum.responseTime || 0);
      avgResponseTime24h =
        totalWeight > 0 ? Math.round(weightedSum / totalWeight) : null;
    }

    // 30天和1年统计：从日表
    const dailyStats = await this.options.prisma.probeDailyStat.findMany({
      where: {
        endPointId: { in: endpointIds },
        date: { gte: ranges["1y"] },
      },
    });

    const calcRangeStats = (startDate: Date) => {
      const filtered = dailyStats.filter((d) => d.date >= startDate);
      const totalChecks = filtered.reduce((sum, d) => sum + d.totalChecks, 0);
      const successCount = filtered.reduce((sum, d) => sum + d.successCount, 0);
      return { totalChecks, successCount };
    };

    const stats30d = calcRangeStats(ranges["30d"]);
    const stats1y = calcRangeStats(ranges["1y"]);

    // 补充今天的数据
    const todayHourlyStats = hourlyStats.filter(
      (h) => h.hourTimestamp >= todayStart,
    );
    const todayChecks =
      todayHourlyStats.reduce((sum, h) => sum + h.totalChecks, 0) +
      currentHourAgg._count.id;
    const todaySuccess =
      todayHourlyStats.reduce((sum, h) => sum + h.successCount, 0) +
      currentHourSuccess;

    stats30d.totalChecks += todayChecks;
    stats30d.successCount += todaySuccess;
    stats1y.totalChecks += todayChecks;
    stats1y.successCount += todaySuccess;

    const calcUptime = (successCount: number, totalChecks: number) =>
      totalChecks > 0
        ? Math.round((successCount / totalChecks) * 10000) / 100
        : null;

    return {
      stats24h: {
        totalChecks: totalChecks24h,
        successCount: successCount24h,
        uptimePercentage: calcUptime(successCount24h, totalChecks24h),
        avgResponseTime: avgResponseTime24h,
      },
      stats30d: {
        totalChecks: stats30d.totalChecks,
        successCount: stats30d.successCount,
        uptimePercentage: calcUptime(
          stats30d.successCount,
          stats30d.totalChecks,
        ),
      },
      stats1y: {
        totalChecks: stats1y.totalChecks,
        successCount: stats1y.successCount,
        uptimePercentage: calcUptime(stats1y.successCount, stats1y.totalChecks),
      },
    };
  }

  /**
   * 获取端点的多时间范围统计数据
   * @param endpointId 端点 ID
   */
  async getEndpointMultiRangeStats(endpointId: string) {
    // 获取最新一条探测结果
    const latestResult = await this.options.prisma.probeResult.findFirst({
      where: { endPointId: endpointId },
      orderBy: { createdAt: "desc" },
      select: { responseTime: true, success: true, createdAt: true },
    });

    const aggregatedStats = await this.getAggregatedStatsForEndpoints([
      endpointId,
    ]);

    return {
      endpointId,
      current: {
        responseTime: latestResult?.responseTime ?? null,
        success: latestResult?.success ?? null,
        timestamp: latestResult?.createdAt ?? null,
      },
      ...aggregatedStats,
    };
  }

  /**
   * 获取 Host（Service）的多时间范围统计数据
   * 实时聚合该 Host 下所有 Endpoint 的指标
   * @param hostId Host ID
   */
  async getHostMultiRangeStats(hostId: string) {
    // 获取该 Host 下所有 Endpoint
    const endpoints = await this.options.prisma.endPoint.findMany({
      where: { hostId },
      select: { id: true },
    });

    const emptyStats = {
      hostId,
      endpointCount: 0,
      current: { avgResponseTime: null, successRate: null, timestamp: null },
      stats24h: {
        totalChecks: 0,
        successCount: 0,
        uptimePercentage: null,
        avgResponseTime: null,
      },
      stats30d: { totalChecks: 0, successCount: 0, uptimePercentage: null },
      stats1y: { totalChecks: 0, successCount: 0, uptimePercentage: null },
    };

    if (endpoints.length === 0) return emptyStats;

    const endpointIds = endpoints.map((e) => e.id);

    // 获取每个 Endpoint 最新一条探测结果
    const latestResults = await this.options.prisma.probeResult.findMany({
      where: { endPointId: { in: endpointIds } },
      orderBy: { createdAt: "desc" },
      distinct: ["endPointId"],
      select: { responseTime: true, success: true, createdAt: true },
    });

    // 计算当前指标
    const successfulLatest = latestResults.filter((r) => r.success);
    const currentAvgResponseTime =
      successfulLatest.length > 0
        ? Math.round(
            successfulLatest.reduce(
              (sum, r) => sum + (r.responseTime || 0),
              0,
            ) / successfulLatest.length,
          )
        : null;
    const currentSuccessRate =
      latestResults.length > 0
        ? Math.round((successfulLatest.length / latestResults.length) * 10000) /
          100
        : null;
    const latestTimestamp =
      latestResults.length > 0
        ? latestResults.reduce(
            (latest, r) => (r.createdAt > latest ? r.createdAt : latest),
            latestResults[0].createdAt,
          )
        : null;

    const aggregatedStats =
      await this.getAggregatedStatsForEndpoints(endpointIds);

    return {
      hostId,
      endpointCount: endpoints.length,
      current: {
        avgResponseTime: currentAvgResponseTime,
        successRate: currentSuccessRate,
        timestamp: latestTimestamp,
      },
      ...aggregatedStats,
    };
  }
}
