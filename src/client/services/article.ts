import { baseApi } from './base'
import { AppResponse } from '@/types/global'
import { AddArticlePostData, ArticleContentResp } from '@/types/article'

const extendedApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getArticleContent: build.query<AppResponse<ArticleContentResp>, string>({
            query: (id) => `article/get/content/${id}`,
        }),
        updateArticle: build.mutation<AppResponse, { id: string, detail: Partial<AddArticlePostData> }>({
            query: ({ id, detail }) => ({
                url: `article/update/${id}`,
                method: 'PUT',
                body: detail
            })
        }),
    })
})

export const { useGetArticleContentQuery, useUpdateArticleMutation } = extendedApi