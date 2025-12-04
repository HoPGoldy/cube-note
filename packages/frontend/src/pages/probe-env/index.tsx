import React, { useState } from "react";
import {
  useGetProbeEnvList,
  useDeleteProbeEnv,
  ProbeEnvItem,
} from "@/services/probe-env";
import { Button, Flex, Modal, Table, Tag, App, Input } from "antd";
import { useSearchParams } from "react-router-dom";
import { DetailPageType } from "@/utils/use-detail-type";
import { DetailModal } from "./detail";
import { ColumnType } from "antd/es/table";
import { utcdayjsFormat } from "@/utils/dayjs";
import {
  RedoOutlined,
  LockOutlined,
  UnlockOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { usePageTitle } from "@/store/global";

const ProbeEnvPage: React.FC = () => {
  usePageTitle("环境变量");
  const { message } = App.useApp();

  const [searchText, setSearchText] = useState("");

  const {
    data: listData,
    refetch: reloadList,
    isFetching: loadingList,
  } = useGetProbeEnvList();

  const { mutateAsync: deleteEnv } = useDeleteProbeEnv();

  const allData = (listData?.data?.list as ProbeEnvItem[]) ?? [];

  // 根据搜索过滤
  const tableDataSource = searchText
    ? allData.filter(
        (item) =>
          item.key.toLowerCase().includes(searchText.toLowerCase()) ||
          item.desc?.toLowerCase().includes(searchText.toLowerCase()),
      )
    : allData;

  const [searchParams, setSearchParams] = useSearchParams();

  const onAdd = () => {
    searchParams.set("modal", DetailPageType.Add);
    setSearchParams(searchParams, { replace: true });
  };

  const onEdit = (id: string) => {
    searchParams.set("modal", DetailPageType.Edit);
    searchParams.set("id", id);
    setSearchParams(searchParams, { replace: true });
  };

  const onDeleteConfirm = async (item: ProbeEnvItem) => {
    Modal.confirm({
      title: `确认删除环境变量"${item.key}"？`,
      content: "删除后使用该变量的探针代码可能会报错",
      onOk: async () => {
        await deleteEnv({ id: item.id });
        message.success("删除成功");
      },
    });
  };

  const columns: ColumnType<ProbeEnvItem>[] = [
    {
      title: "变量名",
      dataIndex: "key",
      width: 200,
      render: (text: string) => (
        <span className="font-mono font-medium">{text}</span>
      ),
    },
    {
      title: "变量值",
      dataIndex: "value",
      ellipsis: true,
      render: (text: string, record: ProbeEnvItem) => (
        <span className={record.isSecret ? "text-gray-400" : "font-mono"}>
          {text}
        </span>
      ),
    },
    {
      title: "敏感",
      dataIndex: "isSecret",
      width: 80,
      align: "center",
      render: (isSecret: boolean) => (
        <Tag
          color={isSecret ? "warning" : "default"}
          icon={isSecret ? <LockOutlined /> : <UnlockOutlined />}
        >
          {isSecret ? "是" : "否"}
        </Tag>
      ),
    },
    {
      title: "描述",
      dataIndex: "desc",
      ellipsis: true,
      width: 200,
      render: (text: string | null) => text || "-",
    },
    {
      title: "更新时间",
      dataIndex: "updatedAt",
      width: 180,
      render: (text: string) => utcdayjsFormat(text),
    },
    {
      title: "操作",
      width: 150,
      render: (_: any, record: ProbeEnvItem) => (
        <Flex gap={8}>
          <Button type="link" size="small" onClick={() => onEdit(record.id)}>
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
      <Flex justify="space-between">
        <Input
          placeholder="搜索变量名或描述"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 250 }}
          allowClear
        />
        <Flex gap={8}>
          <Button type="primary" onClick={onAdd}>
            新增
          </Button>
          <Button onClick={() => reloadList()} icon={<RedoOutlined />}></Button>
        </Flex>
      </Flex>

      <Table<ProbeEnvItem>
        bordered
        dataSource={tableDataSource}
        columns={columns}
        rowKey="id"
        loading={loadingList}
        pagination={false}
        size="small"
      />

      <DetailModal />
    </Flex>
  );
};

export default ProbeEnvPage;
