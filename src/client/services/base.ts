import { AppResponse } from '@/types/global'
import { store } from '@/client/store'
import { logout } from '@/client/store/user'
import { BaseQueryFn, createApi, FetchArgs, fetchBaseQuery, FetchBaseQueryError } from '@reduxjs/toolkit/query/react'
import { message } from '../utils/message'
import { setReplayAttackHeaders } from '@/utils/crypto'

/**
 * 是否为标准后端数据结构
 */
const isAppResponse = (data: unknown): data is AppResponse<unknown> => {
    return typeof data === 'object' && data !== null && 'code' in data
}

const baseQueryCore = fetchBaseQuery({
    baseUrl: '/api',
    fetchFn: async (args, init) => {
        const state = store.getState()
        const { token, replayAttackSecret } = state.user

        const headers = (args as Request)?.headers
        if (headers) {
            if (token) headers.set('Authorization', `Bearer ${token}`)
            if (replayAttackSecret) setReplayAttackHeaders(args as Request, replayAttackSecret)
        }

        return await fetch(args, init)
    }
})

const baseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
    const resp = await baseQueryCore(args, api, extraOptions)
    if (!isAppResponse(resp.data)) {
        return resp
    }

    const { code, msg } = resp.data

    if (code !== 200) {
        const type = code === 401 ? 'warning' : 'danger'
        message(type, msg || '未知错误')
        resp.error = { status: code as number, data: msg }
    }

    if (resp.error && resp.error.status === 401) {
        api.dispatch(logout())
    }

    return resp
}

export const baseApi = createApi({
    baseQuery,
    endpoints: () => ({}),
    tagTypes: ['menu', 'articleContent', 'articleLink', 'articleRelated', 'favorite', 'tagList', 'tagGroupList']
})
