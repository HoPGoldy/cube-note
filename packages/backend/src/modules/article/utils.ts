import {
  SchemaArticleEditOperationType,
  SchemaArticleItemType,
} from "@/types/article";
import { ErrorBadRequest } from "@/types/error";
import { getParentIdByPath } from "@/utils/tree";
import { Article } from "@db/client";

export interface ArticleTreeData {
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
 * 对文本应用一组精确替换（语义对齐 Pi 的 edit 工具）
 * - 所有 edit 针对原始内容匹配，不是串行应用
 * - 每个 oldText 必须在原文中唯一匹配
 * - edits 之间不允许重叠/嵌套
 * - 全有或全无：任一 edit 校验失败则抛出异常，不会返回部分内容
 */
export const applyEdits = (
  content: string,
  edits: SchemaArticleEditOperationType[],
): string => {
  // 第 1 步：为每条 edit 找到唯一匹配区间
  const ranges = edits.map((edit, index) => {
    if (edit.oldText === "") {
      throw new ErrorBadRequest(
        `Edit #${index + 1}: oldText must not be empty`,
      );
    }

    const positions: number[] = [];
    let from = 0;
    while (true) {
      const found = content.indexOf(edit.oldText, from);
      if (found === -1) break;
      positions.push(found);
      from = found + 1;
    }

    if (positions.length === 0) {
      throw new ErrorBadRequest(
        `Edit #${index + 1}: oldText not found in the article content, please read the latest content and retry`,
      );
    }
    if (positions.length > 1) {
      throw new ErrorBadRequest(
        `Edit #${index + 1}: oldText matches ${positions.length} locations in the article content, add more context to make it unique`,
      );
    }

    const start = positions[0];
    return { index, start, end: start + edit.oldText.length, edit };
  });

  // 第 2 步：重叠/嵌套检测
  const sorted = [...ranges].sort((a, b) => a.start - b.start);
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].start < sorted[i - 1].end) {
      throw new ErrorBadRequest(
        `Edits #${sorted[i - 1].index + 1} and #${sorted[i].index + 1} have overlapping match ranges, merge them into one edit`,
      );
    }
  }

  // 第 3 步：从后往前一次性应用，避免替换影响后续匹配位置
  let result = content;
  for (let i = sorted.length - 1; i >= 0; i--) {
    const { start, end, edit } = sorted[i];
    result = result.slice(0, start) + edit.newText + result.slice(end);
  }

  return result;
};
