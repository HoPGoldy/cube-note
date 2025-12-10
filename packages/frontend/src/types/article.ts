/**
 * 用户收藏文章关联表
 */
export interface ArticleFavoriteStorage {
  id: number;
  articleId: number;
  userId: number;
}

/**
 * 文章之间的关联表
 */
export interface ArticleRelatedStorage {
  id: number;
  fromArticleId: number;
  toArticleId: number;
  userId: number;
}

export interface AddArticleReqData {
  title: string;
  content: string;
  parentId: string;
}

export interface SearchArticleReqData {
  keyword?: string;
  tagIds?: string[];
  page?: number;
}

/** 文章查询详情 */
export interface SearchArticleDetail {
  id: number;
  title: string;
  updateTime: number;
  tagIds: number[];
  content: string;
}

export interface SearchArticleResp {
  total: number;
  rows: SearchArticleDetail[];
}

export type UpdateArticleReqData = Partial<ArticleContent> & {
  id: string;
};

export interface DeleteArticleMutation {
  id: string;
  force: boolean;
}

export interface ArticleMenuItem {
  id: string;
  title: string;
  color?: string;
}

export enum TabTypes {
  Sub = "sub",
  Favorite = "favorite",
}

export interface ArticleContent {
  id: string;
  favorite: boolean;
  title: string;
  content: string;
  createTime: number;
  updateTime: number;
  parentArticleId?: string;
  parentPath?: string;
  tagIds?: string[];
  listSubarticle?: boolean;
  color?: string;
}

/** 获取文章下属节点的接口响应数据 */
export interface ArticleLinkResp {
  /**
   * 父节点 id
   * 因为下属文章列表有个返回父级文章的按钮，所以需要返回父级文章 id
   */
  parentArticleIds?: string[];
  parentArticleTitle?: string;
  /** 子文章列表 */
  childrenArticles: ArticleMenuItem[];
}

/** 文章树的节点 */
export interface ArticleTreeNode {
  /** 节点值（文章 id） */
  id: string;
  /** 文章名称 */
  title: string;
  /** 颜色 */
  color?: string;
  /** 子节点列表 */
  children?: ArticleTreeNode[];
}

export interface ArticleDeleteResp {
  deletedArticleIds: string[];
  parentArticleId?: string;
}
