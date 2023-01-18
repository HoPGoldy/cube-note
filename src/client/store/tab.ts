import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface TabItem {
    /**
     * 选项卡对应的路由
     */
    path: string
    /**
     * 显示在标签选项卡上的文字
     */
    title: string
}

type State = {
    /**
     * 当前的所有选项卡
     */
    tabList: TabItem[]
    /**
     * 当前选中的选项卡的 path 属性
     */
    currentTabIndex: string
}

const initialState: State = {
    tabList: [],
    currentTabIndex: '',
}

export const tabSlice = createSlice({
    name: 'tab',
    initialState,
    reducers: {
        addTab: (state, action: PayloadAction<TabItem>) => {
            state.tabList.push(action.payload)
            state.currentTabIndex = action.payload.path
        },
        removeTab: (state, action: PayloadAction<string>) => {
            const index = state.tabList.findIndex((item) => item.path === action.payload)
            if (index === -1) return
            state.tabList.splice(index, 1)
            if (action.payload === state.currentTabIndex) {
                state.currentTabIndex = state.tabList[index- 1].path
            }
        },
        setCurrentTab: (state, action: PayloadAction<string>) => {
            state.currentTabIndex = action.payload
        }
    },
})

export const { addTab, removeTab, setCurrentTab } = tabSlice.actions

export default tabSlice.reducer
