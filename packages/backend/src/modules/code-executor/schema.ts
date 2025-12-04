import { Type } from "typebox";

/**
 * 代码执行请求 Schema
 */
export const SchemaCodeExecuteRequest = Type.Object({
  code: Type.String({ description: "要执行的 JavaScript 代码" }),
  timeout: Type.Optional(
    Type.Number({
      description: "超时时间（毫秒），默认 5000ms",
      minimum: 100,
      maximum: 30000,
    }),
  ),
  context: Type.Optional(
    Type.Record(Type.String(), Type.Any(), {
      description: "传递给代码的上下文变量",
    }),
  ),
  hostId: Type.Optional(
    Type.String({
      description: "Host ID，用于注入 host 配置到代码执行上下文",
    }),
  ),
});

export type SchemaCodeExecuteRequestType = Type.Static<
  typeof SchemaCodeExecuteRequest
>;

/**
 * 代码执行响应 Schema
 */
export const SchemaCodeExecuteResponse = Type.Object({
  success: Type.Boolean({ description: "执行是否成功" }),
  result: Type.Optional(Type.Any({ description: "执行结果" })),
  error: Type.Optional(Type.String({ description: "错误信息" })),
  executionTime: Type.Number({ description: "执行时间（毫秒）" }),
  logs: Type.Array(Type.String(), { description: "console.log 输出" }),
});

export type SchemaCodeExecuteResponseType = Type.Static<
  typeof SchemaCodeExecuteResponse
>;
