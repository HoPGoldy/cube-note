import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { IntervalProbeService } from "../interval-service";

describe("IntervalProbeService", () => {
  let service: IntervalProbeService;
  let mockPrisma: any;
  let mockResultService: any;
  let mockCodeExecutorService: any;

  beforeEach(() => {
    // Mock Prisma Client
    mockPrisma = {
      endPoint: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
      },
      service: {
        findUnique: vi.fn(),
      },
    };

    // Mock Result Service
    mockResultService = {
      createProbeResult: vi.fn(),
    };

    // Mock Code Executor Service
    mockCodeExecutorService = {
      executeCode: vi.fn(),
    };

    service = new IntervalProbeService({
      prisma: mockPrisma as any,
      resultService: mockResultService,
      codeExecutorService: mockCodeExecutorService,
    });
  });

  afterEach(() => {
    // 清理所有定时器
    service.stopProbeScheduler();
    vi.clearAllTimers();
  });

  describe("基础功能", () => {
    it("应该能够创建服务实例", () => {
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(IntervalProbeService);
    });

    it("应该能够获取活动任务状态", () => {
      const status = service.getActiveTasksStatus();
      expect(status).toEqual([]);
    });
  });

  describe("任务调度", () => {
    it("应该能够添加间隔任务", async () => {
      const endpointId = "test-endpoint-1";
      const intervalSeconds = 5;

      mockPrisma.endPoint.findUnique.mockResolvedValue({
        id: endpointId,
        enabled: true,
        url: "https://example.com",
        hostId: "service-1",
      });

      mockPrisma.monitoredHost.findUnique.mockResolvedValue({
        id: "service-1",
        enabled: true,
        url: "https://example.com",
      });

      await service.addEndpointToScheduler(endpointId, intervalSeconds);

      const status = service.getActiveTasksStatus();
      expect(status).toHaveLength(1);
      expect(status[0].endPointId).toBe(endpointId);
      expect(status[0].intervalSeconds).toBe(intervalSeconds);
    });

    it("应该拒绝无效的间隔时间", async () => {
      const endpointId = "test-endpoint-2";
      const invalidInterval = -1;

      await service.addEndpointToScheduler(endpointId, invalidInterval);

      const status = service.getActiveTasksStatus();
      expect(status).toHaveLength(0);
    });

    it("应该能够移除任务", async () => {
      const endpointId = "test-endpoint-3";
      const intervalSeconds = 10;

      mockPrisma.endPoint.findUnique.mockResolvedValue({
        id: endpointId,
        enabled: true,
        url: "https://example.com",
        hostId: "service-1",
      });

      mockPrisma.monitoredHost.findUnique.mockResolvedValue({
        id: "service-1",
        enabled: true,
        url: "https://example.com",
      });

      await service.addEndpointToScheduler(endpointId, intervalSeconds);
      expect(service.getActiveTasksStatus()).toHaveLength(1);

      service.removeEndpointFromScheduler(endpointId);
      expect(service.getActiveTasksStatus()).toHaveLength(0);
    });

    it("应该能够更新任务间隔", async () => {
      const endpointId = "test-endpoint-4";
      const initialInterval = 5;
      const updatedInterval = 10;

      mockPrisma.endPoint.findUnique.mockResolvedValue({
        id: endpointId,
        enabled: true,
        url: "https://example.com",
        hostId: "service-1",
      });

      mockPrisma.monitoredHost.findUnique.mockResolvedValue({
        id: "service-1",
        enabled: true,
        url: "https://example.com",
      });

      await service.addEndpointToScheduler(endpointId, initialInterval);
      const status = service.getActiveTasksStatus();
      expect(status[0].intervalSeconds).toBe(initialInterval);
    });
  });

  describe("暂停和恢复", () => {
    it("应该能够暂停任务", async () => {
      const endpointId = "test-endpoint-5";
      const intervalSeconds = 5;

      mockPrisma.endPoint.findUnique.mockResolvedValue({
        id: endpointId,
        enabled: true,
        url: "https://example.com",
        hostId: "service-1",
      });

      mockPrisma.monitoredHost.findUnique.mockResolvedValue({
        id: "service-1",
        enabled: true,
        url: "https://example.com",
      });

      await service.addEndpointToScheduler(endpointId, intervalSeconds);
      service.pauseEndpoint(endpointId);

      // 暂停后任务仍在列表中，但不会执行
      const status = service.getActiveTasksStatus();
      expect(status).toHaveLength(1);
    });

    it("应该能够恢复任务", async () => {
      const endpointId = "test-endpoint-6";
      const intervalSeconds = 5;

      mockPrisma.endPoint.findUnique.mockResolvedValue({
        id: endpointId,
        enabled: true,
        url: "https://example.com",
        hostId: "service-1",
      });

      mockPrisma.monitoredHost.findUnique.mockResolvedValue({
        id: "service-1",
        enabled: true,
        url: "https://example.com",
      });

      await service.addEndpointToScheduler(endpointId, intervalSeconds);
      service.pauseEndpoint(endpointId);
      await service.resumeEndpoint(endpointId);

      const status = service.getActiveTasksStatus();
      expect(status).toHaveLength(1);
      expect(status[0].intervalSeconds).toBe(intervalSeconds);
    });
  });

  describe("批量操作", () => {
    it("应该能够停止所有任务", async () => {
      mockPrisma.endPoint.findUnique.mockResolvedValue({
        id: "endpoint-1",
        enabled: true,
        url: "https://example.com",
        hostId: "service-1",
      });

      mockPrisma.monitoredHost.findUnique.mockResolvedValue({
        id: "service-1",
        enabled: true,
        url: "https://example.com",
      });

      await service.addEndpointToScheduler("endpoint-1", 5);
      await service.addEndpointToScheduler("endpoint-2", 10);
      await service.addEndpointToScheduler("endpoint-3", 15);

      expect(service.getActiveTasksStatus().length).toBeGreaterThan(0);

      service.stopProbeScheduler();
      expect(service.getActiveTasksStatus()).toHaveLength(0);
    });
  });

  describe("状态信息", () => {
    it("应该返回正确的任务状态信息", async () => {
      const endpointId = "test-endpoint-7";
      const intervalSeconds = 10;

      mockPrisma.endPoint.findUnique.mockResolvedValue({
        id: endpointId,
        enabled: true,
        url: "https://example.com",
        hostId: "service-1",
      });

      mockPrisma.monitoredHost.findUnique.mockResolvedValue({
        id: "service-1",
        enabled: true,
        url: "https://example.com",
      });

      await service.addEndpointToScheduler(endpointId, intervalSeconds);

      const status = service.getActiveTasksStatus();
      expect(status).toHaveLength(1);
      expect(status[0]).toHaveProperty("endPointId");
      expect(status[0]).toHaveProperty("intervalSeconds");
      expect(status[0]).toHaveProperty("lastExecutionTime");
      expect(status[0]).toHaveProperty("nextExecutionTime");

      expect(status[0].lastExecutionTime).toBeInstanceOf(Date);
      expect(status[0].nextExecutionTime).toBeInstanceOf(Date);
    });
  });

  describe("边界情况", () => {
    it("应该处理禁用的 endpoint", async () => {
      const endpointId = "disabled-endpoint";
      const intervalSeconds = 5;

      mockPrisma.endPoint.findUnique.mockResolvedValue({
        id: endpointId,
        enabled: false,
        url: "https://example.com",
        hostId: "service-1",
      });

      await service.addEndpointToScheduler(endpointId, intervalSeconds);

      const status = service.getActiveTasksStatus();
      expect(status).toHaveLength(0);
    });

    it("应该处理不存在的 endpoint", async () => {
      const endpointId = "non-existent";
      const intervalSeconds = 5;

      mockPrisma.endPoint.findUnique.mockResolvedValue(null);

      await service.addEndpointToScheduler(endpointId, intervalSeconds);

      const status = service.getActiveTasksStatus();
      expect(status).toHaveLength(0);
    });

    it("应该能够移除不存在的任务", () => {
      // 不应该抛出错误
      expect(() => {
        service.removeEndpointFromScheduler("non-existent");
      }).not.toThrow();
    });
  });
});
