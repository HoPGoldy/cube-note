import { Type, Static } from "typebox";
import type { NotificationChannel, NotificationLog } from "@db/client";

// ==================== Channel Schemas ====================

export const SchemaChannelCreate = Type.Object({
  name: Type.String({
    description: "渠道名称",
    minLength: 1,
    maxLength: 100,
  }),
  webhookUrl: Type.String({
    description: "Webhook 地址",
    minLength: 1,
  }),
  headers: Type.Optional(Type.Any({ description: "自定义请求头 JSON" })),
  bodyTemplate: Type.String({
    description: "请求体模板",
    minLength: 1,
  }),
  enabled: Type.Optional(Type.Boolean({ description: "是否启用" })),
});

export type SchemaChannelCreateType = Static<typeof SchemaChannelCreate>;

export const SchemaChannelUpdate = Type.Object({
  id: Type.String({ description: "渠道 ID" }),
  name: Type.Optional(
    Type.String({
      description: "渠道名称",
      minLength: 1,
      maxLength: 100,
    }),
  ),
  webhookUrl: Type.Optional(
    Type.String({
      description: "Webhook 地址",
      minLength: 1,
    }),
  ),
  headers: Type.Optional(Type.Any({ description: "自定义请求头 JSON" })),
  bodyTemplate: Type.Optional(
    Type.String({
      description: "请求体模板",
      minLength: 1,
    }),
  ),
  enabled: Type.Optional(Type.Boolean({ description: "是否启用" })),
});

export type SchemaChannelUpdateType = Static<typeof SchemaChannelUpdate>;

export const SchemaChannelDelete = Type.Object({
  id: Type.String({ description: "渠道 ID" }),
});

export type SchemaChannelDeleteType = Static<typeof SchemaChannelDelete>;

export const SchemaChannelDetail = Type.Object({
  id: Type.String(),
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
  name: Type.String(),
  webhookUrl: Type.String(),
  headers: Type.Union([Type.Any(), Type.Null()]),
  bodyTemplate: Type.String(),
  enabled: Type.Boolean(),
});

export type SchemaChannelDetailType = Static<typeof SchemaChannelDetail>;

export const SchemaChannelTest = Type.Object({
  id: Type.String({ description: "渠道 ID" }),
});

export type SchemaChannelTestType = Static<typeof SchemaChannelTest>;

// ==================== Log Schemas ====================

export const SchemaLogList = Type.Object({
  hostId: Type.Optional(Type.String({ description: "Host ID" })),
  endpointId: Type.Optional(Type.String({ description: "端点 ID" })),
  channelId: Type.Optional(Type.String({ description: "渠道 ID" })),
  limit: Type.Optional(
    Type.Integer({
      description: "返回数量限制",
      minimum: 1,
      maximum: 1000,
      default: 100,
    }),
  ),
});

export type SchemaLogListType = Static<typeof SchemaLogList>;

export const SchemaLogDetail = Type.Object({
  id: Type.String(),
  createdAt: Type.String({ format: "date-time" }),
  hostId: Type.String(),
  endpointId: Type.String(),
  channelId: Type.String(),
  eventType: Type.String(),
  title: Type.String(),
  content: Type.String(),
  success: Type.Boolean(),
  errorMsg: Type.Union([Type.String(), Type.Null()]),
});

export type SchemaLogDetailType = Static<typeof SchemaLogDetail>;

// ==================== VO Conversion Functions ====================

export const createChannelDetailVo = (
  data: NotificationChannel,
): SchemaChannelDetailType => {
  return {
    id: data.id,
    createdAt: data.createdAt.toISOString(),
    updatedAt: data.updatedAt.toISOString(),
    name: data.name,
    webhookUrl: data.webhookUrl,
    headers: data.headers,
    bodyTemplate: data.bodyTemplate,
    enabled: data.enabled,
  };
};

export const createLogDetailVo = (
  data: NotificationLog,
): SchemaLogDetailType => {
  return {
    id: data.id,
    createdAt: data.createdAt.toISOString(),
    hostId: data.hostId,
    endpointId: data.endpointId,
    channelId: data.channelId,
    eventType: data.eventType,
    title: data.title,
    content: data.content,
    success: data.success,
    errorMsg: data.errorMsg,
  };
};
