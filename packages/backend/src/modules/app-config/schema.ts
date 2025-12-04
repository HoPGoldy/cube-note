import { Type } from "typebox";

export const SchemaAppConfig = Type.Object({
  WEB_AUTHN_RP_NAME: Type.Optional(Type.String()),
  WEB_AUTHN_RP_ID: Type.Optional(Type.String()),
  WEB_AUTHN_ORIGIN: Type.Optional(Type.String()),
  // 是否启用注册模式
  REGISTRATION_MODE_ENABLED: Type.Optional(
    Type.Union([Type.Literal("true"), Type.Literal("false")]),
  ),
});

export type SchemaAppConfigType = Type.Static<typeof SchemaAppConfig>;
