import { configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from 'react-redux'
import type { TypedUseSelectorHook } from 'react-redux'
import { setupListeners } from '@reduxjs/toolkit/query/react'
import { baseApi } from '../services/base'
import userReducer from './user'

export const store = configureStore({
    reducer: {
        [baseApi.reducerPath]: baseApi.reducer,
        user: userReducer,
    },
    middleware: getDefaultMiddleware => getDefaultMiddleware().concat(baseApi.middleware),
})

setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// 为 useDispatch 添加类型
export const useAppDispatch: () => AppDispatch = useDispatch

// 为 useSelector 添加类型
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
