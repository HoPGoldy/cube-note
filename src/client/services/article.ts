import { baseApi } from './base'
import { AppResponse } from '@/types/global'
import {
    AddArticlePostData, ArticleContentResp, ArticleDeleteResp, ArticleLinkResp, ArticleTreeNode, DeleteArticleMutation,
    UpdateArticlePostData
} from '@/types/article'
import { TagDescription } from '@reduxjs/toolkit/dist/query'

const extendedApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getArticleContent: build.query<AppResponse<ArticleContentResp>, string>({
            query: (id) => `article/${id}/getContent`,
            providesTags: (res, err, id) => [{ type: 'articleContent', id }]
        }),
        getArticleLink: build.query<AppResponse<ArticleLinkResp>, string>({
            query: (id) => `article/${id}/getLink`,
            providesTags: (res, err, id) => [{ type: 'articleLink', id }]
        }),
        updateArticle: build.mutation<AppResponse, UpdateArticlePostData>({
            query: detail => ({
                url: 'article/update',
                method: 'PUT',
                body: detail
            }),
            invalidatesTags: (res, err, { id }) => [{ type: 'articleContent', id }, { type: 'articleLink', id }, 'menu']
        }),
        addArticle: build.mutation<AppResponse<string>, AddArticlePostData>({
            query: (detail) => ({
                url: 'article/add',
                method: 'POST',
                body: detail
            }),
            invalidatesTags: (res, err, { parentId }) => [{ type: 'articleLink', parentId }, 'menu']
        }),
        deleteArticle: build.mutation<AppResponse<ArticleDeleteResp>, DeleteArticleMutation>({
            query: (detail) => ({
                url: 'article/remove',
                method: 'POST',
                body: detail
            }),
            invalidatesTags: (res, err) => {
                const tags: TagDescription<any>[] = ['menu']
                if (res?.data) tags.push({ type: 'articleLink', id: res.data.parentArticleId })
                return tags
            }
        }),
        getArticleTree: build.query<AppResponse<ArticleTreeNode[]>, string | undefined>({
            query: (id) => `article/${id}/tree`,
            providesTags: ['menu']
        }),
    })
})

export const {
    useLazyGetArticleContentQuery,
    useUpdateArticleMutation,
    useAddArticleMutation,
    useGetArticleTreeQuery,
    useGetArticleLinkQuery,
    useDeleteArticleMutation
} = extendedApi