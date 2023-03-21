import { baseApi, requestGet } from './base'
import { AppConfigResp } from '@/types/appConfig'
import { AppResponse } from '@/types/global'
import { useQuery } from 'react-query'

const extendedApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        appConfig: build.query<AppResponse<AppConfigResp>, void>({
            query: () => 'global',
        }),
    })
})

export const useQueryAppConfig = () => {
    return useQuery('appConfig', () => {
        return requestGet<AppConfigResp>('global')
    })
}

export const { useAppConfigQuery } = extendedApi