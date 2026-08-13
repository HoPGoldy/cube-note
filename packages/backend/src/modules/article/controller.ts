import {
  SchemaArticleGetContentBody,
  SchemaArticleGetLinkBody,
  SchemaArticleGetTreeBody,
  SchemaArticleGetFavoriteBody,
  SchemaArticleAddBody,
  SchemaArticleUpdateBody,
  SchemaArticleEditBody,
  SchemaArticleEditResponse,
  SchemaArticleRemoveBody,
  SchemaArticleSearchBody,
  SchemaArticleSetFavoriteBody,
  SchemaArticleItem,
  SchemaArticleGetLinkResponse,
  SchemaArticleFavoriteList,
  SchemaArticleStatisticResponse,
  SchemaArticleSearchResponse,
} from "@/types/article";
import { ArticleService } from "./service";
import { AppInstance } from "@/types";
import { transformDate } from "@/utils/vo";

interface RegisterOptions {
  server: AppInstance;
  articleService: ArticleService;
}

export async function registerArticleController(options: RegisterOptions) {
  const { server, articleService } = options;

  server.post(
    "/article/getContent",
    {
      config: { requiredScopes: ["article:read"] },
      schema: {
        description: "获取文章内容",
        body: SchemaArticleGetContentBody,
        response: {
          200: SchemaArticleItem,
        },
      },
    },
    async (request) => {
      const result = await articleService.getArticleDetail(request.body.id);
      return transformDate(result);
    },
  );

  // 获取文章下属链接信息
  server.post(
    "/article/getLink",
    {
      config: { requiredScopes: ["article:read"] },
      schema: {
        description: "获取文章下属链接",
        body: SchemaArticleGetLinkBody,
        response: {
          200: SchemaArticleGetLinkResponse,
        },
      },
    },
    async (request) => {
      return await articleService.getChildren(request.body.id);
    },
  );

  // 获取文章树
  server.post(
    "/article/getTree",
    {
      config: { requiredScopes: ["article:read"] },
      schema: {
        description: "获取文章树形结构",
        body: SchemaArticleGetTreeBody,
      },
    },
    async () => {
      return articleService.getArticleTree();
    },
  );

  // 获取收藏列表
  server.post(
    "/article/getFavorite",
    {
      config: { requiredScopes: ["article:read"] },
      schema: {
        description: "获取收藏的文章列表",
        body: SchemaArticleGetFavoriteBody,
        response: {
          200: SchemaArticleFavoriteList,
        },
      },
    },
    async () => {
      return await articleService.getFavoriteArticles();
    },
  );

  // 新增文章
  server.post(
    "/article/add",
    {
      config: { requiredScopes: ["article:write"] },
      schema: {
        description: "新增文章",
        body: SchemaArticleAddBody,
      },
    },
    async (request) => {
      const body = request.body;
      const result = await articleService.createArticle(
        body.title,
        body.content || "",
        body.parentId,
      );
      return { id: result.id };
    },
  );

  // 更新文章
  server.post(
    "/article/update",
    {
      config: { requiredScopes: ["article:write"] },
      schema: {
        description: "更新文章",
        body: SchemaArticleUpdateBody,
      },
    },
    async (request) => {
      const { id, ...updateData } = request.body;
      await articleService.updateArticle(id, updateData);
      return { success: true };
    },
  );

  // 局部精确编辑文章（对齐 Agent edit 工具语义）
  server.post(
    "/article/edit",
    {
      schema: {
        description:
          "对文章内容做一组精确文本替换（局部编辑）。规则：1. 所有 edits 针对原始内容匹配；2. 每个 oldText 必须在原文中唯一匹配，未找到或多处匹配都会报错；3. edits 之间不允许重叠；4. 任一 edit 失败则整体不生效；5. 传 baseUpdatedAt（getContent 返回的 updatedAt）可启用乐观锁，文章被其他人修改后会拒绝本次编辑。适合需要先 getContent 再小范围修改的场景，比 update 全量覆盖更安全",
        tags: ["article"],
        body: SchemaArticleEditBody,
        response: {
          200: SchemaArticleEditResponse,
        },
      },
    },
    async (request) => {
      const { id, edits, baseUpdatedAt } = request.body;
      return await articleService.editArticle(id, edits, baseUpdatedAt);
    },
  );

  // 删除文章
  server.post(
    "/article/remove",
    {
      config: { requiredScopes: ["article:write"] },
      schema: {
        description: "删除文章",
        body: SchemaArticleRemoveBody,
      },
    },
    async (request) => {
      const body = request.body;
      await articleService.deleteArticle(body.id, body.force);
      return { success: true };
    },
  );

  // 搜索/获取文章列表
  server.post(
    "/article/search",
    {
      config: { requiredScopes: ["article:read"] },
      schema: {
        description: "获取文章列表",
        body: SchemaArticleSearchBody,
        response: {
          200: SchemaArticleSearchResponse,
        },
      },
    },
    async (request) => {
      const body = request.body;
      const { keyword = "", page = 1, pageSize = 20, colors, tagIds } = body;
      return await articleService.searchArticles(
        keyword,
        page,
        pageSize,
        colors,
        tagIds,
      );
    },
  );

  // 设置收藏
  server.post(
    "/article/setFavorite",
    {
      config: { requiredScopes: ["article:write"] },
      schema: {
        description: "设置文章收藏状态",
        body: SchemaArticleSetFavoriteBody,
      },
    },
    async (request) => {
      const body = request.body;
      return await articleService.setFavorite(body.id, body.favorite);
    },
  );

  server.post(
    "/article/statistic",
    {
      config: { requiredScopes: ["article:read"] },
      schema: {
        description: "统计文章数量",
        response: {
          200: SchemaArticleStatisticResponse,
        },
      },
    },
    async () => {
      return await articleService.statisticArticles();
    },
  );
}
