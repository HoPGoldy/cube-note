import { queryClient, requestPost } from "./base";
import { AppResponse } from "@/types/global";
import {
  AddArticleReqData,
  ArticleContent,
  ArticleDeleteResp,
  ArticleLinkResp,
  ArticleMenuItem,
  ArticleTreeNode,
  DeleteArticleMutation,
  SearchArticleReqData,
  SearchArticleResp,
  UpdateArticleReqData,
} from "@/types/article";
import { useMutation, useQuery } from "@tanstack/react-query";
import isNil from "lodash/isNil";

/** 查询文章正文 */
export const useQueryArticleContent = (id?: string) => {
  const result = useQuery({
    queryKey: ["articleContent", id],
    enabled: !!id,
    queryFn: async () => {
      const resp = await requestPost("article/getContent", {
        id,
      });
      const data = resp.data;
      return {
        ...resp,
        data: {
          ...data,
          tagIds: data.tagIds ? data.tagIds.split(",").filter(Boolean) : [],
        } as ArticleContent,
      };
    },
  });

  return { ...result, articleDetail: result.data?.data };
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
      // 转换 tagIds 从 number[] 到 string
      const convertedData = {
        ...data,
        tagIds:
          data.tagIds && data.tagIds.length > 0
            ? data.tagIds.join(",")
            : undefined,
      };
      return requestPost("article/update", convertedData);
    },
    onMutate: async (data) => {
      // 把修改乐观更新到缓存
      updateArticleCache(data.id, data);
    },
    onSuccess: (resp, data) => {
      if (data.title || data.parentArticleId) {
        queryClient.invalidateQueries({ queryKey: ["articleLink", data.id] });
        queryClient.invalidateQueries({ queryKey: ["menu"] });
      }
      if (!isNil(data.color)) {
        queryClient.invalidateQueries({ queryKey: ["menu"] });
        queryClient.invalidateQueries({ queryKey: ["favorite"] });
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
  enabled: boolean = true,
) => {
  const result = useQuery({
    queryKey: ["articleLink", id],
    queryFn: () => {
      return requestPost<ArticleLinkResp>("article/getLink", { id });
    },
    enabled,
  });

  return {
    ...result,
    childrenArticles: result.data?.data?.childrenArticles,
    parentArticleIds: result.data?.data?.parentArticleIds || [],
    parentArticleTitle: result.data?.data?.parentArticleTitle || "",
  };
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
  });
};

/** 搜索文章列表 */
export const useQueryArticleList = (data: SearchArticleReqData) => {
  const enableSearch = () => {
    if (data.keyword) return true;
    if (data.tagIds && data.tagIds.length > 0) return true;
    if (data.colors && data.colors.length > 0) return true;
    return false;
  };

  const result = useQuery({
    queryKey: ["articleList", data],
    queryFn: async () => {
      return requestPost<SearchArticleResp>("article/search", data);
    },
    enabled: enableSearch(),
  });

  return {
    ...result,
    articleList: result.data?.data?.items || [],
    total: result.data?.data?.total || 0,
  };
};

/** 查询文章树 */
export const useQueryArticleTree = (id?: string) => {
  const result = useQuery({
    queryKey: ["menu", id],
    queryFn: () => {
      return requestPost<ArticleTreeNode[]>("article/getTree", { id });
    },
    refetchOnWindowFocus: false,
    enabled: !isNil(id),
  });

  return { ...result, articleTree: result.data?.data || [] };
};

/** 查询收藏列表 */
export const useQueryArticleFavorite = (enabled: boolean) => {
  const result = useQuery({
    queryKey: ["favorite"],
    queryFn: () => {
      return requestPost<ArticleMenuItem[]>("article/getFavorite", {});
    },
    refetchOnWindowFocus: false,
    enabled,
  });

  return { ...result, articleFavorite: result.data?.data || [] };
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

/** 统计文章 */
export const useQueryArticleCount = () => {
  return useQuery({
    queryKey: ["userStatistic"],
    queryFn: () => {
      return requestPost("article/statistic", {});
    },
  });
};
