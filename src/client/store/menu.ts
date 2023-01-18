import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { ArticleMenuResp, TabTypes } from '@/types/article'

type State = ArticleMenuResp & {
    currentTab: TabTypes
}

const initialState: State = {
    [TabTypes.Sub]: [],
    [TabTypes.Link]: [],
    [TabTypes.Favorite]: [],
    currentTab: TabTypes.Sub,
}

export const menuSlice = createSlice({
    name: 'menu',
    initialState,
    reducers: {
        setMenu: (state, action: PayloadAction<ArticleMenuResp>) => {
            state[TabTypes.Sub] = action.payload[TabTypes.Sub]
            state[TabTypes.Link] = action.payload[TabTypes.Link]
            state[TabTypes.Favorite] = action.payload[TabTypes.Favorite]
        },
        setCurrentMenu: (state, action: PayloadAction<TabTypes>) => {
            state.currentTab = action.payload
        }
    },
})

export const { setMenu, setCurrentMenu } = menuSlice.actions

export default menuSlice.reducer
