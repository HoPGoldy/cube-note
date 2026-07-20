import { Type } from "typebox";

// 访问令牌 scope 需要前后端共享，避免后端校验、前端展示、表单选项各自维护一份。
export const ACCESS_TOKEN_SCOPES = [
  "article:read",
  "article:write",
  "tag:read",
  "tag:write",
  "attachment:read",
  "attachment:write",
] as const;

export type AccessTokenScope = (typeof ACCESS_TOKEN_SCOPES)[number];

export const DEFAULT_ACCESS_TOKEN_SCOPES: AccessTokenScope[] = [
  "article:read",
  "article:write",
  "tag:read",
  "tag:write",
  "attachment:read",
  "attachment:write",
];

export const ACCESS_TOKEN_SCOPE_LABELS: Record<AccessTokenScope, string> = {
  "article:read": "读取笔记",
  "article:write": "写入笔记",
  "tag:read": "读取标签",
  "tag:write": "写入标签",
  "attachment:read": "读取附件",
  "attachment:write": "写入附件",
};

// 这里故意保持为 string[] schema：
// TypeBox 的字面量联合数组在当前 Fastify 类型推断下会退化成 never[]，
// 导致 controller 的 response 类型全面冲突。运行时合法值仍由 service.validateScopes
// 和前端 shared-types 共同约束，对这个单人项目来说维护成本更低、行为也更稳定。
export const SchemaScopes = Type.Array(Type.String(), {
  description: "权限范围列表",
});

export const SchemaAccessTokenCreate = Type.Object({
  name: Type.String({ description: "访问令牌备注名称" }),
  scopes: Type.Optional(SchemaScopes),
});
export interface SchemaAccessTokenCreateType {
  name: string;
  scopes?: AccessTokenScope[];
}

export const SchemaAccessTokenCreateResponse = Type.Object({
  id: Type.String(),
  name: Type.String(),
  tokenPrefix: Type.String({ description: "明文前8位，仅用于展示" }),
  token: Type.String({ description: "完整明文 token，仅返回一次" }),
  scopes: SchemaScopes,
  createdAt: Type.String(),
});
export interface SchemaAccessTokenCreateResponseType {
  id: string;
  name: string;
  tokenPrefix: string;
  token: string;
  scopes: AccessTokenScope[];
  createdAt: string;
}

export const SchemaAccessTokenListItem = Type.Object({
  id: Type.String(),
  name: Type.String(),
  tokenPrefix: Type.String(),
  scopes: SchemaScopes,
  createdAt: Type.String(),
  lastUsedAt: Type.Union([Type.String(), Type.Null()]),
});
export interface SchemaAccessTokenListItemType {
  id: string;
  name: string;
  tokenPrefix: string;
  scopes: AccessTokenScope[];
  createdAt: string;
  lastUsedAt: string | null;
}

export const SchemaAccessTokenList = Type.Array(SchemaAccessTokenListItem);
export type SchemaAccessTokenListType = SchemaAccessTokenListItemType[];
