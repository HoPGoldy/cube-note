export interface TagStorage {
    title: string
    color: string
    groupId?: string
}

export interface TagListItem {
    _id: string
    title: string
    color: string
    groupId?: string
}

export type TagUpdateReqData = Partial<TagStorage> & {
    id: string
}

export interface TagGroupStorage {
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
