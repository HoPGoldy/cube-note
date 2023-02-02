import { baseApi } from './base'
import { AppResponse } from '@/types/global'
import {
    AddArticlePostData, ArticleContentResp, ArticleDeleteResp, ArticleLinkResp,
    ArticleMenuItem,
    ArticleRelatedResp,
    ArticleTreeNode, ArticleUpdateLinkMutation, ArticleUpdateResp, DeleteArticleMutation,
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
        getArticleRelated: build.query<AppResponse<ArticleRelatedResp>, string>({
            query: (id) => `article/${id}/getRelated`,
            providesTags: (res, err, id) => [{ type: 'articleRelated', id }]
        }),
        updateArticle: build.mutation<AppResponse<ArticleUpdateResp>, UpdateArticlePostData>({
            query: detail => ({
                url: 'article/update',
                method: 'PUT',
                body: detail
            }),
            invalidatesTags: (res, err, { id, title, favorite }) => {
                const tags: TagDescription<any>[] = [{ type: 'articleContent', id }]

                // 如果修改了标题，就要修改父节点的侧边栏（子节点名称）和树菜单
                if (title) {
                    tags.push({ type: 'articleLink', id: res?.data?.parentArticleId }, 'menu')
                }
                // 如果是否收藏改了，就要修改收藏夹
                if (favorite !== undefined) {
                    tags.push('favorite')
                }

                return tags
            }
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
            invalidatesTags: (res) => {
                const tags: TagDescription<any>[] = ['menu']
                tags.push({ type: 'articleLink', id: res?.data?.parentArticleId })
                return tags
            }
        }),
        getArticleTree: build.query<AppResponse<ArticleTreeNode[]>, string | undefined>({
            query: (id) => `article/${id}/tree`,
            providesTags: ['menu']
        }),
        updateArticleLink: build.mutation<AppResponse<string>, ArticleUpdateLinkMutation>({
            query: (detail) => ({
                url: 'article/updateLink',
                method: 'POST',
                body: detail
            }),
            invalidatesTags: (res, err, { selfId }) => [{ type: 'articleRelated', id: selfId }]
        }),
        getFavorite: build.query<AppResponse<ArticleMenuItem[]>, void>({
            query: () => 'article/favorite',
            providesTags: ['favorite']
        }),
    })
})

export const {
    useGetArticleContentQuery,
    useUpdateArticleMutation,
    useAddArticleMutation,
    useGetArticleTreeQuery,
    useGetArticleLinkQuery,
    useGetArticleRelatedQuery,
    useDeleteArticleMutation,
    useUpdateArticleLinkMutation,
    useGetFavoriteQuery,
} = extendedApi