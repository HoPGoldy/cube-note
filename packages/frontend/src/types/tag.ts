export interface TagStorage {
  id: number;
  title: string;
  color: string;
  createUserId: number;
}

export interface TagListItem {
  id: string;
  title: string;
  color: string;
}

export type TagUpdateReqData = Partial<TagListItem>;

/** 批量设置标签颜色 */
export interface SetTagColorReqData {
  tagIds: string[];
  color: string;
}

/** 批量删除标签 */
export interface DeleteTagReqData {
  ids: string[];
}

/** 请求 - 添加标签 */
export type AddTagReqData = Omit<TagStorage, "createUserId" | "id">;
