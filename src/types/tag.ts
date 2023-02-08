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

export type TagGroupUpdateReqData = Partial<TagGroupStorage> & {
    id: string
}

export interface TagGroupStorage {
    title: string
}

export interface TagGroupListItem {
    _id: string
    title: string
}

/** 批量设置标签颜色 */
export interface SetTagColorReqData {
    ids: string[]
    color: string
}

/** 批量设置标签分组 */
export interface SetTagGroup {
    ids: string[]
    groupId: string
}

export interface SetTagGroupReqData {
    changeList: SetTagGroup[]
}

/** 批量删除标签 */
export interface DeleteTagReqData {
    ids: string[]
}

export type FontendTagListItem = TagListItem & {
    id: string
}