import { Type } from "typebox";
import { createCommonListSchema } from "./schema";

export const SchemaArticleItem = Type.Object({
  id: Type.String(),
  title: Type.String(),
  content: Type.String(),
  parentPath: Type.Union([Type.String(), Type.Null()]),
  tagIds: Type.Union([Type.String(), Type.Null()]),
  favorite: Type.Boolean(),
  color: Type.Union([Type.String(), Type.Null()]),
  listSubarticle: Type.Boolean(),
  createdAt: Type.String(),
  updatedAt: Type.String(),
});
export type SchemaArticleItemType = Type.Static<typeof SchemaArticleItem>;

export const SchemaArticleGetContentBody = Type.Object({
  id: Type.String(),
});
export type SchemaArticleGetContentBodyType = Type.Static<
  typeof SchemaArticleGetContentBody
>;

export const SchemaArticleGetLinkBody = Type.Object({
  id: Type.String(),
});
export type SchemaArticleGetLinkBodyType = Type.Static<
  typeof SchemaArticleGetLinkBody
>;

export const SchemaArticleMenuItem = Type.Object({
  id: Type.String(),
  title: Type.String(),
  parentPath: Type.Union([Type.String(), Type.Null()]),
  color: Type.Union([Type.String(), Type.Null()]),
});
export type SchemaArticleMenuType = Type.Static<typeof SchemaArticleMenuItem>;

export const SchemaArticleGetLinkResponse = Type.Object({
  parentArticleIds: Type.Union([Type.Array(Type.String()), Type.Null()]),
  parentArticleTitle: Type.Union([Type.String(), Type.Null()]),
  childrenArticles: Type.Array(SchemaArticleMenuItem),
});
export type SchemaArticleGetLinkResponseType = Type.Static<
  typeof SchemaArticleGetLinkResponse
>;

export const SchemaArticleGetTreeBody = Type.Object({
  id: Type.Optional(Type.String()),
});
export type SchemaArticleGetTreeBodyType = Type.Static<
  typeof SchemaArticleGetTreeBody
>;

// typebox 不支持创建自嵌套的类型
// 所以这里没有 schema，只有 type
export type SchemaArticleTreeNodeType = {
  children: SchemaArticleTreeNodeType[];
} & SchemaArticleMenuType;

export const SchemaArticleGetFavoriteBody = Type.Object({});
export type SchemaArticleGetFavoriteBodyType = Type.Static<
  typeof SchemaArticleGetFavoriteBody
>;

export const SchemaArticleFavoriteList = Type.Array(SchemaArticleMenuItem);
export type SchemaArticleFavoriteListType = Type.Static<
  typeof SchemaArticleFavoriteList
>;

export const SchemaArticleAddBody = Type.Object({
  title: Type.String(),
  content: Type.Optional(Type.String()),
  parentId: Type.Optional(Type.String()),
});
export type SchemaArticleAddBodyType = Type.Static<typeof SchemaArticleAddBody>;

export const SchemaArticleAddResponse = Type.Object({
  id: Type.String(),
});
export type SchemaArticleAddResponseType = Type.Static<
  typeof SchemaArticleAddResponse
>;

export const SchemaArticleUpdateBody = Type.Object({
  id: Type.String(),
  title: Type.Optional(Type.String()),
  content: Type.Optional(Type.String()),
  tagIds: Type.Optional(Type.String()),
  favorite: Type.Optional(Type.Boolean()),
  parentPath: Type.Optional(Type.String()),
  color: Type.Optional(Type.String()),
  listSubarticle: Type.Optional(Type.Boolean()),
});
export type SchemaArticleUpdateBodyType = Type.Static<
  typeof SchemaArticleUpdateBody
>;

export const SchemaArticleEditOperation = Type.Object({
  oldText: Type.String({
    description: "原文中要被替换的文本，必须在原文中唯一匹配",
  }),
  newText: Type.String({ description: "替换后的新文本" }),
});
export type SchemaArticleEditOperationType = Type.Static<
  typeof SchemaArticleEditOperation
>;

export const SchemaArticleEditBody = Type.Object({
  id: Type.String({ description: "文章 ID" }),
  edits: Type.Array(SchemaArticleEditOperation, {
    minItems: 1,
    description:
      "一组精确文本替换，所有 edit 针对原始内容匹配，任一失败则整体不生效",
  }),
  baseUpdatedAt: Type.Optional(
    Type.String({
      description:
        "乐观锁：填入 getContent 返回的 updatedAt，若文章已被修改则拒绝本次编辑",
    }),
  ),
});
export type SchemaArticleEditBodyType = Type.Static<
  typeof SchemaArticleEditBody
>;

export const SchemaArticleEditResponse = Type.Object({
  success: Type.Boolean(),
  applied: Type.Number({ description: "成功应用的 edit 数量" }),
});
export type SchemaArticleEditResponseType = Type.Static<
  typeof SchemaArticleEditResponse
>;

export const SchemaArticleRemoveBody = Type.Object({
  id: Type.String(),
  force: Type.Optional(Type.Boolean()),
});
export type SchemaArticleRemoveBodyType = Type.Static<
  typeof SchemaArticleRemoveBody
>;

export const SchemaArticleSearchBody = Type.Object({
  keyword: Type.Optional(Type.String()),
  page: Type.Optional(Type.Number()),
  pageSize: Type.Optional(Type.Number()),
  colors: Type.Optional(Type.Array(Type.String())),
  tagIds: Type.Optional(Type.Array(Type.String())),
});
export type SchemaArticleSearchBodyType = Type.Static<
  typeof SchemaArticleSearchBody
>;

export const SchemaArticleSearchItem = Type.Object({
  id: Type.String(),
  title: Type.String(),
  tagIds: Type.Array(Type.String()),
  content: Type.String(),
});
export type SchemaArticleSearchItemType = Type.Static<
  typeof SchemaArticleSearchItem
>;

export const SchemaArticleSearchResponse = createCommonListSchema(
  SchemaArticleSearchItem,
);
export type SchemaArticleSearchResponseType = Type.Static<
  typeof SchemaArticleSearchResponse
>;

export const SchemaArticleSetFavoriteBody = Type.Object({
  id: Type.String(),
  favorite: Type.Boolean(),
});
export type SchemaArticleSetFavoriteBodyType = Type.Static<
  typeof SchemaArticleSetFavoriteBody
>;

export const SchemaArticleStatisticResponse = Type.Object({
  articleCount: Type.Number(),
  articleLength: Type.Number(),
});
export type SchemaArticleStatisticResponseType = Type.Static<
  typeof SchemaArticleStatisticResponse
>;
