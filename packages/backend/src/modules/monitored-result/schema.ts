import { ProbeResult } from "@db/client";
import { Type } from "typebox";

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

// Helper function to create VO (Value Object)
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
