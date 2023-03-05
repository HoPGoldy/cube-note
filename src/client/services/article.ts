import { baseApi } from './base'
import { AppResponse } from '@/types/global'
import {
    AddArticleReqData, ArticleContent, ArticleDeleteResp, ArticleLinkResp,
    ArticleMenuItem,
    ArticleRelatedResp,
    ArticleTreeNode, ArticleUpdateResp, DeleteArticleMutation,
    QueryArticleReqData,
    UpdateArticleReqData
} from '@/types/article.new'
import { TagDescription } from '@reduxjs/toolkit/dist/query'
import { STATUS_CODE } from '@/config'

export const articleApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getArticleContent: build.query<AppResponse<ArticleContent>, string>({
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
        updateArticle: build.mutation<AppResponse<ArticleUpdateResp>, UpdateArticleReqData>({
            query: detail => ({
                url: 'article/update',
                method: 'PUT',
                body: detail
            }),
            invalidatesTags: (res, err, { title, favorite }) => {
                const tags: TagDescription<any>[] = []

                // 如果修改了标题，就要修改父节点的侧边栏（子节点名称）和树菜单
                if (title) {
                    // 如果没有父节点的话就不需要重载侧边栏了
                    if (res?.data?.parentArticleId) {
                        tags.push({ type: 'articleLink', id: res.data.parentArticleId })
                    }
                    tags.push('menu')
                }

                // 如果收藏改了，就要修改侧边栏的收藏夹
                if (favorite !== undefined) {
                    tags.push('favorite')
                }

                return tags
            },
            async onQueryStarted({ id, ...patch }, { dispatch, queryFulfilled }) {
                try {
                    // 把修改乐观更新到缓存
                    const { undo } = dispatch(
                        articleApi.util.updateQueryData('getArticleContent', id, (draft) => {
                            if (!draft.data) return
                            if (patch.content) draft.data.content = patch.content
                            if (patch.title) draft.data.title = patch.title
                            if (patch.favorite !== undefined) draft.data.favorite = patch.favorite
                            if (patch.tagIds) draft.data.tagIds = patch.tagIds
                        })
                    )

                    const resp = await queryFulfilled
                    if (resp.data.code !== STATUS_CODE.SUCCESS) undo()
                }
                catch (e) {
                    console.error(e)
                }
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
        getArticleTree: build.query<AppResponse<ArticleTreeNode[]>, string | undefined>({
            query: (id) => `article/${id}/tree`,
            providesTags: ['menu']
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
    useQueryArticleListQuery,
    useLazyQueryArticleListQuery,
    useGetArticleTreeQuery,
    useGetArticleLinkQuery,
    useGetArticleRelatedQuery,
    useDeleteArticleMutation,
    useGetFavoriteQuery,
} = articleApi