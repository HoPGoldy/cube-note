import { queryClient, requestPost } from "./base";
import { AppResponse } from "@/types/global";
import {
  AddArticleReqData,
  ArticleContent,
  ArticleDeleteResp,
  ArticleLinkResp,
  ArticleMenuItem,
  ArticleRelatedResp,
  ArticleSubLinkDetail,
  ArticleTreeNode,
  DeleteArticleMutation,
  SearchArticleReqData,
  SearchArticleResp,
  SetArticleRelatedReqData,
  UpdateArticleReqData,
} from "@/types/article";
import { useMutation, useQuery } from "@tanstack/react-query";
import isNil from "lodash/isNil";

/** 查询文章正文 */
export const useQueryArticleContent = (id: string) => {
  return useQuery({
    queryKey: ["articleContent", id],
    queryFn: () => {
      return requestPost<ArticleContent>("article/getContent", { id });
    },
    refetchOnWindowFocus: false,
  });
};

const updateArticleCache = (
  id: string,
  updateData: Partial<ArticleContent>,
) => {
  const oldData = queryClient.getQueryData<AppResponse<ArticleContent>>([
    "articleContent",
    id,
  ]);
  if (!oldData) return;

  const newData = {
    ...oldData,
    data: { ...oldData.data, ...updateData },
  };
  queryClient.setQueryData(["articleContent", id], newData);
};

/** 更新文章详情 hook */
export const useUpdateArticle = () => {
  return useMutation({
    mutationFn: (data: UpdateArticleReqData) => {
      return requestPost("article/update", data);
    },
    onMutate: async (data) => {
      // 把修改乐观更新到缓存
      updateArticleCache(data.id, data);
    },
    onSuccess: (resp, data) => {
      if (data.title || data.parentArticleId) {
        queryClient.invalidateQueries({ queryKey: ["articleLink", data.id] });
        queryClient.invalidateQueries({ queryKey: ["articleDetailSubLink"] });
        queryClient.invalidateQueries({ queryKey: ["menu"] });
      }
      if (!isNil(data.color)) {
        queryClient.invalidateQueries({ queryKey: ["menu"] });
        queryClient.invalidateQueries({ queryKey: ["favorite"] });
        queryClient.invalidateQueries({ queryKey: ["articleRelated"] });
      }
      // 是否收藏不通过这个接口更新，所以不需要更新收藏列表
      // if (data.favorite) {
      //     queryClient.invalidateQueries('favorite')
      // }
    },
  });
};

/** 自动保存接口 */
export const autoSaveContent = async (id: string, content: string) => {
  updateArticleCache(id, { content });
  return requestPost("article/update", { id, content });
};

/** 查询本文的下属文章 */
export const useQueryArticleLink = (
  id: string | undefined,
  enabled: boolean,
) => {
  return useQuery({
    queryKey: ["articleLink", id],
    queryFn: () => {
      return requestPost<ArticleLinkResp>("article/getLink", { id });
    },
    enabled,
  });
};

/** 查询本文的详细下属文章列表 */
export const useQueryArticleSublink = (
  id: string | undefined,
  enabled: boolean,
) => {
  return useQuery({
    queryKey: ["articleDetailSubLink", id],
    queryFn: () => {
      return requestPost<ArticleSubLinkDetail[]>(
        "article/getChildrenDetailList",
        { id },
      );
    },
    enabled,
  });
};

/** 查询本文的相关文章 */
export const useQueryArticleRelated = (
  id: string | undefined,
  enabled: boolean,
) => {
  return useQuery({
    queryKey: ["articleRelated", id],
    queryFn: () => {
      return requestPost<ArticleRelatedResp>("article/getRelated", { id });
    },
    enabled,
  });
};

/** 新增文章 */
export const useAddArticle = () => {
  return useMutation({
    mutationFn: (data: AddArticleReqData) => {
      return requestPost("article/add", data);
    },
    onSuccess: (resp, data) => {
      queryClient.invalidateQueries({
        queryKey: ["articleLink", data.parentId],
      });
      queryClient.invalidateQueries({ queryKey: ["articleDetailSubLink"] });
      queryClient.invalidateQueries({ queryKey: ["menu"] });
    },
  });
};

/** 删除文章 */
export const useDeleteArticle = () => {
  return useMutation({
    mutationFn: (data: DeleteArticleMutation) => {
      return requestPost<ArticleDeleteResp>("article/remove", data);
    },
    onSuccess: (resp) => {
      queryClient.invalidateQueries({
        queryKey: ["articleLink", resp?.data?.parentArticleId],
      });
      queryClient.invalidateQueries({ queryKey: ["articleDetailSubLink"] });
      queryClient.invalidateQueries({ queryKey: ["menu"] });
      queryClient.invalidateQueries({ queryKey: ["favorite"] });
    },
  });
};

/** 搜索文章列表 */
export const useQueryArticleList = (data: SearchArticleReqData) => {
  return useQuery({
    queryKey: ["articleList", data],
    queryFn: async () => {
      return requestPost<SearchArticleResp>("article/getList", data);
    },
    refetchOnWindowFocus: false,
    enabled: data.keyword !== "" || (data.tagIds && data.tagIds.length > 0),
  });
};

/** 查询文章树 */
export const useQueryArticleTree = (id?: string) => {
  return useQuery({
    queryKey: ["menu", id],
    queryFn: () => {
      return requestPost<ArticleTreeNode>("article/getTree", { id });
    },
    refetchOnWindowFocus: false,
    enabled: !isNil(id),
  });
};

/** 查询收藏列表 */
export const useQueryArticleFavorite = (enabled: boolean) => {
  return useQuery({
    queryKey: ["favorite"],
    queryFn: () => {
      return requestPost<ArticleMenuItem[]>("article/getFavorite", {});
    },
    refetchOnWindowFocus: false,
    enabled,
  });
};

/** 收藏文章 */
export const useFavoriteArticle = () => {
  return useMutation({
    mutationFn: (data: { id: string; favorite: boolean }) => {
      return requestPost("article/setFavorite", data);
    },
    onMutate: async (data) => {
      // 把修改乐观更新到缓存
      updateArticleCache(data.id, { favorite: data.favorite });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorite"] });
    },
  });
};

/** 关联文章 */
export const useSetArticleRelated = () => {
  return useMutation({
    mutationFn: (data: SetArticleRelatedReqData) => {
      return requestPost("article/setRelated", data);
    },
    onSuccess: (resp, data) => {
      queryClient.invalidateQueries({
        queryKey: ["articleRelated", data.fromArticleId],
      });
    },
  });
};
