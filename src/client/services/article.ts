import { baseApi } from './base'
import { AppResponse } from '@/types/global'
import { AddArticlePostData, ArticleContentResp, ArticleLinkResp, ArticleTreeNode } from '@/types/article'

const extendedApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getArticleContent: build.query<AppResponse<ArticleContentResp>, string>({
            query: (id) => `article/getContent/${id}`,
        }),
        getArticleLink: build.query<AppResponse<ArticleLinkResp>, string>({
            query: (id) => `article/getLink/${id}`,
        }),
        updateArticle: build.mutation<AppResponse, { id: string, detail: Partial<AddArticlePostData> }>({
            query: ({ id, detail }) => ({
                url: `article/update/${id}`,
                method: 'PUT',
                body: detail
            })
        }),
        addArticle: build.mutation<AppResponse<string>, AddArticlePostData>({
            query: (detail) => ({
                url: 'article/add',
                method: 'POST',
                body: detail
            })
        }),
        getArticleTree: build.query<AppResponse<ArticleTreeNode[]>, string | undefined>({
            query: (id) => `article/tree/${id}`,
        }),
    })
})

export const {
    useLazyGetArticleContentQuery,
    useUpdateArticleMutation,
    useAddArticleMutation,
    useGetArticleTreeQuery,
    useGetArticleLinkQuery
} = extendedApi