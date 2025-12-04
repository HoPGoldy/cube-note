import React from "react";
import {
  useGetNotificationStatusList,
  HostNotificationStatus,
  FailedEndpoint,
} from "@/services/notification";
import { Flex, Tag, Card, Tooltip, Progress } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";

// 派生状态类型
type DisplayStatus = "UP" | "WARNING" | "DOWN";

// 根据后端数据派生前端展示状态
function getDisplayStatus(host: HostNotificationStatus): DisplayStatus {
  // 后端返回 DOWN，直接用
  if (host.currentStatus === "DOWN") {
    return "DOWN";
  }

  // 后端返回 UP，但有失败端点（未达阈值），显示 WARNING
  if (host.currentStatus === "UP" && host.failedEndpoints.length > 0) {
    return "WARNING";
  }

  // 完全正常
  return "UP";
}

export const NotificationStatusSummary: React.FC = () => {
  const { data: statusData } = useGetNotificationStatusList();

  const allStatusList = (statusData?.data as HostNotificationStatus[]) ?? [];

  // 分类统计
  const pausedHosts = allStatusList.filter((s) => !s.hostEnabled).length;
  const enabledList = allStatusList.filter((s) => s.hostEnabled);

  const downHosts = enabledList.filter(
    (s) => getDisplayStatus(s) === "DOWN",
  ).length;
  const warningHosts = enabledList.filter(
    (s) => getDisplayStatus(s) === "WARNING",
  ).length;
  const upHosts = enabledList.length - downHosts - warningHosts;

  const totalHosts = allStatusList.length;

  // 没有启用通知的服务时不显示
  if (totalHosts === 0) {
    return null;
  }

  // 获取故障和警告服务（只包含启用的）
  const downServices = enabledList.filter(
    (s) => getDisplayStatus(s) === "DOWN",
  );
  const warningServices = enabledList.filter(
    (s) => getDisplayStatus(s) === "WARNING",
  );

  // 计算可用率时，只计算启用的服务，WARNING 算作正常（因为还没触发通知）
  const enabledTotal = enabledList.length;
  const healthyHosts = upHosts + warningHosts;

  return (
    <Card size="small">
      <Flex gap={24} align="center" wrap="wrap">
        {/* 统计摘要 */}
        <Flex align="center" gap={12}>
          <Progress
            type="circle"
            size={48}
            percent={
              enabledTotal > 0
                ? Math.round((healthyHosts / enabledTotal) * 100)
                : 100
            }
            status={downHosts > 0 ? "exception" : "success"}
          />
          <Flex vertical>
            <span className="text-sm text-gray-500">
              共 {totalHosts} 个服务
            </span>
            <span className="font-medium text-xs">
              <span className="text-green-600">正常 {upHosts}</span>
              {warningHosts > 0 && (
                <span className="text-yellow-600 ml-2">
                  警告 {warningHosts}
                </span>
              )}
              {downHosts > 0 && (
                <span className="text-red-600 ml-2">故障 {downHosts}</span>
              )}
              {pausedHosts > 0 && (
                <span className="text-gray-400 ml-2">暂停 {pausedHosts}</span>
              )}
            </span>
          </Flex>
        </Flex>

        {/* 分隔线 */}
        <div className="h-10 w-px bg-gray-200" />

        {/* 状态标签 */}
        <Flex gap={8} align="center" wrap="wrap" className="flex-1">
          {downHosts === 0 && warningHosts === 0 ? (
            <Tag color="success" icon={<CheckCircleOutlined />}>
              所有服务运行正常
            </Tag>
          ) : (
            <>
              {downHosts > 0 && (
                <Tag color="error" icon={<CloseCircleOutlined />}>
                  {downHosts} 个服务故障
                </Tag>
              )}
              {warningHosts > 0 && (
                <Tag color="warning" icon={<ExclamationCircleOutlined />}>
                  {warningHosts} 个服务警告
                </Tag>
              )}
              {downServices.map((service) => (
                <Tooltip
                  key={service.hostId}
                  title={
                    <div>
                      <div className="font-medium mb-1">失败端点：</div>
                      {service.failedEndpoints.map((ep: FailedEndpoint) => (
                        <div key={ep.endpointId}>
                          • {ep.endpointName} (连续失败 {ep.consecutiveFailures}{" "}
                          次)
                        </div>
                      ))}
                    </div>
                  }
                >
                  <Link to={`/host-home/${service.hostId}`}>
                    <Tag color="error" style={{ cursor: "pointer" }}>
                      {service.hostName}
                    </Tag>
                  </Link>
                </Tooltip>
              ))}
              {warningServices.map((service) => (
                <Tooltip
                  key={service.hostId}
                  title={
                    <div>
                      <div className="font-medium mb-1">异常端点：</div>
                      {service.failedEndpoints.map((ep: FailedEndpoint) => (
                        <div key={ep.endpointId}>
                          • {ep.endpointName} (连续失败 {ep.consecutiveFailures}{" "}
                          次)
                        </div>
                      ))}
                    </div>
                  }
                >
                  <Link to={`/host-home/${service.hostId}`}>
                    <Tag color="warning" style={{ cursor: "pointer" }}>
                      {service.hostName}
                    </Tag>
                  </Link>
                </Tooltip>
              ))}
            </>
          )}
        </Flex>
      </Flex>
    </Card>
  );
};
