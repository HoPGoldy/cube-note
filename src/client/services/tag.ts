import { baseApi } from './base'
import { AppResponse } from '@/types/global'
import { TagListItem, TagStorage } from '@/types/tag'
import { STATUS_CODE } from '@/config'

export const tagApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getTagList: build.query<AppResponse<TagListItem[]>, void>({
            query: () => 'tag/list',
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
    })
})

export const {
    useGetTagListQuery,
    useAddTagMutation,
    useDeleteTagMutation
} = tagApi