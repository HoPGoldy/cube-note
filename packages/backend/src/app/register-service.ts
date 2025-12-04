import { PrismaService } from "@/modules/prisma";
import { registerController as registerAuthController } from "@/modules/auth/controller";
import { registerController as registerAppConfigController } from "@/modules/app-config/controller";
import { registerController as registerMonitoredHostController } from "@/modules/monitored-host/controller";
import { registerController as registerEndPointController } from "@/modules/monitored-endpoint/controller";
import { registerController as registerResultController } from "@/modules/monitored-result/controller";
import { registerController as registerCodeExecutorController } from "@/modules/code-executor/controller";
import { registerController as registerProbeStatsController } from "@/modules/probe-stats-aggregation/controller";
import { registerController as registerNotificationController } from "@/modules/notification/controller";
import { registerController as registerProbeEnvController } from "@/modules/probe-env/controller";
import { AppConfigService } from "@/modules/app-config/service";
import { MonitoredHostService } from "@/modules/monitored-host/service";
import { EndPointService } from "@/modules/monitored-endpoint/service";
import { ResultService } from "@/modules/monitored-result/service";
import { CodeExecutorService } from "@/modules/code-executor/service";
import { IntervalProbeService } from "@/modules/probe-task/interval-service";
import { ProbeResultCleanupService } from "@/modules/probe-result-cleanup/service";
import { ProbeStatsAggregationService } from "@/modules/probe-stats-aggregation/service";
import { NotificationService } from "@/modules/notification/service";
import { ProbeEnvService } from "@/modules/probe-env/service";
import { registerUnifyResponse } from "@/lib/unify-response";
import type { AppInstance } from "@/types";

/**
 * 组装后端服务的主要业务功能
 * 这里手动进行了依赖注入，先创建 service，然后传递给 controller 使用
 */
export const registerService = async (instance: AppInstance) => {
  const prisma = new PrismaService();

  await prisma.seed();

  const appConfigService = new AppConfigService({
    prisma,
  });

  const monitoredHostService = new MonitoredHostService({ prisma });

  const resultService = new ResultService({
    prisma,
  });

  const notificationService = new NotificationService({
    prisma,
  });

  const probeEnvService = new ProbeEnvService({
    prisma,
  });

  const codeExecutorService = new CodeExecutorService({
    enableHttp: true, // 启用 HTTP 请求功能
    httpTimeout: 10000, // HTTP 请求超时 10 秒
    probeEnvService, // 注入环境变量服务
    // allowedDomains: ['api.example.com', '*.github.com'], // 可选：限制允许的域名
  });

  const intervalProbeService = new IntervalProbeService({
    prisma,
    resultService,
    codeExecutorService,
    notificationService,
  });

  const probeResultCleanupService = new ProbeResultCleanupService({
    prisma,
  });

  const probeStatsAggregationService = new ProbeStatsAggregationService({
    prisma,
  });

  const endPointService = new EndPointService({
    prisma,
    intervalProbeService,
  });

  const appControllerPlugin = async (server: AppInstance) => {
    registerUnifyResponse(server);

    registerAuthController({
      server,
    });

    registerAppConfigController({
      appConfigService,
      server,
    });

    registerMonitoredHostController({
      monitoredHostService,
      server,
    });

    registerEndPointController({
      endPointService,
      server,
    });

    registerResultController({
      resultService,
      server,
    });

    registerCodeExecutorController({
      codeExecutorService,
      monitoredHostService,
      server,
    });

    registerProbeStatsController({
      probeStatsAggregationService,
      server,
    });

    registerNotificationController({
      notificationService,
      server,
    });

    registerProbeEnvController({
      probeEnvService,
      server,
    });

    // Start the probe scheduler after controllers are registered
    setImmediate(async () => {
      await intervalProbeService.startProbeScheduler();
      await probeResultCleanupService.startCleanupScheduler();
      await probeStatsAggregationService.startAggregationScheduler();
    });
  };

  await instance.register(appControllerPlugin, {
    prefix: "/api",
  });
};
