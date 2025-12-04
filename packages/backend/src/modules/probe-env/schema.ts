import { Type } from "typebox";

// 列表项
export const SchemaProbeEnvItem = Type.Object({
  id: Type.String(),
  key: Type.String(),
  value: Type.String(), // 敏感变量显示为 ******
  isSecret: Type.Boolean(),
  desc: Type.Union([Type.String(), Type.Null()]),
  createdAt: Type.String(),
  updatedAt: Type.String(),
});

export type SchemaProbeEnvItemType = Type.Static<typeof SchemaProbeEnvItem>;

// 列表响应
export const SchemaProbeEnvListResponse = Type.Object({
  list: Type.Array(SchemaProbeEnvItem),
});

// 创建请求
export const SchemaProbeEnvCreate = Type.Object({
  key: Type.String({ minLength: 1, maxLength: 100 }),
  value: Type.String({ maxLength: 10000 }),
  isSecret: Type.Optional(Type.Boolean()),
  desc: Type.Optional(Type.String({ maxLength: 500 })),
});

export type SchemaProbeEnvCreateType = Type.Static<typeof SchemaProbeEnvCreate>;

// 更新请求
export const SchemaProbeEnvUpdate = Type.Object({
  id: Type.String(),
  key: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
  value: Type.Optional(Type.String({ maxLength: 10000 })),
  isSecret: Type.Optional(Type.Boolean()),
  desc: Type.Optional(
    Type.Union([Type.String({ maxLength: 500 }), Type.Null()]),
  ),
});

export type SchemaProbeEnvUpdateType = Type.Static<typeof SchemaProbeEnvUpdate>;

// 删除请求
export const SchemaProbeEnvDelete = Type.Object({
  id: Type.String(),
});

export type SchemaProbeEnvDeleteType = Type.Static<typeof SchemaProbeEnvDelete>;
