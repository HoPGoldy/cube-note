import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useDeleteMonitoredHost,
  useGetMonitoredHostDetail,
  useUpdateMonitoredHost,
  useCopyMonitoredHost,
} from "@/services/monitored-host";
import {
  useDeleteEndpoint,
  useGetEndpointList,
  useUpdateEndpoint,
} from "@/services/monitored-endpoint";
import {
  Spin,
  Empty,
  Flex,
  Space,
  Button,
  Modal,
  message,
  Dropdown,
} from "antd";
import { usePageTitle } from "@/store/global";
import { EmptyTip } from "@/components/empty-tip";
import {
  CloseOutlined,
  CopyOutlined,
  MoreOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { EndpointItem } from "./endpoint-item";
import { useGetHostMultiRangeStats } from "@/services/probe-stats";
import { StatCard, getUptimeColor } from "@/components/stat-card";
import { useEndpointDetailAction } from "../endpoint-detail/use-detail-action";
import { useHostDetailAction } from "../host-detail/use-detail-action";
import { DesktopArea } from "@/layouts/responsive";
import {
  ActionButton,
  PageAction,
  PageContent,
} from "@/layouts/page-with-action";

const HostDetailPage: React.FC = () => {
  const { hostId } = useParams<{ hostId: string }>();
  const navigate = useNavigate();
  const [modal, contextHolder] = Modal.useModal();
  const endpointDetailActions = useEndpointDetailAction();
  const hostDetailActions = useHostDetailAction();

  const { hostDetail, isLoading: loadingHost } = useGetMonitoredHostDetail(
    hostId || "",
  );

  const { data: endpointsData, isLoading: loadingEndpoints } =
    useGetEndpointList({
      hostId: hostId,
    });

  const { data: hostStatsData } = useGetHostMultiRangeStats(hostId || "");
  const hostStats = hostStatsData?.data;

  const { mutateAsync: updateHost } = useUpdateMonitoredHost();
  const { mutateAsync: deleteHost } = useDeleteMonitoredHost();
  const { mutateAsync: copyHost, isPending: copyingHost } =
    useCopyMonitoredHost();
  const { mutateAsync: updateEndpoint } = useUpdateEndpoint();
  const { mutateAsync: deleteEndpoint } = useDeleteEndpoint();

  const endpoints = endpointsData?.data ?? [];

  usePageTitle(hostDetail ? `${hostDetail?.name} - 监控详情` : "监控详情");

  const onSwitchEndpointEnabled = async (item: any) => {
    await updateEndpoint({
      id: item.id,
      enabled: !item.enabled,
    });
  };

  const onEndpointDeleteConfirm = async (item: any) => {
    modal.confirm({
      title: `确认删除端点"${item.name}"？`,
      content: "删除后该端点的所有探测记录也将被删除",
      onOk: async () => {
        await deleteEndpoint(item.id);
      },
    });
  };

  const onSwitchEnabled = async (item: any) => {
    await updateHost({
      id: item.id,
      enabled: !item.enabled,
    });
  };

  const onHostDeleteConfirm = async (item: any) => {
    modal.confirm({
      title: `确认删除服务"${item.name}"？`,
      content: "删除后该服务下的所有监控端点也将被删除",
      onOk: async () => {
        await deleteHost(item.id);
        navigate("/");
      },
    });
  };

  const handleCopyHost = async () => {
    try {
      await copyHost(hostId!);
      message.success("复制成功，新服务已创建（默认禁用）");
    } catch {
      message.error("复制失败");
    }
  };

  if (loadingHost || loadingEndpoints) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spin size="large" />
      </div>
    );
  }

  if (!hostDetail) {
    return (
      <div className="flex items-center justify-center h-full">
        <Empty description="未找到该监控服务" />
      </div>
    );
  }

  const renderHostStats = () => {
    if (!hostStats || hostStats.stats24h.totalChecks === 0) {
      return null;
    }

    return (
      <Flex
        gap={16}
        align="center"
        justify="space-around"
        className="w-full overflow-x-auto"
      >
        <StatCard
          label="平均响应"
          subLabel="当前"
          value={hostStats.current.avgResponseTime}
          unit=" ms"
        />
        <StatCard
          label="平均响应"
          subLabel="24小时"
          value={
            hostStats.stats24h.avgResponseTime !== null
              ? hostStats.stats24h.avgResponseTime.toFixed(0)
              : null
          }
          unit=" ms"
        />
        <StatCard
          label="成功率"
          subLabel="当前"
          value={hostStats.current.successRate}
          unit="%"
          colorClass={getUptimeColor(hostStats.current.successRate)}
        />
        <StatCard
          label="在线时间"
          subLabel="24小时"
          value={hostStats.stats24h.uptimePercentage?.toFixed(2) ?? null}
          unit="%"
          colorClass={getUptimeColor(hostStats.stats24h.uptimePercentage)}
        />
        <StatCard
          label="在线时间"
          subLabel="30天"
          value={hostStats.stats30d.uptimePercentage?.toFixed(2) ?? null}
          unit="%"
          colorClass={getUptimeColor(hostStats.stats30d.uptimePercentage)}
        />
        <StatCard
          label="在线时间"
          subLabel="1年"
          value={hostStats.stats1y.uptimePercentage?.toFixed(2) ?? null}
          unit="%"
          colorClass={getUptimeColor(hostStats.stats1y.uptimePercentage)}
        />
      </Flex>
    );
  };

  return (
    <>
      <PageContent>
        <Flex vertical gap={16} className="m-4">
          <div>
            <Flex gap={16} justify="space-between" align="center">
              <div className="text-4xl font-bold">{hostDetail?.name}</div>
              <DesktopArea>
                <Space>
                  <Button type="primary" onClick={endpointDetailActions.onAdd}>
                    创建接口
                  </Button>
                  <Button
                    onClick={() => hostDetailActions.onEdit(hostDetail.id)}
                  >
                    编辑
                  </Button>
                  <Dropdown
                    menu={{
                      items: [
                        {
                          key: "toggle",
                          icon: hostDetail.enabled ? (
                            <PauseCircleOutlined />
                          ) : (
                            <PlayCircleOutlined />
                          ),
                          label: hostDetail.enabled ? "禁用" : "启用",
                          onClick: () => onSwitchEnabled(hostDetail),
                        },
                        {
                          key: "copy",
                          icon: <CopyOutlined />,
                          label: copyingHost ? "复制中..." : "复制",
                          disabled: copyingHost,
                          onClick: handleCopyHost,
                        },
                        { type: "divider" },
                        {
                          key: "delete",
                          icon: <CloseOutlined />,
                          label: "删除",
                          danger: true,
                          onClick: () => onHostDeleteConfirm(hostDetail),
                        },
                      ],
                    }}
                    trigger={["click"]}
                  >
                    <Button icon={<MoreOutlined />} />
                  </Dropdown>
                </Space>
              </DesktopArea>
            </Flex>
            <div className="mt-2 text-gray-500 truncate">
              {hostDetail.desc}
              {hostDetail.desc && hostDetail.url && (
                <span className="mx-2">·</span>
              )}
              {hostDetail.url}
            </div>
          </div>

          {renderHostStats()}

          {/* Endpoints 列表 */}
          <Flex vertical gap={16}>
            {endpoints.length === 0 ? (
              <EmptyTip
                className="mt-8"
                title="暂未配置监控接口"
                subTitle={'点击右上角"创建接口"按钮继续'}
              />
            ) : (
              endpoints.map((endpoint: any) => (
                <EndpointItem
                  key={endpoint.id}
                  endpoint={endpoint}
                  onEdit={() => endpointDetailActions.onEdit(endpoint.id)}
                  onSwitchEnabled={onSwitchEndpointEnabled}
                  onDelete={onEndpointDeleteConfirm}
                />
              ))
            )}
          </Flex>
        </Flex>

        {contextHolder}
      </PageContent>
      <PageAction>
        <ActionButton onClick={() => navigate("/")}>返回主面板</ActionButton>
      </PageAction>
    </>
  );
};

export default HostDetailPage;
