import { baseApi } from './base'
import { AppResponse } from '@/types/global'
import { LoginPostData, LoginResp } from '@/types/user'

const extendedApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        postLogin: build.mutation<AppResponse<LoginResp>, LoginPostData>({
            query: body => ({
                url: 'user/login',
                method: 'POST',
                body
            })
        }),
        createAdmin: build.mutation<AppResponse, LoginPostData>({
            query: body => ({
                url: 'user/createAdmin',
                method: 'POST',
                body
            })
        }),
    })
})

export const { usePostLoginMutation, useCreateAdminMutation } = extendedApi