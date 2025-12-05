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

  // 获取文章内容（别名）
  server.get<{ Params: { id: string } }>(
    "/article/:id/getContent",
    { schema: { description: "获取文章详情" } },
    async (request) => {
      return await articleService.getArticleDetail(request.params.id);
    },
  );

  // 获取文章内容 - POST 版本
  server.post<{ Body: { id: string } }>(
    "/article/getContent",
    {
      schema: {
        description: "获取文章详情",
        body: Type.Object({
          id: Type.String(),
        }),
      },
    },
    async (request) => {
      return await articleService.getArticleDetail(request.body.id);
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

  // POST 版本的路由 - 支持前端的 POST 请求模式

  // 获取文章下属链接信息
  server.post<{ Body: { id: string } }>(
    "/article/getLink",
    {
      schema: {
        description: "获取文章下属链接",
        body: Type.Object({
          id: Type.String(),
        }),
      },
    },
    async (request) => {
      const { id } = request.body;
      const parent = await articleService.getArticleDetail(id);
      return {
        parentArticleIds: parent.parentPath?.split("#").filter(Boolean),
        childrenArticles: [],
      };
    },
  );

  // 获取文章详细的子文章列表
  server.post<{ Body: { id: string } }>(
    "/article/getChildrenDetailList",
    {
      schema: {
        description: "获取文章的详细子文章列表",
        body: Type.Object({
          id: Type.String(),
        }),
      },
    },
    async (request) => {
      const { id } = request.body;
      // 这里需要实现获取子文章的详细信息
      return [];
    },
  );

  // 获取文章相关文章
  server.post<{ Body: { id: string } }>(
    "/article/getRelated",
    {
      schema: {
        description: "获取文章的相关文章",
        body: Type.Object({
          id: Type.String(),
        }),
      },
    },
    async (request) => {
      const { id } = request.body;
      return await articleService.getArticleRelations(id);
    },
  );

  // 获取文章树
  server.post<{ Body: { id?: string } }>(
    "/article/getTree",
    {
      schema: {
        description: "获取文章树形结构",
        body: Type.Object({
          id: Type.Optional(Type.String()),
        }),
      },
    },
    async (request) => {
      return await articleService.getArticleTree();
    },
  );

  // 获取收藏列表
  server.post<{ Body: Record<string, never> }>(
    "/article/getFavorite",
    {
      schema: {
        description: "获取收藏的文章列表",
        body: Type.Object({}),
      },
    },
    async (request) => {
      // 需要实现获取用户收藏列表的逻辑
      return [];
    },
  );

  // 新增文章
  server.post<{ Body: { title: string; content?: string; parentId?: string } }>(
    "/article/add",
    {
      schema: {
        description: "新增文章",
        body: Type.Object({
          title: Type.String(),
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

  // 更新文章
  server.post<{
    Body: {
      id: string;
      title?: string;
      content?: string;
      tagIds?: string;
      favorite?: boolean;
      parentArticleId?: string;
      color?: string;
      listSubarticle?: boolean;
    };
  }>(
    "/article/update",
    {
      schema: {
        description: "更新文章",
        body: Type.Object({
          id: Type.String(),
          title: Type.Optional(Type.String()),
          content: Type.Optional(Type.String()),
          tagIds: Type.Optional(Type.String()),
          favorite: Type.Optional(Type.Boolean()),
          parentArticleId: Type.Optional(Type.String()),
          color: Type.Optional(Type.String()),
          listSubarticle: Type.Optional(Type.Boolean()),
        }),
      },
    },
    async (request) => {
      const { id, ...updateData } = request.body;
      return await articleService.updateArticle(id, updateData);
    },
  );

  // 删除文章
  server.post<{ Body: { id: string; force?: boolean } }>(
    "/article/remove",
    {
      schema: {
        description: "删除文章",
        body: Type.Object({
          id: Type.String(),
          force: Type.Optional(Type.Boolean()),
        }),
      },
    },
    async (request) => {
      await articleService.deleteArticle(request.body.id, request.body.force);
      return { success: true };
    },
  );

  // 搜索/获取文章列表
  server.post<{
    Body: {
      keyword?: string;
      page?: number;
      pageSize?: number;
      tagIds?: number[];
    };
  }>(
    "/article/getList",
    {
      schema: {
        description: "获取文章列表",
        body: Type.Object({
          keyword: Type.Optional(Type.String()),
          page: Type.Optional(Type.Number()),
          pageSize: Type.Optional(Type.Number()),
          tagIds: Type.Optional(Type.Array(Type.Number())),
        }),
      },
    },
    async (request) => {
      const { keyword = "", page = 1, pageSize = 20 } = request.body;
      return await articleService.searchArticles(keyword, page, pageSize);
    },
  );

  // 设置收藏
  server.post<{ Body: { id: string; favorite: boolean } }>(
    "/article/setFavorite",
    {
      schema: {
        description: "设置文章收藏状态",
        body: Type.Object({
          id: Type.String(),
          favorite: Type.Boolean(),
        }),
      },
    },
    async (request) => {
      return await articleService.setFavorite(
        request.body.id,
        request.body.favorite,
      );
    },
  );

  // 设置文章关联
  server.post<{
    Body: { fromArticleId: string; toArticleId: string; link: boolean };
  }>(
    "/article/setRelated",
    {
      schema: {
        description: "设置文章关联",
        body: Type.Object({
          fromArticleId: Type.String(),
          toArticleId: Type.String(),
          link: Type.Boolean(),
        }),
      },
    },
    async (request) => {
      const { fromArticleId, toArticleId, link } = request.body;
      if (link) {
        return await articleService.setArticleRelation(
          fromArticleId,
          toArticleId,
        );
      } else {
        await articleService.removeArticleRelation(fromArticleId, toArticleId);
        return { success: true };
      }
    },
  );
}
