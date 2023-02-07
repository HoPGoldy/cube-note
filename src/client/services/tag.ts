import { baseApi } from './base'
import { AppResponse } from '@/types/global'
import { DeleteTagReqData, SetTagGroupReqData, TagGroupListItem, TagGroupStorage, TagGroupUpdateReqData, TagListItem, TagStorage } from '@/types/tag'
import { STATUS_CODE } from '@/config'

export const tagApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getTagList: build.query<AppResponse<TagListItem[]>, void>({
            query: () => 'tag/list',
            providesTags: ['tagList'],
        }),
        addTag: build.mutation<AppResponse<string>, TagStorage>({
            query: data => ({
                url: 'tag/add',
                method: 'POST',
                body: data
            }),
            async onQueryStarted(reqData, { dispatch, queryFulfilled }) {
                const { data: updatedPost } = await queryFulfilled
                if (updatedPost.code !== STATUS_CODE.SUCCESS || !updatedPost.data) return

                const _id = updatedPost.data
                dispatch(
                    tagApi.util.updateQueryData('getTagList', undefined, (draft) => {
                        if (!draft.data) return
                        draft.data.push({ _id, ...reqData })
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
                        draft.data = draft.data.filter((item) => item._id !== id)
                    })
                )
            }
        }),
        getTagGroup: build.query<AppResponse<TagGroupListItem[]>, void>({
            query: () => 'tag/group/list',
            providesTags: ['tagGroupList'],
        }),
        addTagGroup: build.mutation<AppResponse<string>, TagGroupStorage>({
            query: data => ({
                url: 'tag/group/add',
                method: 'POST',
                body: data
            }),
            async onQueryStarted(reqData, { dispatch, queryFulfilled }) {
                const { data: updatedPost } = await queryFulfilled
                if (updatedPost.code !== STATUS_CODE.SUCCESS || !updatedPost.data) return

                const _id = updatedPost.data
                dispatch(
                    tagApi.util.updateQueryData('getTagGroup', undefined, (draft) => {
                        if (!draft.data) return
                        draft.data.push({ _id, ...reqData })
                    })
                )
            }
        }),
        updateTagGroup: build.mutation<AppResponse<string>, TagGroupUpdateReqData>({
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
                            const target = draft.data.find(item => item._id === reqData.id)
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
                        draft.data = draft.data.filter((item) => !reqData.ids.includes(item._id))
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
    useDeleteTagMutation,
    useGetTagGroupQuery,
    useAddTagGroupMutation,
    useUpdateTagGroupMutation,
    useSetTagGroupMutation,
    useDeleteTagsMutation,
    useDeleteTagGroupMutation,
} = tagApi