import { baseApi } from './base'
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
import { TagDescription } from '@reduxjs/toolkit/dist/query'
import { STATUS_CODE } from '@/config'

export const articleApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getArticleContent: build.query<AppResponse<ArticleContent>, number>({
            query: (id) => `article/${id}/getContent`,
            providesTags: (res, err, id) => [{ type: 'articleContent', id }]
        }),
        getArticleLink: build.query<AppResponse<ArticleLinkResp>, number>({
            query: (id) => `article/${id}/getLink`,
            providesTags: (res, err, id) => [{ type: 'articleLink', id }]
        }),
        getArticleRelated: build.query<AppResponse<ArticleRelatedResp>, number>({
            query: (id) => `article/${id}/getRelated`,
            providesTags: (res, err, id) => [{ type: 'articleRelated', id }]
        }),
        updateArticleTitle: build.mutation<AppResponse, { id: number, parentId: number, title: string }>({
            query: (detail) => ({
                url: 'article/update',
                method: 'POST',
                body: { id: detail.id, title: detail.title }
            }),
            invalidatesTags: (res, err, { parentId }) => {
                if (!parentId) return []
                return [{ type: 'articleLink', id: parentId }]
            },
        }),
        updateArticle: build.mutation<AppResponse, UpdateArticleReqData>({
            query: detail => ({
                url: 'article/update',
                method: 'PUT',
                body: detail
            }),
            invalidatesTags: (res, err, { title }) => {
                const tags: TagDescription<any>[] = []

                // 如果修改了标题，就要修改父节点的侧边栏（子节点名称）和树菜单
                if (!title) return []
                
                // 如果没有父节点的话就不需要重载侧边栏了
                if (res?.data?.parentArticleId) {
                    tags.push({ type: 'articleLink', id: res.data.parentArticleId })
                }
                tags.push('menu')
                return tags
            },
            async onQueryStarted({ id, ...patch }, { dispatch, queryFulfilled }) {
                // 把修改乐观更新到缓存
                const { undo } = dispatch(
                    articleApi.util.updateQueryData('getArticleContent', id, (draft) => {
                        if (!draft.data) return
                        if (patch.content) draft.data.content = patch.content
                        if (patch.title) draft.data.title = patch.title
                        if (patch.tagIds) draft.data.tagIds = patch.tagIds
                    })
                )

                const resp = await queryFulfilled
                if (resp.data.code !== STATUS_CODE.SUCCESS) undo()
            },
        }),
        queryArticleList: build.query<AppResponse<ArticleContent[]>, QueryArticleReqData>({
            query: query => ({
                url: 'article/getList',
                method: 'POST',
                body: query
            }),
            providesTags: ['articleContent']
        }),
        addArticle: build.mutation<AppResponse<string>, AddArticleReqData>({
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
        getArticleTree: build.query<AppResponse<ArticleTreeNode[]>, number | undefined>({
            query: (id) => `article/${id}/tree`,
            providesTags: ['menu']
        }),
        getFavorite: build.query<AppResponse<ArticleMenuItem[]>, void>({
            query: () => 'article/favorite',
            providesTags: ['favorite']
        }),
        setFavorite: build.mutation<AppResponse, { id: number, favorite: boolean }>({
            query: (detail) => ({
                url: 'article/setFavorite',
                method: 'POST',
                body: detail
            }),
        }),
        // 关联文章
        setArticleRelated: build.mutation<AppResponse, SetArticleRelatedReqData>({
            query: (detail) => ({
                url: 'article/setRelated',
                method: 'POST',
                body: detail
            }),
        }),
    })
})

export const {
    useGetArticleContentQuery,
    useUpdateArticleMutation,
    useAddArticleMutation,
    useQueryArticleListQuery,
    useLazyQueryArticleListQuery,
    useGetArticleTreeQuery,
    useGetArticleLinkQuery,
    useGetArticleRelatedQuery,
    useDeleteArticleMutation,
    useGetFavoriteQuery,
    useSetFavoriteMutation,
    useSetArticleRelatedMutation
} = articleApi