import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { AppTheme, FrontendUserInfo, LoginSuccessResp } from '@/types/user'
import Cookies from 'js-cookie'

interface UserState {
    userInfo?: FrontendUserInfo
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
            Cookies.set('cube-note-token', token)
        },
        logout: (state) => {
            state.token = undefined
            state.replayAttackSecret = undefined
            state.userInfo = undefined
            localStorage.removeItem('cube-note-token')
            Cookies.remove('cube-note-token')
        },
        changeTheme: (state, action: PayloadAction<AppTheme>) => {
            if (!state.userInfo) return
            state.userInfo.theme = action.payload
            localStorage.setItem('cube-note-theme', action.payload)
        }
    },
})

export const { login, logout, changeTheme } = userSlice.actions

/**
 * 从用户信息中获取主题色
 * 在用户信息没有获取到时，从 localStorage 和默认值获取
 */
export const getUserTheme = (userInfo?: FrontendUserInfo): AppTheme => {
    return userInfo?.theme
        || localStorage.getItem('cube-note-theme') as AppTheme
        || AppTheme.Light
}

export default userSlice.reducer
