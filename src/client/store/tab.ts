import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface TabItem {
    /**
     * 选项卡对应的路由
     */
    id: string
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
        setTabList: (state, action: PayloadAction<TabItem[]>) => {
            state.tabList = action.payload
        },
        addTab: (state, action: PayloadAction<TabItem>) => {
            state.tabList.push(action.payload)
            state.currentTabIndex = action.payload.id
        },
        // 移除时不需要手动调整当前 currentTab，因为在 TopTab 组件里会 useEffect 自动调整
        removeTab: (state, action: PayloadAction<string[]>) => {
            if (action.payload.length <= 0) return
            state.tabList = state.tabList.filter(item => !action.payload.includes(item.id))
        },
        setCurrentTab: (state, action: PayloadAction<string>) => {
            state.currentTabIndex = action.payload
        },
        updateCurrentTab: (state, action: PayloadAction<Partial<TabItem>>) => {
            const targetTab = state.tabList.find(item => item.id === state.currentTabIndex)
            if (!targetTab) return

            if (action.payload.title && action.payload.title !== targetTab.title) {
                targetTab.title = action.payload.title
            }
            if (action.payload.search && action.payload.search !== targetTab.search) {
                targetTab.search = action.payload.search
            }
        }
    },
})

export const { setTabList, addTab, removeTab, setCurrentTab, updateCurrentTab } = tabSlice.actions

export default tabSlice.reducer
