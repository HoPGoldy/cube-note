# Interval Probe Service

基于固定时间间隔（秒）的探测任务调度服务，作为 cron 表达式调度的替代方案。

## 功能特性

- ✅ 基于秒为单位的固定间隔执行
- ✅ 任务的添加、移除、更新
- ✅ 任务的暂停和恢复
- ✅ 立即执行功能
- ✅ 手动触发探测
- ✅ 实时任务状态查询
- ✅ 自动重试和错误处理

## 与 CronService 的区别

| 特性       | CronService                | IntervalProbeService           |
| ---------- | -------------------------- | ------------------------------ |
| 调度方式   | Cron 表达式                | 固定间隔（秒）                 |
| 执行时间   | 精确的时刻（如每天 10:00） | 固定间隔重复                   |
| 适用场景   | 定时任务（如每天凌晨备份） | 持续监控（如每 30 秒检查一次） |
| 配置复杂度 | 需要理解 cron 语法         | 简单的秒数                     |
| 首次执行   | 等待到下一个 cron 时刻     | 立即执行                       |

## 使用方法

### 1. 创建服务实例

```typescript
import { IntervalProbeService } from "@/modules/probe-task/interval-service";

const intervalProbeService = new IntervalProbeService({
  prisma,
  resultService,
});
```

### 2. 添加探测任务

```typescript
// 每 30 秒执行一次探测
await intervalProbeService.addEndpointToScheduler("endpoint-id", 30);
```

### 3. 启动调度器

```typescript
// 启动所有已配置的任务
await intervalProbeService.startProbeScheduler();
```

### 4. 管理任务

```typescript
// 更新任务间隔为 60 秒
await intervalProbeService.updateEndpointInScheduler("endpoint-id", 60);

// 暂停任务
intervalProbeService.pauseEndpoint("endpoint-id");

// 恢复任务
await intervalProbeService.resumeEndpoint("endpoint-id");

// 移除任务
intervalProbeService.removeEndpointFromScheduler("endpoint-id");

// 手动触发一次探测
await intervalProbeService.triggerManualProbe("endpoint-id");
```

### 5. 查询任务状态

```typescript
const status = intervalProbeService.getActiveTasksStatus();
console.log(status);
/*
[
  {
    endPointId: 'endpoint-1',
    intervalSeconds: 30,
    lastExecutionTime: 2024-01-15T10:00:00.000Z,
    nextExecutionTime: 2024-01-15T10:00:30.000Z
  }
]
*/
```

### 6. 停止所有任务

```typescript
intervalProbeService.stopProbeScheduler();
```

## API 参考

### 核心方法

#### `addEndpointToScheduler(endPointId: string, intervalSeconds: number)`

添加一个新的探测任务到调度器。

**参数：**

- `endPointId`: Endpoint ID
- `intervalSeconds`: 间隔秒数（必须 > 0）

**行为：**

- 立即执行一次探测
- 然后按指定间隔重复执行

#### `removeEndpointFromScheduler(endPointId: string)`

从调度器中移除探测任务。

#### `updateEndpointInScheduler(endPointId: string, intervalSeconds: number)`

更新探测任务的间隔时间。

#### `pauseEndpoint(endPointId: string)`

暂停探测任务（不从调度器中移除）。

#### `resumeEndpoint(endPointId: string)`

恢复之前暂停的探测任务。

#### `triggerManualProbe(endPointId: string)`

手动触发一次探测，不影响正常的调度周期。

#### `getActiveTasksStatus()`

获取所有活动任务的状态信息。

**返回：**

```typescript
Array<{
  endPointId: string;
  intervalSeconds: number;
  lastExecutionTime: Date;
  nextExecutionTime: Date;
}>;
```

#### `startProbeScheduler()`

启动所有已配置的探测任务。

#### `stopProbeScheduler()`

停止所有探测任务。

## 配置示例

### 不同场景的间隔设置

```typescript
// 高频监控：每 10 秒
await service.addEndpointToScheduler("critical-api", 10);

// 正常监控：每 30 秒
await service.addEndpointToScheduler("normal-api", 30);

// 低频监控：每 5 分钟（300 秒）
await service.addEndpointToScheduler("background-job", 300);

// 每小时：3600 秒
await service.addEndpointToScheduler("hourly-check", 3600);

// 每天：86400 秒
await service.addEndpointToScheduler("daily-check", 86400);
```

## 数据库 Schema 扩展建议

为了更好地支持间隔调度，建议在 `EndPoint` 和 `Service` 模型中添加以下字段：

```prisma
model Service {
  // ... 现有字段
  cronExpression   String?  // Cron 表达式（可选）
  intervalSeconds  Int?     // 间隔秒数（可选）
  scheduleMode     String?  // "cron" | "interval"
}

model EndPoint {
  // ... 现有字段
  cronExpression   String?  // Cron 表达式（可选）
  intervalSeconds  Int?     // 间隔秒数（可选）
  scheduleMode     String?  // "cron" | "interval"
}
```

## 使用建议

### 何时使用 IntervalProbeService

✅ **适合使用的场景：**

- 需要持续监控的 API 端点
- 健康检查
- 性能监控
- 可用性检测
- 不关心具体执行时刻的任务

❌ **不适合使用的场景：**

- 需要在特定时间执行（如每天凌晨 2 点）
- 需要复杂的调度规则（如工作日执行）
- 需要与日历时间同步

### 性能考虑

1. **间隔时间不要太短**
   - 建议最小间隔 >= 5 秒
   - 避免过度占用系统资源

2. **任务数量控制**
   - 每个任务都是独立的 `setInterval`
   - 大量任务可能影响性能

3. **立即执行**
   - 添加任务时会立即执行一次
   - 注意避免启动时的请求峰值

## 集成到现有系统

### 在 build-service.ts 中注册

```typescript
import { IntervalProbeService } from "@/modules/probe-task/interval-service";

// 创建服务实例
const intervalProbeService = new IntervalProbeService({
  prisma,
  resultService,
});

// 启动调度器
await intervalProbeService.startProbeScheduler();
```

### 同时使用两种调度器

可以同时运行 CronService 和 IntervalProbeService：

```typescript
// Cron 调度器：用于有明确时间要求的任务
const cronService = new CronService({ prisma, resultService });
await cronService.startProbeScheduler();

// 间隔调度器：用于持续监控
const intervalService = new IntervalProbeService({ prisma, resultService });
await intervalService.startProbeScheduler();
```

## 日志输出

所有日志都带有 `[Interval]` 前缀，便于区分：

```
[Interval] Starting interval-based probe scheduler...
[Interval] Scheduled probe for endpoint abc123 with interval: 30s
[Interval] Probe completed for endpoint abc123: Status 200, Response time: 45ms
[Interval] Probe failed for endpoint xyz789: No response received
[Interval] Stopping probe scheduler...
```

## 测试

运行测试：

```bash
pnpm test src/modules/probe-task/__tests__/interval-service.test.ts
```

## 注意事项

1. **精度问题**
   - JavaScript 的 `setInterval` 不是绝对精确的
   - 实际间隔可能有几毫秒的偏差
   - 不适合需要精确时间的场景

2. **进程重启**
   - 进程重启后任务会丢失
   - 需要重新调用 `startProbeScheduler()`

3. **内存管理**
   - 确保在不需要时调用 `stopProbeScheduler()`
   - 避免内存泄漏

4. **错误处理**
   - 探测失败不会停止调度
   - 会记录错误并继续下一次执行
