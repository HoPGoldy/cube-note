import { baseApi, queryClient, requestGet, requestPost } from './base'
import { AppResponse } from '@/types/global'
import {
    AddArticleReqData, ArticleContent, ArticleDeleteResp, ArticleLinkResp,
    ArticleMenuItem,
    ArticleRelatedResp,
    ArticleTreeNode, DeleteArticleMutation,
    QueryArticleReqData,
    SetArticleRelatedReqData,
    UpdateArticleReqData
} from '@/types/article'
import { useInfiniteQuery, useMutation, useQuery } from 'react-query'
import isNil from 'lodash/isNil'

/** 查询文章正文 */
export const useQueryArticleContent = (id: number) => {
    return useQuery(['articleContent', id], () => {
        return requestGet<ArticleContent>(`article/${id}/getContent`)
    }, {
        refetchOnWindowFocus: false
    })
}

/** 更新文章详情 hook */
export const useUpdateArticle = () => {
    return useMutation((data: UpdateArticleReqData) => {
        return requestPost('article/update', data)
    }, {
        onMutate: async (data) => {
            // 把修改乐观更新到缓存
            const oldData = queryClient.getQueryData<AppResponse<ArticleContent>>(['articleContent', data.id])
            if (!oldData) return

            const newData = {
                ...oldData,
                data: { ...oldData.data, ...data }
            }
            queryClient.setQueryData(['articleContent', data.id], newData)
        },
        onSuccess: (resp, data) => {
            queryClient.invalidateQueries(['articleLink', data.id])
            queryClient.invalidateQueries('menu')
        }
    })
}

/** 查询本文的下属文章 */
export const useQueryArticleLink = (id: number | undefined, enabled: boolean) => {
    return useQuery(['articleLink', id], () => {
        return requestGet<ArticleLinkResp>(`article/${id}/getLink`)
    }, { enabled })
}

/** 查询本文的相关文章 */
export const useQueryArticleRelated = (id: number | undefined, enabled: boolean) => {
    return useQuery(['articleRelated', id], () => {
        return requestGet<ArticleRelatedResp>(`article/${id}/getRelated`)
    }, { enabled })
}

/** 新增文章 */
export const useAddArticle = () => {
    return useMutation((data: AddArticleReqData) => {
        return requestPost('article/add', data)
    }, {
        onSuccess: (resp, data) => {
            queryClient.invalidateQueries(['articleLink', data.parentId])
            queryClient.invalidateQueries('menu')
        }
    })
}

/** 删除文章 */
export const useDeleteArticle = () => {
    return useMutation((data: DeleteArticleMutation) => {
        return requestPost<ArticleDeleteResp>('article/remove', data)
    }, {
        onSuccess: (resp) => {
            queryClient.invalidateQueries(['articleLink', resp?.data?.parentArticleId])
            queryClient.invalidateQueries('menu')
        }
    })
}

/** 搜索文章列表 */
export const useQueryArticleList = (data: { keyword: string }) => {
    return useInfiniteQuery('search', async (context) => {
        console.log('🚀 ~ file: article.ts:89 ~ returnuseInfiniteQuery ~ context:', context)
        // return requestPost<ArticleContent[]>('article/getList', data)
    }, {
        refetchOnWindowFocus: false,
        enabled: !!data.keyword,
        getNextPageParam: (lastPage, pages) => {
            // if (lastPage.data.length < 10) return undefined
            // return pages.length + 1
            console.log('🚀 ~ file: article.ts:98 ~ returnuseInfiniteQuery ~ lastPage, pages:', lastPage, pages)
        }
    })
}

/** 查询文章树 */
export const useQueryArticleTree = (id?: number) => {
    return useQuery('menu', () => {
        return requestGet<ArticleTreeNode[]>(`article/${id}/tree`)
    }, {
        refetchOnWindowFocus: false,
        enabled: !isNil(id)
    })
}

/** 查询收藏列表 */
export const useQueryArticleFavorite = (enabled: boolean) => {
    return useQuery('favorite', () => {
        return requestGet<ArticleMenuItem[]>('article/favorite')
    }, {
        refetchOnWindowFocus: false,
        enabled
    })
}

/** 收藏文章 */
export const useFavoriteArticle = () => {
    return useMutation((data: { id: number, favorite: boolean }) => {
        return requestPost('article/setFavorite', data)
    }, {
        onSuccess: () => {
            queryClient.invalidateQueries('favorite')
        }
    })
}

/** 关联文章 */
export const useSetArticleRelated = () => {
    return useMutation((data: SetArticleRelatedReqData) => {
        return requestPost('article/setRelated', data)
    }, {
        onSuccess: (resp, data) => {
            queryClient.invalidateQueries(['articleRelated', data.fromArticleId])
        }
    })
}
