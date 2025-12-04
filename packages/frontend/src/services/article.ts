import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { requestGet, requestPost } from "./base";

// 类型定义
export interface Article {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  content: string;
  parentPath: string | null;
  tagIds: string | null;
  favorite: boolean;
}

export interface ArticleTreeNode extends Article {
  children?: ArticleTreeNode[];
}

export interface ArticleSearchResponse {
  items: Article[];
  total: number;
}

export interface ArticleCreateRequest {
  title: string;
  content?: string;
  parentId?: string;
}

export interface ArticleUpdateRequest {
  title?: string;
  content?: string;
  tagIds?: string;
  favorite?: boolean;
}

export interface ArticleRelation {
  fromId: string;
  toId: string;
}

// API 调用
const createArticle = (data: ArticleCreateRequest) =>
  requestPost<Article>("article/create", data);

const getArticleDetail = (id: string) => requestGet<Article>(`article/${id}`);

const updateArticle = (id: string, data: ArticleUpdateRequest) =>
  requestPost<Article>(`article/${id}`, data);

const deleteArticle = (id: string, force?: boolean) =>
  requestPost<{ success: boolean }>(
    `article/${id}?${force ? "force=true" : ""}`,
    {},
  );

const searchArticles = (keyword: string, page?: number, pageSize?: number) =>
  requestGet<ArticleSearchResponse>(
    `article/search?keyword=${encodeURIComponent(keyword)}&page=${page || 1}&pageSize=${pageSize || 20}`,
  );

const getArticleTree = () => requestGet<ArticleTreeNode[]>("article/tree");

const setArticleFavorite = (id: string, favorite: boolean) =>
  requestPost<Article>(`article/${id}/favorite`, { favorite });

const setArticleRelation = (fromId: string, toId: string) =>
  requestPost<ArticleRelation>("article/relation/set", { fromId, toId });

const removeArticleRelation = (fromId: string, toId: string) =>
  requestPost<{ success: boolean }>(
    `article/relation?fromId=${fromId}&toId=${toId}`,
    {},
  );

const getArticleRelations = (id: string) =>
  requestGet<ArticleRelation[]>(`article/${id}/relations`);

// React Query Hooks
export const useCreateArticle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createArticle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["article"] });
    },
  });
};

export const useGetArticleDetail = (id: string) => {
  return useQuery({
    queryKey: ["article", id],
    queryFn: () => getArticleDetail(id),
    enabled: !!id,
  });
};

export const useUpdateArticle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ArticleUpdateRequest }) =>
      updateArticle(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["article"] });
    },
  });
};

export const useDeleteArticle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, force }: { id: string; force?: boolean }) =>
      deleteArticle(id, force),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["article"] });
    },
  });
};

export const useSearchArticles = (
  keyword: string,
  page?: number,
  pageSize?: number,
) => {
  return useQuery({
    queryKey: ["article", "search", keyword, page, pageSize],
    queryFn: () => searchArticles(keyword, page, pageSize),
    enabled: !!keyword,
  });
};

export const useGetArticleTree = () => {
  return useQuery({
    queryKey: ["article", "tree"],
    queryFn: getArticleTree,
  });
};

export const useSetArticleFavorite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, favorite }: { id: string; favorite: boolean }) =>
      setArticleFavorite(id, favorite),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["article"] });
    },
  });
};

export const useSetArticleRelation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ fromId, toId }: { fromId: string; toId: string }) =>
      setArticleRelation(fromId, toId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["article"] });
    },
  });
};

export const useRemoveArticleRelation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ fromId, toId }: { fromId: string; toId: string }) =>
      removeArticleRelation(fromId, toId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["article"] });
    },
  });
};

export const useGetArticleRelations = (id: string) => {
  return useQuery({
    queryKey: ["article", id, "relations"],
    queryFn: () => getArticleRelations(id),
    enabled: !!id,
  });
};
