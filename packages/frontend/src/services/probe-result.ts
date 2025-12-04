import { CommonListQueryDto } from "@/types/global";
import { queryClient, requestPost } from "./base";
import { useMutation, useQuery } from "@tanstack/react-query";

export interface ProbeResultListQueryDto extends CommonListQueryDto {
  endPointId?: string;
  hostId?: string;
  limit?: number;
  refetchInterval?: number;
}

export const useGetProbeResultList = (query?: ProbeResultListQueryDto) => {
  const { refetchInterval, ...params } = query || {};

  return useQuery({
    queryKey: ["probe-result/list", params],
    enabled: params.endPointId
      ? !!params.endPointId
      : params.hostId
        ? !!params.hostId
        : true,
    refetchInterval,
    queryFn: () => requestPost("probe-result/list", params),
  });
};

export const useGetLatestProbeResults = () => {
  return useQuery({
    queryKey: ["probe-result/latest"],
    queryFn: () => requestPost("probe-result/latest", {}),
  });
};

export const useGetProbeResultDetail = (id: string) => {
  return useQuery({
    queryKey: ["probe-result/detail", id],
    enabled: !!id,
    queryFn: () => requestPost("probe-result/get", { id }),
  });
};

export interface ProbeResultCreateDto {
  endPointId: string;
  status?: number;
  responseTime?: number;
  timestamp?: string;
  success: boolean;
  message?: string;
}

export const useCreateProbeResult = () => {
  return useMutation({
    mutationFn: (data: ProbeResultCreateDto) =>
      requestPost("probe-result/create", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["probe-result/list"] });
      queryClient.invalidateQueries({ queryKey: ["probe-result/latest"] });
    },
  });
};

export const useDeleteProbeResult = () => {
  return useMutation({
    mutationFn: (id: string) => requestPost("probe-result/delete", { id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["probe-result/list"] });
      queryClient.invalidateQueries({ queryKey: ["probe-result/latest"] });
    },
  });
};
