# cube-probe

cube-probe 是基于 nodejs 开发的全栈项目，致力于打造轻量级的 web 探针服务。包含如下技术栈：

前端：

- 基础框架：react / vite / typescript
- 组件库：antdV5
- 状态管理：jotai
- 网络请求：axios

后端：

- 基础框架：fastify
- 数据库：prisma / sqlite
- 文档：swagger

## cube-probe docker 容器使用

- `FRONTEND_BASE_URL` 参数用于指定应用部署到的路径，例如想要部署到 `https://your-domain/my-sso/`，那么该参数就需要配置为 `/my-sso/`。
- `BACKEND_JWT_SECRET` 参数用于指定应用的 jwt 密钥，不配置的话，每次重启应用都会生成一个新的密钥。

```
docker run -d \
  --restart=always \
  -p 9736:3499 \
  -v cube-probe-storage:/app/packages/backend/storage \
  -e FRONTEND_BASE_URL=/cube-probe/ \
  -e BACKEND_JWT_SECRET=V1StGXR8_Z5jdHi6B-myT \
  hopgoldy/cube-probe:0.1.1
```

## 初始化安装

1、安装依赖：

```sh
pnpm install
```

2、初始化后端开发数据库：

```sh
pnpm init:dev
```

## 启动项目

启动后端服务：

```sh
pnpm start:backend
```

启动前端服务：

```sh
pnpm start:frontend
```

然后访问前端服务的地址即可。

## 本地配置

如果需要自定义本地环境变量配置的话，可以进入对应的项目仓库，例如 `packages/frontend` 或者 `packages/backend`，将 `.env` 文件复制一份 `.env.local`，并填写其中参数。

`.env.local` 的配置会覆盖默认的 `.env`。

## 本地 docker 构建

镜像构建：

```sh
# 在根目录下构建即可
docker build -t cube-probe:local .
```

容器启动：

```sh
docker run -p 3001:3499 cube-probe:local
```

## 相关文档

- [团队合作时如何更新数据架构](https://www.prisma.io/docs/guides/implementing-schema-changes)
- [在线 webhook 测试工具](https://webhook.site/)
