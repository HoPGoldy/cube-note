/**
 * Article 树形结构工具函数
 */

import type { Article } from "@db/client";

/**
 * 将路径字符串转换为数组
 * "#1#2#3#" -> ["1", "2", "3"]
 */
export const pathToArray = (path: string | null | undefined): string[] => {
  if (!path) return [];
  return path.split("#").filter(Boolean);
};

/**
 * 将数组转换为路径字符串
 * ["1", "2", "3"] -> "#1#2#3#"
 */
export const arrayToPath = (arr: string[]): string => {
  if (arr.length === 0) return "";
  return "#" + arr.join("#") + "#";
};

/**
 * 在路径后追加一个 ID
 * ("#1#2#", "3") -> "#1#2#3#"
 */
export const appendIdToPath = (
  parentPath: string | null | undefined,
  id: string,
): string => {
  return (parentPath || "") + id + "#";
};

/**
 * 从路径中获取父级 ID
 * "#1#2#3#" -> "3"
 */
export const getParentIdByPath = (
  path: string | null | undefined,
): string | undefined => {
  const arr = pathToArray(path);
  return arr.length > 0 ? arr[arr.length - 1] : undefined;
};

/**
 * 从路径中获取路径数组的所有 ID
 * "#1#2#3#" -> ["1", "2", "3"]
 */
export const getIdsFromPath = (path: string | null | undefined): string[] => {
  return pathToArray(path);
};

interface ArticleTreeData {
  id: string;
  title: string;
  parentPath: string | null;
  color: string | null;
}

export interface ArticleTreeNode extends ArticleTreeData {
  children?: ArticleTreeNode[];
}

/**
 * 构建文章树形结构
 */
export const buildArticleTree = (
  articles: ArticleTreeData[],
): ArticleTreeNode[] => {
  const map = new Map<string, ArticleTreeNode>();
  const roots: ArticleTreeNode[] = [];

  // 第1步：创建所有节点
  for (const article of articles) {
    map.set(article.id, { ...article, children: [] });
  }

  // 第2步：建立父子关系
  for (const article of articles) {
    const node = map.get(article.id)!;
    const parentId = getParentIdByPath(article.parentPath);

    if (parentId) {
      const parent = map.get(parentId);
      if (parent) {
        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(node);
      }
    } else {
      // 没有父级则是根节点
      roots.push(node);
    }
  }

  return roots;
};

/**
 * 检查文章是否有子文章
 */
export const hasChildren = (
  article: Article,
  allArticles: Article[],
): boolean => {
  const prefix = (article.parentPath || "") + article.id + "#";
  return allArticles.some((a) => a.parentPath?.startsWith(prefix));
};

/**
 * 获取文章的所有子文章 ID
 */
export const getChildArticleIds = (
  article: Article,
  allArticles: Article[],
): string[] => {
  const prefix = (article.parentPath || "") + article.id + "#";
  return allArticles
    .filter((a) => a.parentPath?.startsWith(prefix))
    .map((a) => a.id);
};

/**
 * 获取文章的深度（路径长度）
 */
export const getArticleDepth = (article: Article): number => {
  return pathToArray(article.parentPath).length;
};
