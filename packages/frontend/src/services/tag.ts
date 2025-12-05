import { queryClient, requestPost } from "./base";
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

/** 查询完整标签列表 */
export const useQueryTagList = () => {
  return useQuery({
    queryKey: ["tagList"],
    queryFn: () => {
      return requestPost<TagListItem[]>("tag/list", {});
    },
  });
};

/** 新增标签 */
export const useAddTag = () => {
  return useMutation({
    mutationFn: (data: AddTagReqData) => {
      return requestPost<number>("tag/add", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tagList"] });
    },
  });
};

/** 更新标签 */
export const useUpdateTag = () => {
  return useMutation({
    mutationFn: (data: TagUpdateReqData) => {
      return requestPost("tag/update", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tagList"] });
    },
  });
};

/** 删除标签 */
export const useDeleteTag = () => {
  return useMutation({
    mutationFn: (id: number) => {
      return requestPost("tag/remove", { id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tagList"] });
    },
  });
};

/** 获取标签分组 */
export const useQueryTagGroup = () => {
  return useQuery({
    queryKey: ["tagGroupList"],
    queryFn: () => {
      return requestPost<TagGroupListItem[]>("tag/group/list", {});
    },
  });
};

/** 新增标签分组 */
export const useAddTagGroup = () => {
  return useMutation({
    mutationFn: (data: Omit<TagGroupStorage, "createUserId" | "id">) => {
      return requestPost<number>("tag/group/add", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tagGroupList"] });
    },
  });
};

/** 更新标签分组 */
export const useUpdateTagGroup = () => {
  return useMutation({
    mutationFn: (data: Omit<TagGroupStorage, "createUserId">) => {
      return requestPost("tag/group/update", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tagGroupList"] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tagList"] });
    },
  });
};

/** 删除标签分组 */
export const useDeleteTagGroup = () => {
  return useMutation({
    mutationFn: (data: { id: number; method: string }) => {
      return requestPost(`tag/group/${data.id}/${data.method}/removeGroup`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tagGroupList"] });
      queryClient.invalidateQueries({ queryKey: ["tagList"] });
    },
  });
};
