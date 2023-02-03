import { baseApi } from './base'
import { AppResponse } from '@/types/global'
import { LoginReqData, LoginResp } from '@/types/user'

const extendedApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getUserInfo: build.query<AppResponse<LoginResp>, void>({
            query: () => 'user/getInfo'
        }),
        postLogin: build.mutation<AppResponse<LoginResp>, LoginReqData>({
            query: body => ({
                url: 'user/login',
                method: 'POST',
                body
            })
        }),
        createAdmin: build.mutation<AppResponse, LoginReqData>({
            query: body => ({
                url: 'user/createAdmin',
                method: 'POST',
                body
            })
        }),
    })
})

export const { useLazyGetUserInfoQuery, usePostLoginMutation, useCreateAdminMutation } = extendedApi