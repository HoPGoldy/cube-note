import React, { useState } from "react";
import { Card, Flex, Space, Button, message, Dropdown, Tag } from "antd";
import {
  CloseOutlined,
  DownOutlined,
  UpOutlined,
  CopyOutlined,
  MoreOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { EndpointChart } from "./endpoint-chart";
import { useGetEndpointMultiRangeStats } from "@/services/probe-stats";
import { StatCard, getUptimeColor } from "@/components/stat-card";
import { useCopyEndpoint } from "@/services/monitored-endpoint";
import { DesktopArea } from "@/layouts/responsive";

interface EndpointItemProps {
  endpoint: any;
  onEdit: (id: string) => void;
  onSwitchEnabled: (item: any) => void;
  onDelete: (item: any) => void;
}

export const EndpointItem: React.FC<EndpointItemProps> = ({
  endpoint,
  onEdit,
  onSwitchEnabled,
  onDelete,
}) => {
  const [expanded, setExpanded] = useState(false);
  const { data: statsData } = useGetEndpointMultiRangeStats(
    expanded ? endpoint.id : undefined,
  );
  const stats = statsData?.data;

  const { mutateAsync: copyEndpoint, isPending: copying } = useCopyEndpoint();

  const hasData =
    stats &&
    (stats.current.responseTime !== null || stats.stats24h.totalChecks > 0);

  const handleCopy = async () => {
    try {
      await copyEndpoint(endpoint.id);
      message.success("复制成功，新端点已创建（默认禁用）");
    } catch {
      message.error("复制失败");
    }
  };

  return (
    <Card styles={{ body: { padding: 16 } }}>
      <Flex className="w-full">
        <div className="w-full">
          <Flex gap={16} justify="space-between" align="center">
            <Flex className="text-2xl font-bold" align="center" gap={8}>
              <span className={endpoint.enabled ? "" : "text-gray-400"}>
                {endpoint.name}
              </span>
              {!endpoint.enabled && <Tag color="default">已禁用</Tag>}
            </Flex>
            <Space>
              <DesktopArea>
                <Button onClick={() => onEdit(endpoint.id)}>配置</Button>
              </DesktopArea>
              <DesktopArea>
                <Dropdown
                  menu={{
                    items: [
                      {
                        key: "toggle",
                        icon: endpoint.enabled ? (
                          <PauseCircleOutlined />
                        ) : (
                          <PlayCircleOutlined />
                        ),
                        label: endpoint.enabled ? "禁用" : "启用",
                        onClick: () => onSwitchEnabled(endpoint),
                      },
                      {
                        key: "copy",
                        icon: <CopyOutlined />,
                        label: copying ? "复制中..." : "复制",
                        disabled: copying,
                        onClick: handleCopy,
                      },
                      { type: "divider" },
                      {
                        key: "delete",
                        icon: <CloseOutlined />,
                        label: "删除",
                        danger: true,
                        onClick: () => onDelete(endpoint),
                      },
                    ],
                  }}
                  trigger={["click"]}
                >
                  <Button icon={<MoreOutlined />} />
                </Dropdown>
              </DesktopArea>
              <Button
                icon={expanded ? <UpOutlined /> : <DownOutlined />}
                onClick={() => setExpanded(!expanded)}
              ></Button>
            </Space>
          </Flex>
          <div className="text-gray-500 truncate">
            {endpoint.desc}
            {endpoint.desc && endpoint.url && <span className="mx-2">·</span>}
            {endpoint.url}
          </div>

          {/* 统计指标 */}
          {expanded && hasData && (
            <Flex
              gap={16}
              className="mt-3 w-full overflow-x-auto"
              align="center"
              justify="space-around"
            >
              <StatCard
                label="平均响应时间"
                subLabel="24小时"
                value={
                  stats.stats24h.avgResponseTime !== null
                    ? stats.stats24h.avgResponseTime.toFixed(2)
                    : null
                }
                unit=" ms"
              />
              <StatCard
                label="在线时间"
                subLabel="24小时"
                value={stats.stats24h.uptimePercentage?.toFixed(2) ?? null}
                unit="%"
                colorClass={getUptimeColor(stats.stats24h.uptimePercentage)}
              />
              <StatCard
                label="在线时间"
                subLabel="30天"
                value={stats.stats30d.uptimePercentage?.toFixed(2) ?? null}
                unit="%"
                colorClass={getUptimeColor(stats.stats30d.uptimePercentage)}
              />
              <StatCard
                label="在线时间"
                subLabel="1年"
                value={stats.stats1y.uptimePercentage?.toFixed(2) ?? null}
                unit="%"
                colorClass={getUptimeColor(stats.stats1y.uptimePercentage)}
              />
            </Flex>
          )}
        </div>
      </Flex>
      {/* 探测结果图表 - 禁用时不显示 */}
      {endpoint.enabled && (
        <div className="mt-4 w-full h-[70px]">
          <EndpointChart
            endpointId={endpoint.id}
            refetchInterval={endpoint.intervalTime * 1000}
          />
        </div>
      )}
    </Card>
  );
};
