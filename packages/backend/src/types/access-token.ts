import { Type } from "typebox";

const SchemaScopes = Type.Array(Type.String(), {
  description: "权限范围列表",
});

export const SchemaAccessTokenCreate = Type.Object({
  name: Type.String({ description: "访问令牌备注名称" }),
  scopes: Type.Optional(SchemaScopes),
});
export type SchemaAccessTokenCreateType = Type.Static<
  typeof SchemaAccessTokenCreate
>;

export const SchemaAccessTokenCreateResponse = Type.Object({
  id: Type.String(),
  name: Type.String(),
  tokenPrefix: Type.String({ description: "明文前8位，仅用于展示" }),
  token: Type.String({ description: "完整明文 token，仅返回一次" }),
  scopes: SchemaScopes,
  createdAt: Type.String(),
});
export type SchemaAccessTokenCreateResponseType = Type.Static<
  typeof SchemaAccessTokenCreateResponse
>;

export const SchemaAccessTokenUpdate = Type.Object({
  id: Type.String(),
  name: Type.String({ description: "访问令牌备注名称" }),
  scopes: SchemaScopes,
});
export type SchemaAccessTokenUpdateType = Type.Static<
  typeof SchemaAccessTokenUpdate
>;

export const SchemaAccessTokenListItem = Type.Object({
  id: Type.String(),
  name: Type.String(),
  tokenPrefix: Type.String(),
  scopes: SchemaScopes,
  createdAt: Type.String(),
  lastUsedAt: Type.Union([Type.String(), Type.Null()]),
});
export type SchemaAccessTokenListItemType = Type.Static<
  typeof SchemaAccessTokenListItem
>;

export const SchemaAccessTokenList = Type.Array(SchemaAccessTokenListItem);
export type SchemaAccessTokenListType = Type.Static<
  typeof SchemaAccessTokenList
>;
