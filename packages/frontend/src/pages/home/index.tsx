import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDeleteMonitoredHost } from "@/services/monitored-host";
import { Card, Spin, Flex, Space, Button, Modal } from "antd";
import { usePageTitle } from "@/store/global";
import { EmptyTip } from "@/components/empty-tip";
import {
  CloseOutlined,
  PlusOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { NotificationStatusSummary } from "./notification-status-summary";
import { useHostDetailAction } from "../host-detail/use-detail-action";
import { useHostStatus } from "@/utils/use-host-status";
import { DesktopArea } from "@/layouts/responsive";
import {
  ActionButton,
  ActionIcon,
  PageAction,
  PageContent,
} from "@/layouts/page-with-action";
import { MobileSetting } from "../user-setting";
import { logout } from "@/store/user";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [modal, contextHolder] = Modal.useModal();
  const [mobileSettingVisible, setMobileSettingVisible] = useState(false);

  const { hosts, isLoading, getHostDisplayStatus, statusColorMap } =
    useHostStatus();

  const { mutateAsync: deleteHost } = useDeleteMonitoredHost();

  const hostDetailActions = useHostDetailAction();

  usePageTitle("监控首页");

  const onHostDeleteConfirm = (item: any, e: React.MouseEvent) => {
    e.stopPropagation();
    modal.confirm({
      title: `确认删除服务"${item.name}"？`,
      content: "删除后该服务下的所有监控端点也将被删除",
      onOk: async () => {
        await deleteHost(item.id);
      },
    });
  };

  const onHostClick = (hostId: string) => {
    navigate(`/host-home/${hostId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spin size="large" />
      </div>
    );
  }

  const renderHostItem = (host: any) => {
    const displayStatus = getHostDisplayStatus(host.id);

    return (
      <Card
        key={host.id}
        className="hover:ring-2 ring-gray-300 dark:ring-neutral-500 transition-all cursor-pointer"
        styles={{ body: { padding: 16 } }}
        onClick={() => onHostClick(host.id)}
      >
        <Flex className="w-full" justify="space-between" align="center">
          <div className="flex-1">
            <Flex gap={16} justify="space-between" align="center">
              <Flex className="text-2xl font-bold" align="center" gap={8}>
                <span
                  className={`inline-block w-3 h-3 rounded-full ${statusColorMap[displayStatus]}`}
                />
                {host.name}
              </Flex>
              <DesktopArea>
                <Space onClick={(e) => e.stopPropagation()}>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      hostDetailActions.onEdit(host.id);
                    }}
                  >
                    编辑
                  </Button>
                  <Button
                    danger
                    icon={<CloseOutlined />}
                    onClick={(e) => onHostDeleteConfirm(host, e)}
                  />
                </Space>
              </DesktopArea>
            </Flex>
            <div className="mt-2 text-gray-500">
              {host.desc && <span className="mr-4">{host.desc}</span>}
            </div>
          </div>
        </Flex>
      </Card>
    );
  };

  return (
    <>
      <PageContent>
        <Flex vertical gap={16} className="m-4">
          <div>
            <Flex gap={16} justify="space-between" align="center">
              <div className="text-4xl font-bold">监控服务</div>
              <DesktopArea>
                <Space>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={hostDetailActions.onAdd}
                  >
                    创建监控服务
                  </Button>
                  <Link to="/probe-env">
                    <Button block>环境变量管理</Button>
                  </Link>
                  <Link to="/notification-channel">
                    <Button block>通知管理</Button>
                  </Link>
                </Space>
              </DesktopArea>
            </Flex>
            <div className="mt-2 text-gray-500">
              管理和监控您的所有服务健康状态
            </div>
          </div>

          {/* 通知状态摘要 */}
          <NotificationStatusSummary />

          {/* Hosts 列表 */}
          <Flex vertical gap={16}>
            {hosts.length === 0 ? (
              <EmptyTip
                className="mt-8"
                title="暂无监控服务"
                subTitle={'点击右上角"创建服务"按钮开始添加'}
              />
            ) : (
              hosts.map(renderHostItem)
            )}
          </Flex>
        </Flex>

        {contextHolder}
      </PageContent>
      <MobileSetting
        visible={mobileSettingVisible}
        onVisibleChange={setMobileSettingVisible}
      />
      <PageAction>
        <ActionIcon
          icon={<SettingOutlined />}
          onClick={() => setMobileSettingVisible(true)}
        ></ActionIcon>
        <ActionButton onClick={() => logout()}>登出</ActionButton>
      </PageAction>
    </>
  );
};

export default HomePage;
