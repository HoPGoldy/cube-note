import { queryClient, requestGet, requestPost } from "./base";
import {
  AddTagReqData,
  DeleteTagReqData,
  SetTagColorReqData,
  SetTagGroupReqData,
  TagGroupListItem,
  TagGroupStorage,
  TagListItem,
  TagUpdateReqData,
} from "@/types/tag";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  addItemToList,
  deleteItemFromList,
  updateItemToList,
} from "@/utils/query-cache-update";

/** 查询完整标签列表 */
export const useQueryTagList = () => {
  return useQuery({
    queryKey: ["tagList"],
    queryFn: () => {
      return requestGet<TagListItem[]>("tag/list");
    },
  });
};

/** 新增标签 */
export const useAddTag = () => {
  return useMutation({
    mutationFn: (data: AddTagReqData) => {
      return requestPost<number>("tag/add", data);
    },
    onSuccess: (resp, data) => {
      addItemToList("tagList", { ...data, id: resp.data });
    },
  });
};

/** 更新标签 */
export const useUpdateTag = () => {
  return useMutation({
    mutationFn: (data: TagUpdateReqData) => {
      return requestPost("tag/update", data);
    },
    onSuccess: (resp, data) => {
      updateItemToList("tagList", data, (item) => item.id === data.id);
    },
  });
};

/** 删除标签 */
export const useDeleteTag = () => {
  return useMutation({
    mutationFn: (id: number) => {
      return requestPost(`tag/${id}/remove`);
    },
    onSuccess: (resp, id) => {
      deleteItemFromList<TagListItem>("tagList", (item) => item.id === id);
    },
  });
};

/** 获取标签分组 */
export const useQueryTagGroup = () => {
  return useQuery({
    queryKey: ["tagGroupList"],
    queryFn: () => {
      return requestGet<TagGroupListItem[]>("tag/group/list");
    },
  });
};

/** 新增标签分组 */
export const useAddTagGroup = () => {
  return useMutation({
    mutationFn: (data: Omit<TagGroupStorage, "createUserId" | "id">) => {
      return requestPost<number>("tag/group/add", data);
    },
    onSuccess: (resp, data) => {
      addItemToList("tagGroupList", { ...data, id: resp.data });
    },
  });
};

/** 更新标签分组 */
export const useUpdateTagGroup = () => {
  return useMutation({
    mutationFn: (data: Omit<TagGroupStorage, "createUserId">) => {
      return requestPost("tag/group/update", data);
    },
    onSuccess: (resp, data) => {
      updateItemToList("tagGroupList", data, (item) => item.id === data.id);
    },
  });
};

/** 批量设置标签的所属分组 */
export const useBatchSetTagGroup = () => {
  return useMutation({
    mutationFn: (data: SetTagGroupReqData) => {
      return requestPost("tag/batch/setGroup", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tagList"] });
    },
  });
};

/** 批量设置标签的颜色 */
export const useBatchSetTagColor = () => {
  return useMutation({
    mutationFn: (data: SetTagColorReqData) => {
      return requestPost("tag/batch/setColor", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tagList"] });
    },
  });
};

/** 批量删除标签 */
export const useBatchDeleteTag = () => {
  return useMutation({
    mutationFn: (data: DeleteTagReqData) => {
      return requestPost("tag/batch/remove", data);
    },
    onSuccess: (resp, data) => {
      deleteItemFromList<TagListItem>("tagList", (item) =>
        data.ids.includes(item.id),
      );
    },
  });
};

/** 删除标签分组 */
export const useDeleteTagGroup = () => {
  return useMutation({
    mutationFn: (data: { id: number; method: string }) => {
      return requestPost(`tag/group/${data.id}/${data.method}/removeGroup`);
    },
    onSuccess: (resp, { id }) => {
      deleteItemFromList<TagGroupListItem>(
        "tagGroupList",
        (item) => item.id === id,
      );
      queryClient.invalidateQueries({ queryKey: ["tagList"] });
    },
  });
};
