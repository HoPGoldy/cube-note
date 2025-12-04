import type { FastifyInstance } from "fastify";
import { Type } from "typebox";
import { ArticleService } from "./service";

interface RegisterOptions {
  server: FastifyInstance;
  articleService: ArticleService;
}

export async function registerArticleController(options: RegisterOptions) {
  const { server, articleService } = options;

  // 创建文章
  server.post<{ Body: { title: string; content?: string; parentId?: string } }>(
    "/article/create",
    {
      schema: {
        description: "创建文章",
        body: Type.Object({
          title: Type.String({ minLength: 1 }),
          content: Type.Optional(Type.String()),
          parentId: Type.Optional(Type.String()),
        }),
      },
    },
    async (request) => {
      return await articleService.createArticle(
        request.body.title,
        request.body.content || "",
        request.body.parentId,
      );
    },
  );

  // 获取文章详情
  server.get<{ Params: { id: string } }>(
    "/article/:id",
    { schema: { description: "获取文章详情" } },
    async (request) => {
      return await articleService.getArticleDetail(request.params.id);
    },
  );

  // 更新文章
  server.put<{
    Params: { id: string };
    Body: {
      title?: string;
      content?: string;
      tagIds?: string;
      favorite?: boolean;
    };
  }>(
    "/article/:id",
    {
      schema: {
        description: "更新文章",
        body: Type.Object({
          title: Type.Optional(Type.String()),
          content: Type.Optional(Type.String()),
          tagIds: Type.Optional(Type.String()),
          favorite: Type.Optional(Type.Boolean()),
        }),
      },
    },
    async (request) => {
      return await articleService.updateArticle(
        request.params.id,
        request.body,
      );
    },
  );

  // 删除文章
  server.delete<{ Params: { id: string }; Querystring: { force?: string } }>(
    "/article/:id",
    { schema: { description: "删除文章" } },
    async (request) => {
      const force = request.query.force === "true";
      await articleService.deleteArticle(request.params.id, force);
      return { success: true };
    },
  );

  // 搜索文章
  server.get<{
    Querystring: { keyword: string; page?: string; pageSize?: string };
  }>(
    "/article/search",
    {
      schema: {
        description: "搜索文章",
        querystring: Type.Object({
          keyword: Type.String(),
          page: Type.Optional(Type.String()),
          pageSize: Type.Optional(Type.String()),
        }),
      },
    },
    async (request) => {
      const page = request.query.page ? parseInt(request.query.page) : 1;
      const pageSize = request.query.pageSize
        ? parseInt(request.query.pageSize)
        : 20;
      return await articleService.searchArticles(
        request.query.keyword,
        page,
        pageSize,
      );
    },
  );

  // 获取文章树
  server.get(
    "/article/tree",
    { schema: { description: "获取文章树形结构" } },
    async (request) => {
      return await articleService.getArticleTree();
    },
  );

  // 设置收藏
  server.post<{ Params: { id: string }; Body: { favorite: boolean } }>(
    "/article/:id/favorite",
    {
      schema: {
        description: "设置文章收藏状态",
        body: Type.Object({
          favorite: Type.Boolean(),
        }),
      },
    },
    async (request) => {
      return await articleService.setFavorite(
        request.params.id,
        request.body.favorite,
      );
    },
  );

  // 设置文章关系
  server.post<{ Body: { fromId: string; toId: string } }>(
    "/article/relation/set",
    {
      schema: {
        description: "设置两篇文章的关系",
        body: Type.Object({
          fromId: Type.String(),
          toId: Type.String(),
        }),
      },
    },
    async (request) => {
      return await articleService.setArticleRelation(
        request.body.fromId,
        request.body.toId,
      );
    },
  );

  // 移除文章关系
  server.delete<{ Querystring: { fromId: string; toId: string } }>(
    "/article/relation",
    { schema: { description: "移除两篇文章的关系" } },
    async (request) => {
      await articleService.removeArticleRelation(
        request.query.fromId,
        request.query.toId,
      );
      return { success: true };
    },
  );

  // 获取文章的关系
  server.get<{ Params: { id: string } }>(
    "/article/:id/relations",
    { schema: { description: "获取文章的所有关系" } },
    async (request) => {
      return await articleService.getArticleRelations(request.params.id);
    },
  );
}
