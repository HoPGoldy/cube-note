import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { AppConfigResp } from '@/types/appConfig'

interface UserState {
    appConfig?: AppConfigResp
}

const initialState: UserState = {
}

export const globalSlice = createSlice({
    name: 'global',
    initialState,
    reducers: {
        setAppConfig: (state, action: PayloadAction<AppConfigResp>) => {
            state.appConfig = action.payload
        },
        initSuccess: (state) => {
            state.appConfig?.needInit && (state.appConfig.needInit = false)
        },
    },
})

export const { setAppConfig, initSuccess } = globalSlice.actions

export default globalSlice.reducer
