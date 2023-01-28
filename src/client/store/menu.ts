import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { ArticleLinkResp, ArticleMenuItem, ArticleMenuResp, TabTypes } from '@/types/article'

type State = ArticleMenuResp & {
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
}

const initialState: State = {
    [TabTypes.Sub]: [],
    [TabTypes.Link]: [],
    [TabTypes.Favorite]: [],
    parentArticleId: '',
    parentArticleTitle: '',
    currentTab: TabTypes.Sub,
    currentArticleId: ''
}

export const menuSlice = createSlice({
    name: 'menu',
    initialState,
    reducers: {
        setLinkMenu: (state, action: PayloadAction<ArticleLinkResp>) => {
            state[TabTypes.Sub] = action.payload.childrenArticles
            state[TabTypes.Link] = action.payload.relatedArticles
            state.parentArticleId = action.payload.parentArticleId
            state.parentArticleTitle = action.payload.parentArticleTitle
        },
        setFavoriteMenu: (state, action: PayloadAction<ArticleMenuItem[]>) => {
            state[TabTypes.Favorite] = action.payload
        },
        setCurrentMenu: (state, action: PayloadAction<TabTypes>) => {
            state.currentTab = action.payload
        },
        setCurrentArticle: (state, action: PayloadAction<string>) => {
            state.currentArticleId = action.payload
        }
    },
})

export const { setLinkMenu, setFavoriteMenu, setCurrentMenu, setCurrentArticle } = menuSlice.actions

export default menuSlice.reducer
