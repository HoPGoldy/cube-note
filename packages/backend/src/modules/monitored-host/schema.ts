import { EndPoint, ProbeResult, MonitoredHost } from "@db/client";
import { Type } from "typebox";

// Service Schemas
export const SchemaServiceCreate = Type.Object({
  name: Type.String({
    description: "服务名称",
    minLength: 1,
    maxLength: 100,
  }),
  desc: Type.Optional(Type.String({ description: "描述" })),
  url: Type.Optional(Type.String({ description: "服务基础URL" })),
  headers: Type.Optional(Type.Any({ description: "自定义请求头JSON" })),
  enabled: Type.Optional(Type.Boolean({ description: "是否启用" })),
  // 通知配置
  notifyEnabled: Type.Optional(
    Type.Boolean({ description: "是否启用通知", default: false }),
  ),
  notifyFailureCount: Type.Optional(
    Type.Integer({
      description: "连续失败N次触发通知",
      minimum: 1,
      maximum: 100,
      default: 3,
    }),
  ),
  notifyCooldownMin: Type.Optional(
    Type.Integer({
      description: "冷却时间(分钟)",
      minimum: 0,
      maximum: 1440,
      default: 30,
    }),
  ),
  notifyChannelIds: Type.Optional(
    Type.Array(Type.String(), { description: "通知渠道ID数组" }),
  ),
});

export type SchemaServiceCreateType = Type.Static<typeof SchemaServiceCreate>;

export const SchemaServiceUpdate = Type.Intersect([
  Type.Partial(SchemaServiceCreate),
  Type.Object({
    id: Type.String({ description: "服务ID" }),
  }),
]);

export type SchemaServiceUpdateType = Type.Static<typeof SchemaServiceUpdate>;

export const SchemaServiceDetail = Type.Object({
  id: Type.String(),
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
  name: Type.String(),
  desc: Type.Union([Type.String(), Type.Null()]),
  url: Type.Union([Type.String(), Type.Null()]),
  headers: Type.Union([Type.Any(), Type.Null()]),
  enabled: Type.Boolean(),
  // 通知配置
  notifyEnabled: Type.Boolean(),
  notifyFailureCount: Type.Integer(),
  notifyCooldownMin: Type.Integer(),
  notifyChannelIds: Type.Array(Type.String()),
});

export type SchemaServiceDetailType = Type.Static<typeof SchemaServiceDetail>;

// EndPoint Schemas
export const SchemaEndPointCreate = Type.Object({
  hostId: Type.String({ description: "关联Host ID" }),
  name: Type.String({
    description: "接口名称",
    minLength: 1,
    maxLength: 100,
  }),
  desc: Type.Optional(Type.String({ description: "描述" })),
  url: Type.Optional(Type.String({ description: "接口URL" })),
  headers: Type.Optional(Type.Any({ description: "自定义请求头JSON" })),
  intervalTime: Type.Optional(
    Type.Integer({ description: "探测间隔时间(秒)", minimum: 1 }),
  ),
  enabled: Type.Optional(Type.Boolean({ description: "是否启用" })),
  timeout: Type.Optional(
    Type.Integer({
      description: "请求超时时间(毫秒)",
      minimum: 1,
      maximum: 300000,
    }), // Max 5 minutes
  ),
});

export type SchemaEndPointCreateType = Type.Static<typeof SchemaEndPointCreate>;

export const SchemaEndPointUpdate = Type.Intersect([
  Type.Partial(SchemaEndPointCreate),
  Type.Object({
    id: Type.String({ description: "接口ID" }),
  }),
]);

export type SchemaEndPointUpdateType = Type.Static<typeof SchemaEndPointUpdate>;

export const SchemaEndPointDetail = Type.Object({
  id: Type.String(),
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
  hostId: Type.String(),
  name: Type.String(),
  desc: Type.Union([Type.String(), Type.Null()]),
  url: Type.Union([Type.String(), Type.Null()]),
  headers: Type.Union([Type.Any(), Type.Null()]),
  intervalTime: Type.Union([Type.Integer(), Type.Null()]),
  enabled: Type.Boolean(),
  timeout: Type.Union([Type.Integer(), Type.Null()]),
});

export type SchemaEndPointDetailType = Type.Static<typeof SchemaEndPointDetail>;

// ProbeResult Schemas
export const SchemaProbeResultCreate = Type.Object({
  endPointId: Type.String({ description: "关联接口ID" }),
  status: Type.Optional(
    Type.Integer({ description: "HTTP状态码", minimum: 100, maximum: 599 }),
  ),
  responseTime: Type.Optional(
    Type.Integer({
      description: "响应时间(毫秒)",
      minimum: 0,
      maximum: 300000,
    }),
  ),
  success: Type.Boolean({ description: "是否成功" }),
  message: Type.Optional(Type.String({ description: "详细信息或错误消息" })),
});

export type SchemaProbeResultCreateType = Type.Static<
  typeof SchemaProbeResultCreate
>;

export const SchemaProbeResultDetail = Type.Object({
  id: Type.Integer(),
  createdAt: Type.String({ format: "date-time" }),
  endPointId: Type.String(),
  status: Type.Union([Type.Integer(), Type.Null()]),
  responseTime: Type.Union([Type.Integer(), Type.Null()]),
  success: Type.Boolean(),
  message: Type.Union([Type.String(), Type.Null()]),
});

export type SchemaProbeResultDetailType = Type.Static<
  typeof SchemaProbeResultDetail
>;

// Helper functions to create VO (Value Objects)
export const createServiceDetailVo = (
  data: MonitoredHost,
): SchemaServiceDetailType => {
  return {
    id: data.id,
    createdAt: data.createdAt.toISOString(),
    updatedAt: data.updatedAt.toISOString(),
    name: data.name,
    desc: data.desc,
    url: data.url,
    headers: data.headers,
    enabled: data.enabled,
    notifyEnabled: data.notifyEnabled,
    notifyFailureCount: data.notifyFailureCount,
    notifyCooldownMin: data.notifyCooldownMin,
    notifyChannelIds: data.notifyChannelIds as string[],
  };
};

export const createEndPointDetailVo = (
  data: EndPoint,
): SchemaEndPointDetailType => {
  return {
    id: data.id,
    createdAt: data.createdAt.toISOString(),
    updatedAt: data.updatedAt.toISOString(),
    hostId: data.hostId,
    name: data.name,
    desc: data.desc,
    url: data.url,
    headers: data.headers,
    intervalTime: data.intervalTime,
    enabled: data.enabled,
    timeout: data.timeout,
  };
};

export const createProbeResultDetailVo = (
  data: ProbeResult,
): SchemaProbeResultDetailType => {
  return {
    id: data.id,
    createdAt: data.createdAt.toISOString(),
    endPointId: data.endPointId,
    status: data.status,
    responseTime: data.responseTime,
    success: data.success,
    message: data.message,
  };
};
