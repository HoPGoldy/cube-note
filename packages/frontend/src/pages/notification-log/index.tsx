import React, { useState } from "react";
import { useGetLogList, NotificationLog } from "@/services/notification";
import { Button, Flex, Table, Tag, Input, Space, Tooltip } from "antd";
import { ColumnType } from "antd/es/table";
import { utcdayjsFormat } from "@/utils/dayjs";
import {
  RedoOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { usePageTitle } from "@/store/global";

const NotificationLogPage: React.FC = () => {
  usePageTitle("通知记录");

  const [filters, setFilters] = useState<{
    endpointId?: string;
    limit?: number;
  }>({ limit: 100 });

  const {
    data: listData,
    refetch: reloadList,
    isFetching: loadingList,
  } = useGetLogList(filters);

  const tableDataSource = (listData?.data as NotificationLog[]) ?? [];

  const columns: ColumnType<NotificationLog>[] = [
    {
      title: "时间",
      dataIndex: "createdAt",
      width: 180,
      render: (text: string) => utcdayjsFormat(text),
    },
    {
      title: "事件类型",
      dataIndex: "eventType",
      width: 100,
      align: "center",
      render: (eventType: string) => (
        <Tag color={eventType === "FAILURE" ? "error" : "success"}>
          {eventType === "FAILURE" ? "故障" : "恢复"}
        </Tag>
      ),
    },
    {
      title: "标题",
      dataIndex: "title",
      width: 250,
      ellipsis: true,
    },
    {
      title: "发送状态",
      dataIndex: "success",
      width: 100,
      align: "center",
      render: (success: boolean, record: NotificationLog) => (
        <Tooltip title={record.errorMsg || undefined}>
          <Tag
            color={success ? "success" : "error"}
            icon={success ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
          >
            {success ? "成功" : "失败"}
          </Tag>
        </Tooltip>
      ),
    },
    {
      title: "错误信息",
      dataIndex: "errorMsg",
      ellipsis: true,
      render: (text: string | null) => text || "-",
    },
  ];

  return (
    <Flex vertical gap={16} className="p-4">
      <Flex justify="space-between" align="center">
        <Space>
          <Input
            placeholder="按端点 ID 筛选"
            allowClear
            style={{ width: 250 }}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                endpointId: e.target.value || undefined,
              }))
            }
          />
        </Space>
        <Flex gap={8}>
          <Button onClick={() => reloadList()} icon={<RedoOutlined />}>
            刷新
          </Button>
        </Flex>
      </Flex>
      <Table
        bordered
        size="small"
        columns={columns}
        dataSource={tableDataSource}
        loading={loadingList}
        rowKey="id"
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
      />
    </Flex>
  );
};

export default NotificationLogPage;
