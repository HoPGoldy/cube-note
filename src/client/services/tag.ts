import { baseApi } from './base'
import { AppResponse } from '@/types/global'
import { AddTagReqData, DeleteTagReqData, SetTagColorReqData, SetTagGroupReqData, TagGroupListItem, TagGroupStorage, TagListItem, TagStorage, TagUpdateReqData } from '@/types/tag'
import { STATUS_CODE } from '@/config'

export const tagApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getTagList: build.query<AppResponse<TagListItem[]>, void>({
            query: () => 'tag/list',
            providesTags: ['tagList'],
        }),
        addTag: build.mutation<AppResponse<string>, AddTagReqData>({
            query: data => ({
                url: 'tag/add',
                method: 'POST',
                body: data
            }),
            async onQueryStarted(reqData, { dispatch, queryFulfilled }) {
                const { data: updatedPost } = await queryFulfilled
                if (updatedPost.code !== STATUS_CODE.SUCCESS || !updatedPost.data) return

                const id = updatedPost.data
                dispatch(
                    tagApi.util.updateQueryData('getTagList', undefined, (draft) => {
                        if (!draft.data) return
                        draft.data.push({ ...reqData, id })
                    })
                )
            }
        }),
        updateTag: build.mutation<AppResponse<string>, TagUpdateReqData>({
            query: data => ({
                url: 'tag/update',
                method: 'PUT',
                body: data
            }),
            async onQueryStarted({ id, ...newTag }, { dispatch, queryFulfilled }) {
                const { data: updatedPost } = await queryFulfilled
                if (updatedPost.code !== STATUS_CODE.SUCCESS) return

                dispatch(
                    tagApi.util.updateQueryData('getTagList', undefined, (draft) => {
                        if (!draft.data) return
                        const targetTag = draft.data.find(item => item.id === id)
                        if (!targetTag) return
                        Object.assign(targetTag, newTag)
                    })
                )
            }
        }),
        deleteTag: build.mutation<AppResponse<string>, string>({
            query: (id) => ({
                url: `tag/${id}/remove`,
                method: 'POST'
            }),
            async onQueryStarted(id, { dispatch }) {
                dispatch(
                    tagApi.util.updateQueryData('getTagList', undefined, (draft) => {
                        if (!draft.data) return
                        draft.data = draft.data.filter((item) => item.id !== id)
                    })
                )
            }
        }),
        getTagGroup: build.query<AppResponse<TagGroupListItem[]>, void>({
            query: () => 'tag/group/list',
            providesTags: ['tagGroupList'],
        }),
        addTagGroup: build.mutation<AppResponse<string>, Omit<TagGroupStorage, 'createUserId' | 'id'>>({
            query: data => ({
                url: 'tag/group/add',
                method: 'POST',
                body: data
            }),
            async onQueryStarted(reqData, { dispatch, queryFulfilled }) {
                const { data: updatedPost } = await queryFulfilled
                if (updatedPost.code !== STATUS_CODE.SUCCESS || !updatedPost.data) return

                const id = updatedPost.data
                dispatch(
                    tagApi.util.updateQueryData('getTagGroup', undefined, (draft) => {
                        if (!draft.data) return
                        draft.data.push({ ...reqData, id })
                    })
                )
            }
        }),
        updateTagGroup: build.mutation<AppResponse<string>, Omit<TagGroupStorage, 'createUserId'>>({
            query: data => ({
                url: 'tag/group/update',
                method: 'PUT',
                body: data
            }),
            async onQueryStarted(reqData, { dispatch, queryFulfilled }) {
                const { undo } = dispatch(
                    tagApi.util.updateQueryData('getTagGroup', undefined, (draft) => {
                        if (!draft.data) return
                        if (reqData.title) {
                            const target = draft.data.find(item => item.id === reqData.id)
                            if (target) target.title = reqData.title
                        }
                    })
                )

                const resp = await queryFulfilled
                if (resp.data.code !== STATUS_CODE.SUCCESS) undo()
            }
        }),
        setTagGroup: build.mutation<AppResponse<string>, SetTagGroupReqData>({
            query: data => ({
                url: 'tag/batch/setGroup',
                method: 'POST',
                body: data
            }),
            invalidatesTags: ['tagList'],
        }),
        setTagColor: build.mutation<AppResponse<string>, SetTagColorReqData>({
            query: data => ({
                url: 'tag/batch/setColor',
                method: 'POST',
                body: data
            }),
            invalidatesTags: ['tagList'],
        }),
        deleteTags: build.mutation<AppResponse<string>, DeleteTagReqData>({
            query: data => ({
                url: 'tag/batch/remove',
                method: 'POST',
                body: data
            }),
            async onQueryStarted(reqData, { dispatch, queryFulfilled }) {
                const { data: updatedPost } = await queryFulfilled
                if (updatedPost.code !== STATUS_CODE.SUCCESS) return

                dispatch(
                    tagApi.util.updateQueryData('getTagList', undefined, (draft) => {
                        if (!draft.data) return
                        draft.data = draft.data.filter((item) => !reqData.ids.includes(item.id))
                    })
                )
            }
        }),
        deleteTagGroup: build.mutation<AppResponse<string>, { id: string, method: string }>({
            query: data => ({
                url: `tag/group/${data.id}/${data.method}/removeGroup`,
                method: 'DELETE'
            }),
            invalidatesTags: ['tagGroupList', 'tagList'],
        }),
    })
})

export const {
    useGetTagListQuery,
    useAddTagMutation,
    useUpdateTagMutation,
    useDeleteTagMutation,
    useGetTagGroupQuery,
    useAddTagGroupMutation,
    useUpdateTagGroupMutation,
    useSetTagGroupMutation,
    useSetTagColorMutation,
    useDeleteTagsMutation,
    useDeleteTagGroupMutation,
} = tagApi