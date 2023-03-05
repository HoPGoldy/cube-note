import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { ArticleLinkResp, TabTypes } from '@/types/article.new'

type State = {
    /**
     * 当前选中的哪个标签
     */
    currentTab: TabTypes
    /**
     * 当前显示的哪个文章
     */
    currentArticleId: string
    /**
     * 父文章 id
     */
    parentArticleId: string
    /**
     * 父文章标题
     */
    parentArticleTitle: string
    /**
     * 当前选中的相关文章 id
     */
    selectedRelatedArticleIds: string[]
}

const initialState: State = {
    parentArticleId: '',
    parentArticleTitle: '',
    currentTab: TabTypes.Sub,
    currentArticleId: '',
    selectedRelatedArticleIds: [],
}

export const menuSlice = createSlice({
    name: 'menu',
    initialState,
    reducers: {
        setParentArticle: (state, action: PayloadAction<ArticleLinkResp>) => {
            state.parentArticleId = action.payload.parentArticleId
            state.parentArticleTitle = action.payload.parentArticleTitle
        },
        setCurrentMenu: (state, action: PayloadAction<TabTypes>) => {
            state.currentTab = action.payload
        },
        setCurrentArticle: (state, action: PayloadAction<string>) => {
            state.currentArticleId = action.payload
        },
        setRelatedArticleIds: (state, action: PayloadAction<string[]>) => {
            state.selectedRelatedArticleIds = action.payload
        }
    },
})

export const { setParentArticle, setCurrentMenu, setCurrentArticle, setRelatedArticleIds } = menuSlice.actions

export default menuSlice.reducer
