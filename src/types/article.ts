export interface ArticleStorage {
    title: string
    content: string
    createTime: number
    updateTime: number
    /**
     * 父级文章 id
     * 如果是跟节点的话，就没有这个属性
     */
    parentArticleId?: string
    /**
     * 下属文章 id
     */
    childrenArticleIds: string[]
    /**
     * 相关文章 id
     */
    relatedArticleIds: string[]
    /**
     * 相关 tag id
     */
    tagIds: string[]
}

export interface AddArticlePostData {
    title: string
    content: string
    parentId: string
}

export interface ArticleMenuItem {
    id: string
    title: string
}

export enum TabTypes {
    Sub = 'sub',
    Link = 'link',
    Favorite = 'favorite',
}

export type ArticleMenuResp = {
    [key in TabTypes]: ArticleMenuItem[]
}

export interface ArticleContentResp {
    id: string
    title: string
    content: string
    createTime: number
    updateTime: number
    tagIds: string[]
}

export interface ArticleLinkResp {
    parentArticleId?: string
    childrenArticleIds: string[]
    relatedArticleIds: string[]
}