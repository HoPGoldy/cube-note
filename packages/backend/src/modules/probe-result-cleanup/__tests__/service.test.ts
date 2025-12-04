import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { ProbeResultCleanupService } from "../service";
import { prismaMock, resetPrismaMock } from "../../prisma/__mocks__";

describe("ProbeResultCleanupService", () => {
  let service: ProbeResultCleanupService;

  beforeEach(() => {
    vi.useFakeTimers();
    resetPrismaMock();

    service = new ProbeResultCleanupService({
      prisma: prismaMock,
    });
  });

  afterEach(() => {
    service.stopCleanupScheduler();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe("基础功能", () => {
    it("应该能够创建服务实例", () => {
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(ProbeResultCleanupService);
    });
  });

  describe("清理调度器", () => {
    it("应该能够启动和停止调度器", async () => {
      prismaMock.probeResult.deleteMany.mockResolvedValue({ count: 0 });

      await service.startCleanupScheduler();

      // 验证启动时执行了一次清理
      expect(prismaMock.probeResult.deleteMany).toHaveBeenCalledTimes(1);

      service.stopCleanupScheduler();
    });

    it("应该按照设定的间隔执行清理", async () => {
      prismaMock.probeResult.deleteMany.mockResolvedValue({ count: 5 });

      await service.startCleanupScheduler();

      // 初始执行一次
      expect(prismaMock.probeResult.deleteMany).toHaveBeenCalledTimes(1);

      // 快进1小时
      await vi.advanceTimersByTimeAsync(60 * 60 * 1000);
      expect(prismaMock.probeResult.deleteMany).toHaveBeenCalledTimes(2);

      // 再快进1小时
      await vi.advanceTimersByTimeAsync(60 * 60 * 1000);
      expect(prismaMock.probeResult.deleteMany).toHaveBeenCalledTimes(3);
    });
  });

  describe("清理操作", () => {
    it("应该删除超过保留期的所有记录", async () => {
      prismaMock.probeResult.deleteMany.mockResolvedValue({ count: 10 });

      const result = await service.triggerManualCleanup();

      expect(result).toBe(10);
      expect(prismaMock.probeResult.deleteMany).toHaveBeenCalledWith({
        where: {
          createdAt: {
            lt: expect.any(Date),
          },
        },
      });
    });

    it("清理条件应该是3天前的数据", async () => {
      const now = new Date("2025-11-28T10:00:00.000Z");
      vi.setSystemTime(now);

      prismaMock.probeResult.deleteMany.mockResolvedValue({ count: 0 });

      await service.triggerManualCleanup();

      const call = prismaMock.probeResult.deleteMany.mock.calls[0][0] as {
        where: { createdAt: { lt: Date } };
      };
      const cutoffDate = call.where.createdAt.lt;

      // 应该是3天前
      const expectedCutoff = new Date("2025-11-25T10:00:00.000Z");
      expect(cutoffDate.getTime()).toBe(expectedCutoff.getTime());
    });
  });

  describe("统计信息", () => {
    it("应该返回待清理记录数", async () => {
      prismaMock.probeResult.count.mockResolvedValue(25);

      const stats = await service.getCleanupStats();

      expect(stats.recordsToDelete).toBe(25);
      expect(stats.retentionDays).toBe(3);
      expect(stats.cutoffDate).toBeDefined();
    });

    it("统计查询应该使用正确的条件", async () => {
      prismaMock.probeResult.count.mockResolvedValue(0);

      await service.getCleanupStats();

      expect(prismaMock.probeResult.count).toHaveBeenCalledWith({
        where: {
          createdAt: {
            lt: expect.any(Date),
          },
        },
      });
    });
  });

  describe("错误处理", () => {
    it("清理失败时应该抛出错误", async () => {
      const error = new Error("Database connection failed");
      prismaMock.probeResult.deleteMany.mockRejectedValue(error);

      await expect(service.triggerManualCleanup()).rejects.toThrow(
        "Database connection failed",
      );
    });
  });
});
