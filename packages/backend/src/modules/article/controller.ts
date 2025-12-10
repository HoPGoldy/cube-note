import { Type } from "typebox";
import { ArticleService } from "./service";
import { AppInstance } from "@/types";

interface RegisterOptions {
  server: AppInstance;
  articleService: ArticleService;
}

export async function registerArticleController(options: RegisterOptions) {
  const { server, articleService } = options;

  // 获取文章内容（POST）
  server.post(
    "/article/getContent",
    {
      schema: {
        description: "获取文章内容",
        body: Type.Object({
          id: Type.String(),
        }),
      },
    },
    async (request) => {
      const body = request.body;
      return await articleService.getArticleDetail(body.id);
    },
  );

  // 获取文章下属链接信息
  server.post(
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
      const body = request.body as { id: string };
      const { id } = body;
      return await articleService.getChildren(id);
    },
  );

  // 获取文章树
  server.post(
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
      return articleService.getArticleTree();
    },
  );

  // 获取收藏列表
  server.post(
    "/article/getFavorite",
    {
      schema: {
        description: "获取收藏的文章列表",
        body: Type.Object({}),
      },
    },
    async (request) => {
      return await articleService.getFavoriteArticles();
    },
  );

  // 新增文章
  server.post(
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
      const body = request.body as {
        title: string;
        content?: string;
        parentId?: string;
      };
      return await articleService.createArticle(
        body.title,
        body.content || "",
        body.parentId,
      );
    },
  );

  // 更新文章
  server.post(
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
          parentPath: Type.Optional(Type.String()),
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
  server.post(
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
      const body = request.body;
      await articleService.deleteArticle(body.id, body.force);
      return { success: true };
    },
  );

  // 搜索/获取文章列表
  server.post(
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
      const body = request.body;
      const { keyword = "", page = 1, pageSize = 20 } = body;
      return await articleService.searchArticles(keyword, page, pageSize);
    },
  );

  // 设置收藏
  server.post(
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
      const body = request.body;
      return await articleService.setFavorite(body.id, body.favorite);
    },
  );
}
