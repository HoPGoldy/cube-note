import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { AppConfigResp } from '@/types/appConfig'

interface UserInfo {
    userName: string
}

interface UserState {
    userInfo?: UserInfo
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
        login: (state, action: PayloadAction<UserState>) => {
            const { token, replayAttackSecret } = action.payload
            state.token = token
            state.replayAttackSecret = replayAttackSecret
            token && localStorage.setItem('cube-note-token', token)
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
