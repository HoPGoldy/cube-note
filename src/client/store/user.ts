import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { AppConfigResp } from '@/types/appConfig'
import { FrontendUserInfo, LoginSuccessResp } from '@/types/user'

interface UserState {
    userInfo?: FrontendUserInfo
    appConfig?: AppConfigResp
    replayAttackSecret?: string
    token?: string
}

const initialState: UserState = {
    token: localStorage.getItem('cube-note-token') || undefined
}

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        login: (state, action: PayloadAction<LoginSuccessResp>) => {
            const { token, replayAttackSecret, ...userInfo } = action.payload
            state.token = token
            state.replayAttackSecret = replayAttackSecret
            state.userInfo = userInfo
            localStorage.setItem('cube-note-token', token)
        },
        logout: (state) => {
            state.token = undefined
            state.replayAttackSecret = undefined
            state.userInfo = undefined
            localStorage.removeItem('cube-note-token')
        },
        setAppConfig: (state, action: PayloadAction<AppConfigResp>) => {
            state.appConfig = action.payload
        },
        initSuccess: (state) => {
            state.appConfig?.needInit && (state.appConfig.needInit = false)
        }
    },
})

export const { login, logout, setAppConfig, initSuccess } = userSlice.actions

export default userSlice.reducer
