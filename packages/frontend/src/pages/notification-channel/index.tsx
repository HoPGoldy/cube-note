import React from "react";
import {
  useGetChannelList,
  useDeleteChannel,
  useTestChannel,
  NotificationChannel,
} from "@/services/notification";
import { Button, Flex, Modal, Table, Tag, App } from "antd";
import { ColumnType } from "antd/es/table";
import { utcdayjsFormat } from "@/utils/dayjs";
import {
  RedoOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { usePageTitle } from "@/store/global";
import { useNotificationChannelDetailAction } from "../notification-channel-detail/use-detail-action";

const NotificationChannelPage: React.FC = () => {
  usePageTitle("通知渠道");
  const { message } = App.useApp();

  const {
    data: listData,
    refetch: reloadList,
    isFetching: loadingList,
  } = useGetChannelList();

  const { mutateAsync: deleteChannel } = useDeleteChannel();
  const { mutateAsync: testChannel, isPending: testingChannel } =
    useTestChannel();

  const tableDataSource = (listData?.data as NotificationChannel[]) ?? [];

  const detailActions = useNotificationChannelDetailAction();

  const onDeleteConfirm = async (item: NotificationChannel) => {
    Modal.confirm({
      title: `确认删除渠道"${item.name}"？`,
      content: "删除后关联的通知规则将无法发送通知",
      onOk: async () => {
        await deleteChannel(item.id);
      },
    });
  };

  const onTest = async (item: NotificationChannel) => {
    const result = await testChannel(item.id);
    const data = result?.data as { success: boolean; error?: string };
    if (data?.success) {
      message.success("测试通知发送成功");
    } else {
      message.error(`测试通知发送失败: ${data?.error || "未知错误"}`);
    }
  };

  const columns: ColumnType<NotificationChannel>[] = [
    {
      title: "渠道名称",
      dataIndex: "name",
      width: 200,
    },
    {
      title: "Webhook URL",
      dataIndex: "webhookUrl",
      ellipsis: true,
    },
    {
      title: "状态",
      dataIndex: "enabled",
      width: 100,
      align: "center",
      render: (enabled: boolean) => (
        <Tag
          color={enabled ? "success" : "default"}
          icon={enabled ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
        >
          {enabled ? "启用" : "禁用"}
        </Tag>
      ),
    },
    {
      title: "更新时间",
      dataIndex: "updatedAt",
      width: 180,
      render: (text: string) => utcdayjsFormat(text),
    },
    {
      title: "操作",
      key: "action",
      width: 200,
      render: (_, record) => (
        <Flex justify="center">
          <Button
            type="link"
            size="small"
            onClick={() => onTest(record)}
            loading={testingChannel}
          >
            测试
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => detailActions.onEdit(record.id)}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            danger
            onClick={() => onDeleteConfirm(record)}
          >
            删除
          </Button>
        </Flex>
      ),
    },
  ];

  return (
    <Flex vertical gap={16} className="p-4">
      <Flex justify="flex-end" align="center">
        <Flex gap={8}>
          <Button type="primary" onClick={detailActions.onAdd}>
            新增渠道
          </Button>
          <Button onClick={() => reloadList()} icon={<RedoOutlined />}></Button>
        </Flex>
      </Flex>
      <Table
        bordered
        size="small"
        columns={columns}
        dataSource={tableDataSource}
        loading={loadingList}
        rowKey="id"
        pagination={false}
      />
    </Flex>
  );
};

export default NotificationChannelPage;
