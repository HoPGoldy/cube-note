import { ProbeStatsAggregationService } from "./service";
import { AppInstance } from "@/types";
import Type from "typebox";

interface ControllerOptions {
  server: AppInstance;
  probeStatsAggregationService: ProbeStatsAggregationService;
}

export const registerController = async (options: ControllerOptions) => {
  const { server, probeStatsAggregationService } = options;

  // 获取端点多时间范围统计
  server.post(
    "/probe-stats/endpoint/multi-range",
    {
      schema: {
        description: "获取端点多时间范围统计（当前响应、24h、30d、1y）",
        body: Type.Object({
          endpointId: Type.String({ description: "端点 ID" }),
        }),
        response: {
          200: Type.Object({
            endpointId: Type.String(),
            current: Type.Object({
              responseTime: Type.Union([Type.Number(), Type.Null()]),
              success: Type.Union([Type.Boolean(), Type.Null()]),
              timestamp: Type.Union([Type.Any(), Type.Null()]),
            }),
            stats24h: Type.Object({
              totalChecks: Type.Number(),
              successCount: Type.Number(),
              uptimePercentage: Type.Union([Type.Number(), Type.Null()]),
              avgResponseTime: Type.Union([Type.Number(), Type.Null()]),
            }),
            stats30d: Type.Object({
              totalChecks: Type.Number(),
              successCount: Type.Number(),
              uptimePercentage: Type.Union([Type.Number(), Type.Null()]),
            }),
            stats1y: Type.Object({
              totalChecks: Type.Number(),
              successCount: Type.Number(),
              uptimePercentage: Type.Union([Type.Number(), Type.Null()]),
            }),
          }),
        },
      },
    },
    async (req) => {
      const { endpointId } = req.body;
      const result =
        await probeStatsAggregationService.getEndpointMultiRangeStats(
          endpointId,
        );
      return result;
    },
  );

  // 获取 Host（Service）多时间范围统计
  server.post(
    "/probe-stats/host/multi-range",
    {
      schema: {
        description: "获取 Host 多时间范围统计（聚合所有 Endpoint）",
        body: Type.Object({
          hostId: Type.String({ description: "Host ID" }),
        }),
        response: {
          200: Type.Object({
            hostId: Type.String(),
            endpointCount: Type.Number(),
            current: Type.Object({
              avgResponseTime: Type.Union([Type.Number(), Type.Null()]),
              successRate: Type.Union([Type.Number(), Type.Null()]),
              timestamp: Type.Union([Type.Any(), Type.Null()]),
            }),
            stats24h: Type.Object({
              totalChecks: Type.Number(),
              successCount: Type.Number(),
              uptimePercentage: Type.Union([Type.Number(), Type.Null()]),
              avgResponseTime: Type.Union([Type.Number(), Type.Null()]),
            }),
            stats30d: Type.Object({
              totalChecks: Type.Number(),
              successCount: Type.Number(),
              uptimePercentage: Type.Union([Type.Number(), Type.Null()]),
            }),
            stats1y: Type.Object({
              totalChecks: Type.Number(),
              successCount: Type.Number(),
              uptimePercentage: Type.Union([Type.Number(), Type.Null()]),
            }),
          }),
        },
      },
    },
    async (req) => {
      const { hostId } = req.body;
      const result =
        await probeStatsAggregationService.getHostMultiRangeStats(hostId);
      return result;
    },
  );
};
