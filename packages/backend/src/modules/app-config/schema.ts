import { Type } from "typebox";

export const SchemaAppConfig = Type.Object({
  ROOT_ARTICLE_ID: Type.String(),
});

export type SchemaAppConfigType = Type.Static<typeof SchemaAppConfig>;
