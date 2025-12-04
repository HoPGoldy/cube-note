import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { requestGet, requestPost } from "./base";

// 类型定义
export interface ProbeEnvItem {
  id: string;
  key: string;
  value: string;
  isSecret: boolean;
  desc: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProbeEnvListResponse {
  list: ProbeEnvItem[];
}

export interface ProbeEnvCreateRequest {
  key: string;
  value: string;
  isSecret?: boolean;
  desc?: string;
}

export interface ProbeEnvUpdateRequest {
  id: string;
  key?: string;
  value?: string;
  isSecret?: boolean;
  desc?: string | null;
}

export interface ProbeEnvDeleteRequest {
  id: string;
}

// API 调用
const getProbeEnvList = () =>
  requestGet<ProbeEnvListResponse>("probe-env/list");

const addProbeEnv = (data: ProbeEnvCreateRequest) =>
  requestPost<{ success: boolean }>("probe-env/add", data);

const updateProbeEnv = (data: ProbeEnvUpdateRequest) =>
  requestPost<{ success: boolean }>("probe-env/update", data);

const deleteProbeEnv = (data: ProbeEnvDeleteRequest) =>
  requestPost<{ success: boolean }>("probe-env/delete", data);

// React Query Hooks
export const useGetProbeEnvList = () => {
  return useQuery({
    queryKey: ["probe-env", "list"],
    queryFn: getProbeEnvList,
  });
};

export const useAddProbeEnv = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addProbeEnv,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["probe-env"] });
    },
  });
};

export const useUpdateProbeEnv = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProbeEnv,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["probe-env"] });
    },
  });
};

export const useDeleteProbeEnv = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProbeEnv,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["probe-env"] });
    },
  });
};
