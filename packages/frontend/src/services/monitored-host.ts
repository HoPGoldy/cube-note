import { CommonListQueryDto } from "@/types/global";
import { queryClient, requestPost } from "./base";
import { useMutation, useQuery } from "@tanstack/react-query";

export interface MonitoredHostListQueryDto extends CommonListQueryDto {}

export const useGetMonitoredHostList = (query: MonitoredHostListQueryDto) => {
  return useQuery({
    queryKey: ["monitored-host/list", query],
    queryFn: () => requestPost("monitored-host/list", query),
    refetchInterval: 5 * 1000,
  });
};

export const useGetMonitoredHostDetail = (id: string) => {
  const result = useQuery({
    queryKey: ["monitored-host/detail", id],
    enabled: !!id,
    queryFn: () => requestPost("monitored-host/get", { id }),
  });
  return { ...result, hostDetail: result.data?.data };
};

export interface MonitoredHostCreateDto {
  name: string;
  url?: string;
  headers?: any;
  enabled?: boolean;
  // 通知配置
  notifyEnabled?: boolean;
  notifyFailureCount?: number;
  notifyCooldownMin?: number;
  notifyChannelIds?: string[];
}

export const useCreateMonitoredHost = () => {
  return useMutation({
    mutationFn: (data: MonitoredHostCreateDto) =>
      requestPost("monitored-host/create", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monitored-host/list"] });
    },
  });
};

export interface MonitoredHostUpdateDto
  extends Partial<MonitoredHostCreateDto> {
  id: string;
}

export const useUpdateMonitoredHost = () => {
  return useMutation({
    mutationFn: (data: MonitoredHostUpdateDto) =>
      requestPost("monitored-host/update", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monitored-host/list"] });
      queryClient.invalidateQueries({ queryKey: ["monitored-host/detail"] });
    },
  });
};

export const useDeleteMonitoredHost = () => {
  return useMutation({
    mutationFn: (id: string) => requestPost("monitored-host/delete", { id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monitored-host/list"] });
    },
  });
};

export const useCopyMonitoredHost = () => {
  return useMutation({
    mutationFn: (id: string) => requestPost("monitored-host/copy", { id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monitored-host/list"] });
    },
  });
};
