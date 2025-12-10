import { PrismaClient } from "@db/client";
import { ErrorNotFound } from "@/types/error";
import {
  appendIdToPath,
  buildArticleTree,
  getParentIdByPath,
  pathToArray,
} from "./utils";

interface ServiceOptions {
  prisma: PrismaClient;
}

export class ArticleService {
  constructor(private options: ServiceOptions) {}

  async createArticle(title: string, content: string, parentId?: string) {
    let parentPath = "";

    if (parentId) {
      const parent = await this.options.prisma.article.findUnique({
        where: { id: parentId },
      });
      if (!parent) throw new ErrorNotFound("Parent article not found");
      parentPath = appendIdToPath(parent.parentPath, parentId);
    }

    return await this.options.prisma.article.create({
      data: { title, content, parentPath },
    });
  }

  async updateArticle(
    id: string,
    data: {
      title?: string;
      content?: string;
      tagIds?: string;
      favorite?: boolean;
    },
  ) {
    const article = await this.options.prisma.article.findUnique({
      where: { id },
    });
    if (!article) throw new ErrorNotFound("Article not found");

    return await this.options.prisma.article.update({ where: { id }, data });
  }

  async deleteArticle(id: string, force: boolean = false) {
    const article = await this.options.prisma.article.findUnique({
      where: { id },
    });
    if (!article) return;

    const children = await this.options.prisma.article.findMany({
      where: { parentPath: { contains: `${article.parentPath}${id}#` } },
    });

    if (children.length > 0 && !force) {
      throw new Error("Cannot delete article with children");
    }

    if (force && children.length > 0) {
      await this.options.prisma.article.deleteMany({
        where: { id: { in: children.map((c) => c.id) } },
      });
    }

    await this.options.prisma.article.delete({ where: { id } });
  }

  async searchArticles(
    keyword: string,
    page: number = 1,
    pageSize: number = 20,
  ) {
    const skip = (page - 1) * pageSize;

    const items = await this.options.prisma.article.findMany({
      where: {
        OR: [
          { title: { contains: keyword } },
          { content: { contains: keyword } },
        ],
      },
      skip,
      take: pageSize,
      orderBy: { updatedAt: "desc" },
    });

    const total = await this.options.prisma.article.count({
      where: {
        OR: [
          { title: { contains: keyword } },
          { content: { contains: keyword } },
        ],
      },
    });

    return { items, total };
  }

  async getArticleTree() {
    const articles = await this.options.prisma.article.findMany({
      orderBy: { createdAt: "asc" },
      select: { id: true, title: true, parentPath: true, color: true },
    });
    return buildArticleTree(articles);
  }

  async setFavorite(id: string, favorite: boolean) {
    const article = await this.options.prisma.article.findUnique({
      where: { id },
    });
    if (!article) throw new ErrorNotFound("Article not found");

    return await this.options.prisma.article.update({
      where: { id },
      data: { favorite },
    });
  }

  async getArticleDetail(id: string) {
    const article = await this.options.prisma.article.findUnique({
      where: { id },
    });
    if (!article) throw new ErrorNotFound("Article not found");
    return article;
  }

  async getChildren(id: string) {
    const article = await this.options.prisma.article.findUnique({
      where: { id },
    });
    if (!article) throw new ErrorNotFound("Article not found");

    const parentId = getParentIdByPath(article.parentPath);
    const prefix = `${article.parentPath || ""}${id}#`;

    const matchedArticles = await this.options.prisma.article.findMany({
      where: parentId
        ? { OR: [{ parentPath: prefix }, { id: parentId }] }
        : { parentPath: prefix },
      orderBy: { createdAt: "asc" },
    });

    const data = {
      parentArticleIds: undefined as string[] | undefined,
      parentArticleTitle: undefined as string | undefined,
      childrenArticles: [] as { id: string; title: string }[],
    };

    matchedArticles.forEach((item) => {
      if (parentId && item.id === parentId) {
        data.parentArticleIds = [...pathToArray(item.parentPath), item.id];
        data.parentArticleTitle = item.title;
        return;
      }
      data.childrenArticles.push(item);
    });

    return data;
  }

  async getFavoriteArticles() {
    return await this.options.prisma.article.findMany({
      where: { favorite: true },
      select: { id: true, title: true },
      orderBy: { updatedAt: "desc" },
    });
  }
}
