export interface TagStorage {
    id: string
    title: string
    color: string
    groupId?: string
    createUserId: number
}

export interface TagListItem {
    id: string
    title: string
    color: string
    groupId?: string
}

export type TagUpdateReqData = Partial<TagListItem>

export interface TagGroupStorage {
    id: string
    createUserId: number
    title: string
}

export interface TagGroupListItem {
    id: string
    title: string
}

/** 批量设置标签颜色 */
export interface SetTagColorReqData {
    ids: string[]
    color: string
}

/** 批量设置标签分组 */
export interface SetTagGroupReqData {
    ids: string[]
    groupId: string
}

/** 批量删除标签 */
export interface DeleteTagReqData {
    ids: string[]
}
