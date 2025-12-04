import { PrismaClient } from "@db/client";
import { logger } from "@/lib/logger";
import dayjs from "dayjs";

interface CleanupServiceOptions {
  prisma: PrismaClient;
}

export class ProbeResultCleanupService {
  private cleanupInterval: NodeJS.Timeout | null = null;
  private readonly CLEANUP_INTERVAL_HOURS = 1; // 每小时执行一次
  private readonly RETENTION_DAYS = 3; // 保留3天原始数据

  constructor(private options: CleanupServiceOptions) {}

  /**
   * Start the cleanup scheduler
   */
  async startCleanupScheduler() {
    logger.info(
      `Starting probe result cleanup scheduler (runs every ${this.CLEANUP_INTERVAL_HOURS} hour(s))`,
    );

    // Run cleanup immediately on start
    await this.performCleanup();

    // Schedule periodic cleanup
    const intervalMs = this.CLEANUP_INTERVAL_HOURS * 60 * 60 * 1000; // Convert hours to milliseconds
    this.cleanupInterval = setInterval(async () => {
      await this.performCleanup();
    }, intervalMs);

    logger.info(
      `Cleanup scheduler started, next cleanup in ${this.CLEANUP_INTERVAL_HOURS} hour(s)`,
    );
  }

  /**
   * Stop the cleanup scheduler
   */
  stopCleanupScheduler() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      logger.info("Cleanup scheduler stopped");
    }
  }

  /**
   * Perform the actual cleanup operation
   * Deletes all ProbeResult records older than RETENTION_DAYS
   * (Data has been aggregated to hourly/daily stats tables)
   */
  private async performCleanup() {
    try {
      const cutoffDate = dayjs().subtract(this.RETENTION_DAYS, "day").toDate();

      logger.info(
        `Starting cleanup of probe results older than ${cutoffDate.toISOString()}`,
      );

      const result = await this.options.prisma.probeResult.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate,
          },
        },
      });

      logger.info(
        `Cleanup completed: deleted ${result.count} probe results older than ${this.RETENTION_DAYS} days`,
      );

      return result.count;
    } catch (error) {
      logger.error("Failed to perform cleanup:", error);
      throw error;
    }
  }

  /**
   * Manual cleanup trigger (for testing or admin operations)
   */
  async triggerManualCleanup() {
    logger.info("Manual cleanup triggered");
    return await this.performCleanup();
  }

  /**
   * Get cleanup statistics without performing deletion
   */
  async getCleanupStats() {
    const cutoffDate = dayjs().subtract(this.RETENTION_DAYS, "day").toDate();

    const count = await this.options.prisma.probeResult.count({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    return {
      recordsToDelete: count,
      cutoffDate: cutoffDate.toISOString(),
      retentionDays: this.RETENTION_DAYS,
    };
  }
}
