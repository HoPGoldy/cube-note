import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface TabItem {
    /**
     * 选项卡对应的路由
     */
    path: string
    /**
     * 选项卡对应的查询参数
     */
    search?: string
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
        // 移除时不需要手动调整当前 currentTab，因为在 TopTab 组件里会 useEffect 自动调整
        removeTab: (state, action: PayloadAction<string>) => {
            const index = state.tabList.findIndex((item) => item.path === action.payload)
            if (index === -1) return
            state.tabList.splice(index, 1)
        },
        setCurrentTab: (state, action: PayloadAction<string>) => {
            state.currentTabIndex = action.payload
        },
        updateCurrentTabTitle: (state, action: PayloadAction<string>) => {
            const index = state.tabList.findIndex((item) => item.path === state.currentTabIndex)
            if (index === -1 || state.tabList[index].title === action.payload) return
            state.tabList[index].title = action.payload
        }
    },
})

export const { addTab, removeTab, setCurrentTab, updateCurrentTabTitle } = tabSlice.actions

export default tabSlice.reducer
