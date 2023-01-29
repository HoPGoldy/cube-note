export interface ArticleStorage {
    title: string
    content: string
    createTime: number
    updateTime: number
    /**
     * 祖先文章 id 列表
     * 如果是跟节点的话，就没有这个属性
     * 会包含当前文章的所有祖先节点
     */
    parentArticleIds: string[]
    /**
     * 相关文章 id 列表
     */
    relatedArticleIds: string[]
    /**
     * 相关 tag id 列表
     */
    tagIds: string[]
}

export interface AddArticlePostData {
    title: string
    content: string
    parentId: string
}

export type UpdateArticlePostData = Partial<AddArticlePostData> & {
    id: string
}

export interface DeleteArticleMutation {
    id: string
    force: boolean
}

export interface ArticleMenuItem {
    _id: string
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
    _id: string
    title: string
    content: string
    createTime: number
    updateTime: number
    tagIds: string[]
}

export interface ArticleLinkResp {
    parentArticleId: string
    parentArticleTitle: string
    childrenArticles: ArticleMenuItem[]
    relatedArticles: ArticleMenuItem[]
}

export interface ArticleTreeNode {
    key: string
    label: string
    children?: ArticleTreeNode[]
    onTitleClick?: (args: { key: string }) => void
}

export interface ArticleDeleteResp {
    deletedArticleIds: string[]
    parentArticleId: string
}