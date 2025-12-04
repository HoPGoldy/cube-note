# old/src/server vs packages/backend 对比分析

## 概述

这是从**单一 monolithic 架构**向**现代微模块化架构**的重大升级，涉及框架、数据库、项目结构和功能扩展的全面改造。

---

## 一、框架和技术栈变化

### 旧架构 (old/src/server)

- **Web Framework**: Koa.js
- **Database**: SQLite3 (原生驱动) + Knex 查询构建器
- **ORM**: 无（直接使用 Knex）
- **API 文档**: 无 Swagger/OpenAPI
- **验证**: Joi 模式验证
- **认证**: JWT (jsonwebtoken 库)
- **文件上传**: koa-body (multipart 处理)
- **静态资源**: koa-static, history API fallback
- **日志**: koa-logger

### 新架构 (packages/backend)

- **Web Framework**: Fastify 5.x
- **Database**: SQLite (via @prisma/adapter-better-sqlite3)
- **ORM**: Prisma 7.0 (完整 ORM)
- **API 文档**: @fastify/swagger + @fastify/swagger-ui
- **验证**: TypeBox (type-safe schema validation)
- **认证**: @fastify/jwt + @simplewebauthn/server (WebAuthn/Passkey)
- **文件上传**: @fastify/multipart
- **静态资源**: @fastify/static
- **日志**: Pino (enterprise logging)
- **依赖注入**: 手动 DI 模式

**变化原因**:

- Fastify 性能更高，更轻量级
- Prisma 提供完整的类型安全和迁移管理
- TypeBox 与 Fastify 集成更好，提供完整的类型安全验证
- WebAuthn 支持现代无密码认证
- Swagger 自动生成 API 文档

---

## 二、项目结构对比

### 旧结构

```
old/src/server/
├── app/
│   ├── index.ts           # 应用启动入口
│   ├── buildApp.ts        # 服务实例化
│   └── buildRouter.ts     # 路由构建
├── lib/
│   ├── sqlite.ts          # 数据库初始化
│   ├── auth.ts            # JWT 签发
│   ├── fileAccessor.ts    # 文件路径管理
│   ├── databaseUpgrader.ts # 数据库升级脚本
│   ├── LoginLocker.ts     # 登录尝试锁定
│   └── banLocker.ts       # 用户封禁管理
└── modules/
    ├── article/
    ├── file/
    ├── global/
    ├── tag/
    ├── user/
    └── userManage/

总共 6 个业务模块（全是笔记应用相关）
```

### 新结构

```
packages/backend/src/
├── app/
│   ├── build-app.ts       # 应用启动（Fastify 实例化）
│   ├── register-plugin.ts # 注册 Fastify 插件
│   └── register-service.ts # 注册业务服务
├── config/
│   ├── env.ts             # 环境变量配置管理
│   └── path.ts            # 路径配置
├── lib/
│   ├── crypto/            # 加密工具
│   ├── frontend-history/  # 前端历史记录处理
│   ├── logger/            # Pino 日志配置
│   ├── swagger/           # Swagger 配置
│   └── unify-response/    # 统一响应格式
├── types/
│   ├── error.ts           # 错误类型
│   ├── index.ts           # 通用类型
│   └── schema.ts          # TypeBox schema 工具类
├── modules/               # 12 个模块（架构升级后增加功能）
│   ├── app-config/        # 应用配置管理
│   ├── auth/              # 认证（新增 WebAuthn 支持）
│   ├── code-executor/     # 代码执行沙箱（新增）
│   ├── monitored-endpoint/ # 监控端点（新增）
│   ├── monitored-host/    # 监控主机/服务（新增）
│   ├── monitored-result/  # 监控结果存储（新增）
│   ├── notification/      # 通知系统（新增）
│   ├── prisma/            # Prisma 集成（新增）
│   ├── probe-env/         # 探针环境变量（新增）
│   ├── probe-result-cleanup/ # 结果清理（新增）
│   ├── probe-stats-aggregation/ # 统计聚合（新增）
│   └── probe-task/        # 探针任务调度（新增）
├── index.ts               # 应用入口
├── parent.ts              # Worker 进程管理（新增）
├── child.ts               # Worker 子进程（新增）
└── worker.ts              # Worker 配置（新增）

packages/backend/prisma/
├── schema.prisma          # 新增：Prisma 数据库模型定义
├── migrations/            # 新增：数据库迁移历史
└── client/                # 新增：生成的 Prisma Client
```

---

## 三、数据库模型变化

### 旧架构 (无模型定义，直接 SQL)

```typescript
// 直接使用 Knex 编写 SQL 查询
db.user().select().where({ id: userId }).first();
db.article().insert({ title, content }).returning("*");
```

- 无版本管理
- 无类型安全
- 迁移手动维护

### 新架构 (Prisma Schema)

**新增数据库模型**:

| 模型                  | 用途                  |
| --------------------- | --------------------- |
| `User`                | 用户（扩展了旧架构）  |
| `WebAuthnCredential`  | WebAuthn 凭证（新增） |
| `Application`         | 第三方应用（新增）    |
| `Attachment`          | 文件附件（新增）      |
| `AppConfig`           | 应用配置（新增）      |
| `MonitoredHost`       | 监控服务/主机（新增） |
| `EndPoint`            | 监控端点（新增）      |
| `ProbeResult`         | 探针执行结果（新增）  |
| `ProbeHourlyStat`     | 小时级统计（新增）    |
| `ProbeDailyStat`      | 日级统计（新增）      |
| `NotificationChannel` | 通知渠道（新增）      |
| `NotificationLog`     | 通知日志（新增）      |
| `ProbeEnv`            | 探针环境变量（新增）  |

**核心特性**:

- ✅ 自动迁移管理
- ✅ 类型安全的 Prisma Client
- ✅ JSON 字段支持（headers, config 等）
- ✅ 关系管理（OneToMany, ManyToOne）
- ✅ 索引优化

---

## 四、功能扩展对比

### 旧架构模块

```
user/         - 用户登录、获取信息
userManage/   - 用户管理、邀请
article/      - 文章 CRUD
file/         - 文件上传下载
tag/          - 标签管理
global/       - 全局配置
```

### 新架构新增模块

1. **code-executor** - 代码执行沙箱
   - 支持在隔离环境执行 JavaScript 代码
   - 安全沙箱隔离（vm2）
   - HTTP 客户端注入

2. **probe-task** - 探针任务调度
   - 定时监控 HTTP 端点
   - 支持 CONFIG 模式（URL/方法/请求头）
   - 支持 CODE 模式（执行自定义代码）
   - 间隔时间配置

3. **notification** - 通知系统
   - 多渠道通知（Email, Webhook, Telegram）
   - 失败告警
   - 通知历史记录

4. **probe-stats-aggregation** - 统计聚合
   - 小时级聚合统计
   - 日级聚合统计
   - 多时间范围查询（24h, 30d, 1y）

5. **probe-env** - 环境变量管理
   - 全局配置变量注入
   - 支持密钥隐藏

6. **app-config** - 应用配置
   - 键值对配置存储

7. **monitored-host** - 监控主机
   - 服务分组管理
   - 共享配置（URL、请求头）

8. **monitored-endpoint** - 监控端点
   - 单个端点配置
   - 继承服务配置

---

## 五、API 路由架构对比

### 旧架构 (Koa Router)

```typescript
// old/src/server/app/buildRouter.ts
const router = new Router();

router.post('/api/user/login', (ctx) => {
  // 直接处理请求
  const { password } = ctx.request.body;
  // ... 业务逻辑
  ctx.body = { code: 200, data: {...} };
});
```

**特点**:

- 路由直接返回 Koa context
- 无统一响应格式化
- 无自动 API 文档

### 新架构 (Fastify + TypeBox)

```typescript
// packages/backend/src/modules/auth/controller.ts
export const registerController = (options: RegisterOptions) => {
  const { server } = options;

  server.post(
    "/auth/login",
    {
      config: { disableAuth: true },
      schema: {
        description: "用户登录",
        tags: ["auth"],
        body: { type: "object", required: ["password"], properties: {...} },
        response: { 200: { ... }, 401: { ... } }
      }
    },
    async (request, reply) => {
      // 完整的类型检查
      // 自动生成 Swagger 文档
      return { code: 200, data: {...} };
    }
  );
};
```

**特点**:

- ✅ 完整的 TypeBox schema 验证
- ✅ 自动生成 Swagger/OpenAPI 文档
- ✅ 请求/响应类型完全类型安全
- ✅ 钩子系统（preHandler, onRoute 等）
- ✅ 更好的错误处理

---

## 六、依赖注入模式对比

### 旧架构 (工厂函数)

```typescript
// old/src/server/app/buildApp.ts
export const buildApp = async () => {
  const db = createDb({ dbPath: getStoragePath('cube-note.db') });

  const articleService = createArticleService({ db });
  const fileService = createFileService({ getSaveDir: getStoragePath, db });
  const tagService = createTagService({ db });

  const userService = createUserService({
    loginLocker,
    createToken,
    getReplayAttackSecret,
    db,
    addArticle: articleService.addArticle,
    finishUserInvite,
  });

  return { userService, articleService, ... };
};
```

### 新架构 (Fastify 容器 + 手动 DI)

```typescript
// packages/backend/src/app/register-service.ts
export const registerService = async (server: AppInstance) => {
  const prisma = new PrismaClient();

  // 服务实例化
  const authService = new AuthService(prisma);
  const monitoredHostService = new MonitoredHostService(prisma);
  const probeTaskService = new ProbeTaskService(prisma);

  // 绑定到 Fastify 实例
  server.decorate("authService", authService);
  server.decorate("monitoredHostService", monitoredHostService);

  // 启动后台服务
  await probeTaskService.startScheduler();
};
```

**变化**:

- 使用 Fastify 的 `decorate()` 进行依赖注入
- 更清晰的服务生命周期管理
- 支持后台任务启动（setImmediate）

---

## 七、认证系统对比

### 旧架构

```typescript
// 仅支持密码 + JWT
- 密码哈希: sha256
- Token 签发: jsonwebtoken
- 角色: ADMIN / USER (boolean isAdmin)
```

### 新架构

```typescript
// 支持 WebAuthn + JWT + 密码
- 密码哈希: bcryptjs (更安全)
- Token 签发: @fastify/jwt
- WebAuthn: @simplewebauthn/server (FIDO2 passkey)
- 角色: 使用枚举 UserRole { USER, ADMIN }
- 新增: Application token 支持
```

**变化原因**: 现代应用的无密码认证需求

---

## 八、环境配置对比

### 旧架构

```typescript
// old/src/index.ts
actionRun({
  storage: process.cwd(),
  port: process.env.NODE_ENV === "development" ? "3600" : "3700",
  formLimit: "20mb",
});
```

### 新架构

```typescript
// packages/backend/src/config/env.ts
export const ENV_IS_PROD = getEnv("NODE_ENV", "development") === "production";
export const ENV_IS_DEV = getEnv("NODE_ENV", "development") === "development";
export const ENV_JWT_SECRET = getEnv("BACKEND_JWT_SECRET", nanoid());
export const ENV_BACKEND_PORT = +getEnv("BACKEND_PORT", "3499");
export const ENV_FRONTEND_BASE_URL = getEnv("FRONTEND_BASE_URL", "/");
export const ENV_BACKEND_LOGIN_PASSWORD = getEnv(
  "BACKEND_LOGIN_PASSWORD",
  nanoid(12),
);
```

**改进**:

- ✅ 集中式环境变量管理
- ✅ dotenv-flow 支持 .env.local 覆盖
- ✅ 类型安全的配置访问
- ✅ 明确的默认值

---

## 九、错误处理对比

### 旧架构

```typescript
return { code: 401, msg: `${msg}，${message}` };
```

- 手动返回错误对象
- 无统一错误类型
- 容易出现不一致

### 新架构

```typescript
// packages/backend/src/types/error.ts
export class ErrorUnauthorized extends FastifyError {
  constructor(message = "Unauthorized") {
    super({ statusCode: 401, message });
  }
}

throw new ErrorUnauthorized();
```

**改进**:

- ✅ 自定义 Error 类继承
- ✅ 自动 HTTP 状态码映射
- ✅ 类型安全
- ✅ 统一错误响应格式

---

## 十、日志系统对比

### 旧架构

```typescript
// koa-logger: 简单的请求日志
app.use(logger());
```

### 新架构

```typescript
// packages/backend/src/lib/logger/index.ts
// Pino: 企业级 JSON 日志
const logger = pino({
  level: ENV_IS_PROD ? "info" : "debug",
  transport: ENV_IS_PROD ? undefined : { target: "pino-pretty" },
});
```

**改进**:

- ✅ 结构化 JSON 日志
- ✅ 按环境调整日志级别
- ✅ 生产环境优化
- ✅ 更好的日志聚合支持

---

## 十一、Worker 进程对比

### 旧架构

- 无 worker 支持
- 定时任务通过 Node.js setInterval（阻塞主线程）

### 新架构

```typescript
// packages/backend/src/parent.ts - 主进程
// packages/backend/src/child.ts - 子进程
// packages/backend/src/worker.ts - Worker 配置
```

**新增**:

- ✅ Worker 进程架构
- ✅ 后台任务隔离
- ✅ 探针任务独立运行
- ✅ 支持多进程并行

---

## 十二、测试框架对比

### 旧架构

- 无测试框架配置

### 新架构

```typescript
// packages/backend/vitest.config.ts
// Vitest: 现代 TypeScript 测试框架
// 支持:
// - Unit 测试
// - 模拟 (vitest-mock-extended)
// - 覆盖率报告
```

**脚本**:

```bash
pnpm test              # 运行测试
pnpm test:ui          # UI 测试界面
pnpm test:coverage    # 覆盖率报告
```

---

## 十三、包管理和构建对比

### 旧架构

```json
{
  "scripts": {
    "server:dev": "tsx watch --tsconfig tsconfig.server.json",
    "server:build": "tsc && tsc-alias",
    "client:dev": "vite --host",
    "client:build": "vite build"
  }
}
```

### 新架构

```json
{
  "scripts": {
    "start:dev": "tsx watch src/index.ts",
    "start:prod": "node dist/index.js",
    "start:worker": "tsx src/parent.ts",
    "init:dev": "prisma migrate dev",
    "build": "tsc && pkgroll"
  }
}
```

**变化**:

- ✅ 使用 `pkgroll` 替代 `tsc-alias`
- ✅ Prisma 迁移命令集成
- ✅ Worker 启动脚本
- ✅ 环境感知的启动

---

## 十四、Monorepo 架构变化

### 旧架构

```
cube-note/
├── package.json (单一应用)
└── src/
    ├── client/   (React 前端)
    └── server/   (Koa 后端)
```

### 新架构

```
cube-note/
├── pnpm-workspace.yaml
├── package.json (root)
├── packages/
│   ├── backend/    (Fastify 后端)
│   │   ├── package.json
│   │   ├── src/
│   │   └── prisma/
│   └── frontend/   (React 前端)
│       ├── package.json
│       └── src/
```

**优势**:

- ✅ 独立的依赖管理
- ✅ 独立的 TypeScript 配置
- ✅ 独立的构建流程
- ✅ 更好的代码隔离

---

## 十五、主要优势总结

| 方面     | 旧架构         | 新架构                |
| -------- | -------------- | --------------------- |
| 框架     | Koa.js         | Fastify 5.x           |
| 数据库   | SQLite3 + Knex | SQLite + Prisma       |
| 类型安全 | 部分           | 完全                  |
| API 文档 | 无             | Swagger/OpenAPI       |
| 认证     | 密码 + JWT     | 密码 + WebAuthn + JWT |
| 监控功能 | 无             | ✅ 完整的探针系统     |
| 通知系统 | 无             | ✅ 多渠道通知         |
| 日志     | koa-logger     | Pino                  |
| 测试框架 | 无             | Vitest                |
| Worker   | 无             | ✅ 多进程支持         |
| 项目结构 | Monolithic     | pnpm Monorepo         |
| 迁移管理 | 手动           | ✅ Prisma Migrate     |
| 错误处理 | 临时           | 类型安全              |
| 环保配置 | 硬编码         | 集中式管理            |

---

## 十六、迁移要点

如果需要从旧架构迁移数据或代码，需要关注:

1. **数据库迁移**
   - 旧: 直接 SQL 脚本
   - 新: Prisma migrations

2. **API 响应格式**
   - 旧: 不统一
   - 新: 统一 JSON 格式

3. **认证流程**
   - 旧: 只有密码
   - 新: 支持 WebAuthn

4. **路由定义**
   - 旧: Koa Router
   - 新: Fastify + TypeBox

5. **错误处理**
   - 旧: 返回错误对象
   - 新: 抛出错误类

6. **环境变量**
   - 旧: 硬编码
   - 新: dotenv-flow + 集中配置

---

## 结论

这次升级是一次**架构现代化**，不仅改进了技术栈（Fastify、Prisma、WebAuthn），还扩展了功能（监控、通知、代码执行），并为未来的扩展打下了更坚实的基础。新架构更易于测试、维护和扩展。
