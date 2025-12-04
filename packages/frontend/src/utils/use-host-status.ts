import { useGetMonitoredHostList } from "@/services/monitored-host";
import { useGetNotificationStatusList } from "@/services/notification";

export type HostDisplayStatus = "UP" | "WARNING" | "DOWN" | "DISABLED";

export const statusColorMap: Record<HostDisplayStatus, string> = {
  UP: "bg-green-500",
  WARNING: "bg-yellow-500",
  DOWN: "bg-red-500",
  DISABLED: "bg-gray-400",
};

export const useHostStatus = () => {
  const { data: hostsData, isLoading: hostsLoading } = useGetMonitoredHostList(
    {},
  );
  const { data: statusData, isLoading: statusLoading } =
    useGetNotificationStatusList();

  const hosts = (hostsData?.data as any[]) ?? [];
  const statusList = (statusData?.data as any[]) ?? [];
  const isLoading = hostsLoading || statusLoading;

  /** 根据通知状态获取 Host 的展示状态 */
  const getHostDisplayStatus = (hostId: string): HostDisplayStatus => {
    const host = hosts.find((h: any) => h.id === hostId);
    if (!host?.enabled) {
      return "DISABLED";
    }

    const status = statusList.find((s: any) => s.hostId === hostId);
    if (!status) {
      return "UP"; // 未启用通知的服务默认显示正常
    }

    if (status.currentStatus === "DOWN") {
      return "DOWN";
    }

    if (status.currentStatus === "UP" && status.failedEndpoints.length > 0) {
      return "WARNING";
    }

    return "UP";
  };

  return {
    hosts,
    statusList,
    isLoading,
    getHostDisplayStatus,
    statusColorMap,
  };
};
