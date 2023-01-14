import { baseApi } from './base'
import { AppResponse } from '@/types/global'
import { LoginPostData } from '@/types/user'

const extendedApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        createAdmin: build.mutation<AppResponse, LoginPostData>({
            query: body => ({
                url: 'user/createAdmin',
                method: 'POST',
                body
            })
        }),
    })
})

export const { useCreateAdminMutation } = extendedApi