import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { AppConfig } from '@/types/appConfig'

interface UserInfo {
    userName: string
}

interface UserState {
    userInfo?: UserInfo
    appConfig?: AppConfig
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
        setAppConfig: (state, action: PayloadAction<AppConfig>) => {
            state.appConfig = action.payload
        }
    },
})

export const { login, logout, setAppConfig } = userSlice.actions

export default userSlice.reducer
