import qs from 'qs'
import { AppResponse } from '@/types/global'
import { Notify } from 'react-vant'
import { STATUS_CODE } from '@/config'
import { createReplayAttackHeader } from '@/utils/crypto'
import { RootState, store } from '@/client/store'
import { logout } from '@/client/store/user'
import { BaseQueryFn, createApi, FetchArgs, fetchBaseQuery, FetchBaseQueryError } from '@reduxjs/toolkit/query/react'

/**
 * 后端地址
 */
const BASE_URL = '/api'

/**
 * 获取当前正在使用的 token
 */
export const getToken = () => localStorage.getItem('cube-note-token')

/**
 * 设置请求中携带的 token
 */
export const setToken = (newToken: string | null) => {
    if (!newToken) {
        localStorage.removeItem('cube-note-token')
        return
    }
    localStorage.setItem('cube-note-token', newToken)
}

/**
 * 基础请求器
 *
 * @param url 请求 url
 * @param requestInit 请求初始化配置
 */
const fetcher = async <T = unknown>(url: string, requestInit: RequestInit = {}, body?: Record<string, any>): Promise<T> => {
    const token = getToken()
    const bodyData = body ? JSON.stringify(body) : ''
    const init = {
        ...requestInit,
        headers: { 'Content-Type': 'application/json', ...requestInit.headers }
    }
    if (bodyData) init.body = bodyData
    if (token) (init.headers as any).Authorization = `Bearer ${token}`

    const pureUrl = url.startsWith('/') ? url : ('/' + url)
    const fullUrl = BASE_URL + pureUrl

    const replayAttackSecret = sessionStorage.getItem('replayAttackSecret')
    if (replayAttackSecret) {
        const fixReplayAttackHeaders = createReplayAttackHeader(fullUrl, bodyData || '{}', replayAttackSecret)
        init.headers = { ...init.headers, ...fixReplayAttackHeaders }
    }

    const resp = await fetch(fullUrl, init)

    if (resp.status === 401 && location.pathname !== '/login') {
        setToken(null)
        store.dispatch(setUserState(undefined))
    }

    const data: AppResponse<T> = await resp.json()
    if (data.code !== 200) {
        if (data.code === STATUS_CODE.NEED_CODE) {
            Notify.show({ type: 'warning', message: data.msg || '未知错误' })
        }
        else {
            Notify.show({ type: 'danger', message: data.msg || '未知错误' })
        }
        throw data
    }

    return data.data as T
}

/**
 * 是否为标准后端数据结构
 */
const isAppResponse = (data: unknown): data is AppResponse<unknown> => {
    return typeof data === 'object' && data !== null && 'code' in data
}

const baseQueryCore = fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders(headers, { getState }) {
        const state = getState() as RootState

        const { token } = state.user
        if (token) headers.set('Authorization', `Bearer ${token}`)

        return headers
    },
})

const baseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
    const resp = await baseQueryCore(args, api, extraOptions)

    if (resp.error && resp.error.status === 401 && location.pathname !== '/login') {
        api.dispatch(logout())
    }

    if (!isAppResponse(resp.data)) {
        return resp
    }

    const { code, msg } = resp.data

    if (code !== 200) {
        Notify.show({ type: 'danger', message: msg || '未知错误' })
        resp.error = { status: code as number, data: msg }
    }

    return resp
}

export const baseApi = createApi({
    baseQuery,
    endpoints: () => ({}),
})

/**
 * 使用 GET 发起请求
 *
 * @param url 请求路由
 * @param query 请求的参数，会拼接到 url 后面
 */
export const sendGet = async function <T>(url: string, query = {}) {
    const requestUrl = url + qs.stringify(query, { addQueryPrefix: true, arrayFormat: 'comma' })
    const config: RequestInit = { method: 'GET' }

    return fetcher<T>(requestUrl, config)
}

/**
 * 使用 POST 发起请求
 *
 * @param url 请求路由
 * @param body 请求参数，会放在 body 里
 */
export const sendPost = async function <T>(url: string, body = {}) {
    const config: RequestInit = { method: 'POST'}
    return fetcher<T>(url, config, body)
}

/**
 * 使用 PUT 发起请求
 *
 * @param url 请求路由
 * @param body 请求参数，会放在 body 里
 */
export const sendPut = async function <T>(url: string, body = {}) {
    const config: RequestInit = { method: 'PUT' }
    return fetcher<T>(url, config, body)
}

/**
 * 使用 DELETE 发起请求
 *
 * @param url 请求路由
 * @param body 请求参数，会放在 body 里
 */
export const sendDelete = async function <T>(url: string, body = {}) {
    const config: RequestInit = { method: 'DELETE' }
    return fetcher<T>(url, config, body)
}
