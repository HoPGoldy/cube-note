import { baseApi } from './base'
import { AppConfig } from '@/types/appConfig'

const extendedApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        appConfig: build.query<AppConfig, void>({
            query: () => 'global',
        }),
    })
})

export const { useAppConfigQuery } = extendedApi