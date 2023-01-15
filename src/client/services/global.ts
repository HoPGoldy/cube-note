import { baseApi } from './base'
import { AppConfigResp } from '@/types/appConfig'
import { AppResponse } from '@/types/global'

const extendedApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        appConfig: build.query<AppResponse<AppConfigResp>, void>({
            query: () => 'global',
        }),
    })
})

export const { useAppConfigQuery } = extendedApi