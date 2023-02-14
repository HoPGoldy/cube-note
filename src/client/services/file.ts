import { baseApi } from './base'
import { AppResponse } from '@/types/global'

const fileApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        upload: build.mutation<AppResponse, FormData>({
            query: body => ({
                url: 'file/upload',
                method: 'POST',
                body
            })
        }),
    })
})

export const { useUploadMutation } = fileApi