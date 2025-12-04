import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { requestGet, requestPost } from "./base";

// Types
export interface Tag {
  id: string;
  title: string;
  color: string;
  groupId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TagGroup {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TagCreateRequest {
  title: string;
  color: string;
  groupId?: string;
}

export interface TagUpdateRequest {
  title?: string;
  color?: string;
  groupId?: string;
}

export interface TagGroupCreateRequest {
  title: string;
}

export interface TagGroupUpdateRequest {
  title?: string;
}

export interface TagListResponse {
  tags: Tag[];
  groups: TagGroup[];
}

// API Functions
const createTag = (data: TagCreateRequest) =>
  requestPost<Tag>("tag/create", data);

const updateTag = (id: string, data: TagUpdateRequest) =>
  requestPost<Tag>(`tag/${id}`, data);

const deleteTag = (id: string) => requestPost<void>(`tag/${id}`, {});

const getTagList = () => requestGet<TagListResponse>("tag/list");

const createTagGroup = (data: TagGroupCreateRequest) =>
  requestPost<TagGroup>("tag-group/create", data);

const updateTagGroup = (id: string, data: TagGroupUpdateRequest) =>
  requestPost<TagGroup>(`tag-group/${id}`, data);

const deleteTagGroup = (id: string) => requestPost<void>(`tag-group/${id}`, {});

// React Query Hooks
export const useCreateTag = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });
};

export const useUpdateTag = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TagUpdateRequest }) =>
      updateTag(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });
};

export const useDeleteTag = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });
};

export const useGetTagList = () =>
  useQuery({
    queryKey: ["tags"],
    queryFn: getTagList,
  });

export const useCreateTagGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTagGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });
};

export const useUpdateTagGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TagGroupUpdateRequest }) =>
      updateTagGroup(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });
};

export const useDeleteTagGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTagGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });
};
