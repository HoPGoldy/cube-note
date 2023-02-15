import { baseApi } from './base'
import { AppResponse } from '@/types/global'
import { FileStorage } from '@/types/file'

const fileApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getFile: build.query<AppResponse<FileStorage>, string>({
            query: (id) => `file/${id}`
        }),
        upload: build.mutation<AppResponse<FileStorage[]>, FormData>({
            query: body => ({
                url: 'file/upload',
                method: 'POST',
                body
            })
        }),
    })
})

export const { useLazyGetFileQuery, useUploadMutation } = fileApi