import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { ProbeStatsAggregationService } from "../service";
import { prismaMock, resetPrismaMock } from "../../prisma/__mocks__";

describe("ProbeStatsAggregationService", () => {
  let service: ProbeStatsAggregationService;

  beforeEach(() => {
    vi.useFakeTimers();
    resetPrismaMock();

    service = new ProbeStatsAggregationService({
      prisma: prismaMock,
    });
  });

  afterEach(() => {
    service.stopAggregationScheduler();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe("基础功能", () => {
    it("应该能够创建服务实例", () => {
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(ProbeStatsAggregationService);
    });
  });

  describe("小时聚合", () => {
    it("没有数据时应该正常完成聚合", async () => {
      prismaMock.probeResult.groupBy.mockResolvedValue([]);

      const result = await service.triggerManualHourlyAggregation();

      expect(result).toBe(0);
      expect(prismaMock.probeResult.groupBy).toHaveBeenCalled();
    });

    it("应该正确聚合单个 endpoint 的数据", async () => {
      const endpointId = "endpoint-1";

      // Mock groupBy 返回有数据的 endpoint
      prismaMock.probeResult.groupBy.mockResolvedValue([
        {
          endPointId: endpointId,
          _count: { id: 10 },
          _sum: { responseTime: 1000 },
          _min: { responseTime: 50 },
          _max: { responseTime: 200 },
        },
      ] as any);

      // Mock 成功次数
      prismaMock.probeResult.count.mockResolvedValue(8);

      // Mock 成功请求的响应时间统计
      prismaMock.probeResult.aggregate.mockResolvedValue({
        _avg: { responseTime: 100 },
        _min: { responseTime: 50 },
        _max: { responseTime: 180 },
      } as any);

      prismaMock.probeHourlyStat.upsert.mockResolvedValue({} as any);

      const result = await service.triggerManualHourlyAggregation();

      expect(result).toBe(1);
      expect(prismaMock.probeHourlyStat.upsert).toHaveBeenCalledTimes(1);

      // 验证 upsert 参数
      const upsertCall = prismaMock.probeHourlyStat.upsert.mock.calls[0][0];
      expect(upsertCall.create.endPointId).toBe(endpointId);
      expect(upsertCall.create.totalChecks).toBe(10);
      expect(upsertCall.create.successCount).toBe(8);
      expect(upsertCall.create.avgResponseTime).toBe(100);
      expect(upsertCall.create.minResponseTime).toBe(50);
      expect(upsertCall.create.maxResponseTime).toBe(180);
    });

    it("应该正确处理多个 endpoint 的聚合", async () => {
      prismaMock.probeResult.groupBy.mockResolvedValue([
        { endPointId: "ep-1", _count: { id: 5 } },
        { endPointId: "ep-2", _count: { id: 10 } },
        { endPointId: "ep-3", _count: { id: 3 } },
      ] as any);

      prismaMock.probeResult.count.mockResolvedValue(4);
      prismaMock.probeResult.aggregate.mockResolvedValue({
        _avg: { responseTime: 100 },
        _min: { responseTime: 50 },
        _max: { responseTime: 150 },
      } as any);
      prismaMock.probeHourlyStat.upsert.mockResolvedValue({} as any);

      const result = await service.triggerManualHourlyAggregation();

      expect(result).toBe(3);
      expect(prismaMock.probeHourlyStat.upsert).toHaveBeenCalledTimes(3);
    });

    it("没有成功请求时 avgResponseTime 应为 null", async () => {
      prismaMock.probeResult.groupBy.mockResolvedValue([
        { endPointId: "ep-1", _count: { id: 5 } },
      ] as any);

      prismaMock.probeResult.count.mockResolvedValue(0); // 没有成功的
      prismaMock.probeResult.aggregate.mockResolvedValue({
        _avg: { responseTime: null },
        _min: { responseTime: null },
        _max: { responseTime: null },
      } as any);
      prismaMock.probeHourlyStat.upsert.mockResolvedValue({} as any);

      await service.triggerManualHourlyAggregation();

      const upsertCall = prismaMock.probeHourlyStat.upsert.mock.calls[0][0];
      expect(upsertCall.create.successCount).toBe(0);
      expect(upsertCall.create.avgResponseTime).toBeNull();
    });
  });

  describe("日聚合", () => {
    it("没有小时数据时应该正常完成", async () => {
      prismaMock.probeHourlyStat.groupBy.mockResolvedValue([]);

      const result = await service.triggerManualDailyAggregation();

      expect(result).toBe(0);
    });

    it("应该从小时表聚合数据到日表", async () => {
      const endpointId = "endpoint-1";

      // Mock 小时表 groupBy
      prismaMock.probeHourlyStat.groupBy.mockResolvedValue([
        {
          endPointId: endpointId,
          _sum: { totalChecks: 100, successCount: 95 },
          _min: { minResponseTime: 30 },
          _max: { maxResponseTime: 500 },
        },
      ] as any);

      // Mock 获取小时详情（用于计算加权平均）
      prismaMock.probeHourlyStat.findMany.mockResolvedValue([
        { successCount: 50, avgResponseTime: 100 },
        { successCount: 45, avgResponseTime: 120 },
      ] as any);

      prismaMock.probeDailyStat.upsert.mockResolvedValue({} as any);

      const result = await service.triggerManualDailyAggregation();

      expect(result).toBe(1);
      expect(prismaMock.probeDailyStat.upsert).toHaveBeenCalledTimes(1);

      // 验证 upsert 参数
      const upsertCall = prismaMock.probeDailyStat.upsert.mock.calls[0][0];
      expect(upsertCall.create.endPointId).toBe(endpointId);
      expect(upsertCall.create.totalChecks).toBe(100);
      expect(upsertCall.create.successCount).toBe(95);
      expect(upsertCall.create.uptimePercentage).toBe(95); // 95/100 * 100
      expect(upsertCall.create.minResponseTime).toBe(30);
      expect(upsertCall.create.maxResponseTime).toBe(500);

      // 验证加权平均响应时间: (50*100 + 45*120) / (50+45) = 109.47 ≈ 109
      expect(upsertCall.create.avgResponseTime).toBe(109);
    });

    it("应该正确计算在线率百分比", async () => {
      prismaMock.probeHourlyStat.groupBy.mockResolvedValue([
        {
          endPointId: "ep-1",
          _sum: { totalChecks: 1000, successCount: 997 },
          _min: { minResponseTime: 50 },
          _max: { maxResponseTime: 200 },
        },
      ] as any);

      prismaMock.probeHourlyStat.findMany.mockResolvedValue([]);
      prismaMock.probeDailyStat.upsert.mockResolvedValue({} as any);

      await service.triggerManualDailyAggregation();

      const upsertCall = prismaMock.probeDailyStat.upsert.mock.calls[0][0];
      // 997/1000 * 100 = 99.7
      expect(upsertCall.create.uptimePercentage).toBe(99.7);
    });

    it("totalChecks 为 0 时 uptimePercentage 应为 null", async () => {
      prismaMock.probeHourlyStat.groupBy.mockResolvedValue([
        {
          endPointId: "ep-1",
          _sum: { totalChecks: 0, successCount: 0 },
          _min: { minResponseTime: null },
          _max: { maxResponseTime: null },
        },
      ] as any);

      prismaMock.probeHourlyStat.findMany.mockResolvedValue([]);
      prismaMock.probeDailyStat.upsert.mockResolvedValue({} as any);

      await service.triggerManualDailyAggregation();

      const upsertCall = prismaMock.probeDailyStat.upsert.mock.calls[0][0];
      expect(upsertCall.create.uptimePercentage).toBeNull();
    });
  });

  describe("调度器", () => {
    it("应该能够启动和停止调度器", async () => {
      prismaMock.probeResult.groupBy.mockResolvedValue([]);
      prismaMock.probeHourlyStat.groupBy.mockResolvedValue([]);

      await service.startAggregationScheduler();

      // 启动时会执行一次小时聚合和日聚合
      expect(prismaMock.probeResult.groupBy).toHaveBeenCalledTimes(1);
      expect(prismaMock.probeHourlyStat.groupBy).toHaveBeenCalledTimes(1);

      service.stopAggregationScheduler();
    });

    it("应该按照设定的间隔执行聚合", async () => {
      prismaMock.probeResult.groupBy.mockResolvedValue([]);
      prismaMock.probeHourlyStat.groupBy.mockResolvedValue([]);

      await service.startAggregationScheduler();

      // 初始执行
      expect(prismaMock.probeResult.groupBy).toHaveBeenCalledTimes(1);

      // 快进1小时 - 应该再执行一次小时聚合
      await vi.advanceTimersByTimeAsync(60 * 60 * 1000);
      expect(prismaMock.probeResult.groupBy).toHaveBeenCalledTimes(2);

      // 快进到24小时 - 应该再执行一次日聚合
      await vi.advanceTimersByTimeAsync(23 * 60 * 60 * 1000);
      expect(prismaMock.probeHourlyStat.groupBy).toHaveBeenCalledTimes(2);
    });
  });

  describe("错误处理", () => {
    it("小时聚合失败时应该抛出错误", async () => {
      const error = new Error("Database error");
      prismaMock.probeResult.groupBy.mockRejectedValue(error);

      await expect(service.triggerManualHourlyAggregation()).rejects.toThrow(
        "Database error",
      );
    });

    it("日聚合失败时应该抛出错误", async () => {
      const error = new Error("Database error");
      prismaMock.probeHourlyStat.groupBy.mockRejectedValue(error);

      await expect(service.triggerManualDailyAggregation()).rejects.toThrow(
        "Database error",
      );
    });
  });
});
