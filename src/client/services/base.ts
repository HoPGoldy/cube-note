import { AppResponse } from '@/types/global'
import { store } from '@/client/store'
import { logout } from '@/client/store/user'
import { BaseQueryFn, createApi } from '@reduxjs/toolkit/query/react'
import { message } from '../utils/message'
import { createReplayAttackHeaders } from '@/utils/crypto'
import axios from 'axios'
import type { AxiosRequestConfig, AxiosError } from 'axios'
import { QueryClient } from 'react-query'

/**
 * 是否为标准后端数据结构
 */
const isAppResponse = (data: unknown): data is AppResponse<unknown> => {
    return typeof data === 'object' && data !== null && 'code' in data
}

export const axiosInstance = axios.create({ baseURL: '/api/' })

axiosInstance.interceptors.request.use(config => {
    const state = store.getState()
    const { token, replayAttackSecret } = state.user

    // 附加 jwt header
    if (token) config.headers.Authorization = `Bearer ${token}`
    // 附加防重放攻击 header
    if (replayAttackSecret) {
        const raHeaders = createReplayAttackHeaders(`${config.baseURL}${config.url}`, replayAttackSecret)
        Object.assign(config.headers, raHeaders)
    }

    return config
})

axiosInstance.interceptors.response.use(resp => {
    if (!isAppResponse(resp.data)) return resp
    const { code, msg } = resp.data

    if (code === 401) {
        store.dispatch(logout())
    } else if (code !== 200) {
        const type = code === 401 ? 'warning' : 'danger'
        message(type, msg || '未知错误')
    }

    return resp
})

export const requestGet = async <T = any>(url: string, config?: AxiosRequestConfig) => {
    const resp = await axiosInstance.get<AppResponse<T>>(url, config)
    return resp.data
}

export const requestPost = async <T = any, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>) => {
    const resp = await axiosInstance.post<AppResponse<T>>(url, data, config)
    return resp.data
}

export const queryClient = new QueryClient()

const axiosBaseQuery: BaseQueryFn<
    {
        url: string
        method: AxiosRequestConfig['method']
        body?: AxiosRequestConfig['data']
        params?: AxiosRequestConfig['params']
    } | string
> = async arg => {
    // RTK query 的 arg 有可能只有一个 url 字符串，所以这里需要处理下
    const reqArgs = typeof arg === 'string' ? { url: arg, method: 'GET', body: undefined, params: undefined } : arg
    const { url, method, body, params } = reqArgs

    try {
        const result = await axiosInstance({ url, method, data: body, params })
        return { data: result.data }
    } catch (axiosError) {
        const err = axiosError as AxiosError
        return {
            error: {
                status: err.response?.status,
                data: err.response?.data || err.message,
            },
        }
    }
}


export const baseApi = createApi({
    baseQuery: axiosBaseQuery,
    endpoints: () => ({}),
    tagTypes: ['menu', 'articleContent', 'articleLink', 'articleRelated', 'favorite', 'tagList', 'tagGroupList']
})
