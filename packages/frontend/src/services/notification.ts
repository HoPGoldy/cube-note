import { queryClient, requestPost } from "./base";
import { useMutation, useQuery } from "@tanstack/react-query";

// ==================== Channel Types ====================

export interface NotificationChannel {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  webhookUrl: string;
  headers: Record<string, string> | null;
  bodyTemplate: string;
  enabled: boolean;
}

export interface ChannelCreateDto {
  name: string;
  webhookUrl: string;
  headers?: Record<string, string>;
  bodyTemplate: string;
  enabled?: boolean;
}

export interface ChannelUpdateDto extends Partial<ChannelCreateDto> {
  id: string;
}

export interface TemplateItem {
  name: string;
  description: string;
  template: string;
}

// ==================== Log Types ====================

export interface NotificationLog {
  id: string;
  createdAt: string;
  hostId: string;
  endpointId: string;
  channelId: string;
  eventType: string;
  title: string;
  content: string;
  success: boolean;
  errorMsg: string | null;
}

export interface LogListQueryDto {
  hostId?: string;
  endpointId?: string;
  channelId?: string;
  limit?: number;
}

// ==================== Channel Hooks ====================

export const useGetChannelList = () => {
  return useQuery({
    queryKey: ["notification/channel/list"],
    queryFn: () =>
      requestPost<NotificationChannel[]>("notification/channel/list", {}),
  });
};

export const useGetChannelDetail = (id: string) => {
  return useQuery({
    queryKey: ["notification/channel/get", id],
    enabled: !!id,
    queryFn: () =>
      requestPost<NotificationChannel>("notification/channel/get", { id }),
  });
};

export const useCreateChannel = () => {
  return useMutation({
    mutationFn: (data: ChannelCreateDto) =>
      requestPost<NotificationChannel>("notification/channel/create", data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notification/channel/list"],
      });
    },
  });
};

export const useUpdateChannel = () => {
  return useMutation({
    mutationFn: (data: ChannelUpdateDto) =>
      requestPost<NotificationChannel>("notification/channel/update", data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notification/channel/list"],
      });
      queryClient.invalidateQueries({
        queryKey: ["notification/channel/get"],
      });
    },
  });
};

export const useDeleteChannel = () => {
  return useMutation({
    mutationFn: (id: string) =>
      requestPost<{ success: boolean }>("notification/channel/delete", { id }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notification/channel/list"],
      });
    },
  });
};

export const useTestChannel = () => {
  return useMutation({
    mutationFn: (id: string) =>
      requestPost<{ success: boolean; error?: string }>(
        "notification/channel/test",
        { id },
      ),
  });
};

export const useGetChannelTemplates = () => {
  return useQuery({
    queryKey: ["notification/channel/templates"],
    queryFn: () =>
      requestPost<TemplateItem[]>("notification/channel/templates", {}),
  });
};

// ==================== Log Hooks ====================

export const useGetLogList = (query?: LogListQueryDto) => {
  return useQuery({
    queryKey: ["notification/log/list", query],
    queryFn: () =>
      requestPost<NotificationLog[]>("notification/log/list", query || {}),
  });
};

// ==================== Status Types ====================

export interface FailedEndpoint {
  endpointId: string;
  endpointName: string;
  consecutiveFailures: number;
}

export interface HostNotificationStatus {
  hostId: string;
  hostName: string;
  hostEnabled: boolean;
  currentStatus: "UP" | "DOWN";
  lastNotifiedAt: string | null;
  failedEndpoints: FailedEndpoint[];
}

// ==================== Status Hooks ====================

export const useGetNotificationStatusList = () => {
  return useQuery({
    queryKey: ["notification/status/list"],
    queryFn: () =>
      requestPost<HostNotificationStatus[]>("notification/status/list", {}),
    refetchInterval: 10000, // 每 10 秒自动刷新
  });
};
