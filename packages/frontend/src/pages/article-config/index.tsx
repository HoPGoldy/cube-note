import { FC, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button, Flex, Form, Input, Modal, Radio } from "antd";
import { DETAIL_ID_KEY } from "./use-detail-action";
import { ColorList } from "@/components/color-picker";
import {
  useDeleteArticle,
  useQueryArticleContent,
  useUpdateArticle,
} from "@/services/article";
import { useGetAppConfig } from "@/services/app-config";
import dayjs from "dayjs";

export const ArticleConfigModal: FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { appConfig } = useGetAppConfig();
  const detailId = searchParams.get(DETAIL_ID_KEY);
  const [modal, contextHolder] = Modal.useModal();

  const isOpen = !!detailId;

  const { articleDetail, isLoading: articleLoading } =
    useQueryArticleContent(detailId);

  const { mutateAsync: updateArticle, isPending: updatingArticle } =
    useUpdateArticle();

  const { mutateAsync: deleteArticle, isPending: deletingArticle } =
    useDeleteArticle();

  useEffect(() => {
    const convert = async () => {
      if (!articleDetail) return;

      const formValues = {
        ...articleDetail,
      };

      form.setFieldsValue(formValues);
    };

    convert();
  }, [articleDetail]);

  const [form] = Form.useForm();

  const onCancel = () => {
    searchParams.delete(DETAIL_ID_KEY);
    setSearchParams(searchParams, { replace: true });
  };

  const onSave = async () => {
    await form.validateFields();
    const values = form.getFieldsValue();

    const resp = await updateArticle({ id: detailId, ...values });
    if (resp?.code !== 200) return false;

    onCancel();
    return true;
  };

  const onDeleteConfirm = async () => {
    modal.confirm({
      title: "确认删除该文章？",
      content: "删除后，文章将无法恢复，请谨慎操作！",
      okText: "确认删除",
      okButtonProps: { danger: true, loading: deletingArticle },
      cancelText: "取消",
      onOk: onDelete,
    });
  };

  const onDelete = async () => {
    await deleteArticle({ id: detailId, force: true });
    onCancel();
  };

  return (
    <>
      <Modal
        title="文章配置"
        open={isOpen}
        onOk={onSave}
        width={600}
        loading={updatingArticle || articleLoading}
        onCancel={onCancel}
        destroyOnClose
        footer={(node) => {
          return (
            <>
              {appConfig.ROOT_ARTICLE_ID &&
              appConfig.ROOT_ARTICLE_ID === detailId ? null : (
                <Button danger onClick={onDeleteConfirm}>
                  删除
                </Button>
              )}
              {node}
            </>
          );
        }}
        afterClose={() => {
          form.resetFields();
        }}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ color: "" }}
          style={{
            marginTop: 16,
          }}
        >
          <Form.Item
            label="文章名称"
            name="title"
            rules={[{ required: true, message: "请输入文章名称" }]}
          >
            <Input placeholder="请输入文章名称" />
          </Form.Item>

          <Form.Item label="是否收藏" name="favorite">
            <Radio.Group
              options={[
                { label: "否", value: false },
                { label: "是", value: true },
              ]}
            />
          </Form.Item>

          <Form.Item
            label="列出子笔记"
            name="listSubarticle"
            tooltip="开启后，将会在正文内容下方以列表形式展示子笔记，目录页、索引页建议开启"
          >
            <Radio.Group
              options={[
                { label: "否", value: false },
                { label: "是", value: true },
              ]}
            />
          </Form.Item>

          <Form.Item label="颜色" name="color">
            <ColorList />
          </Form.Item>
        </Form>
        <Flex vertical gap={8}>
          <Flex>
            <span className="text-gray-400 block mr-2">创建时间</span>
            <span>
              {dayjs(articleDetail?.createTime).format("YYYY:MM:DD HH:mm:ss")}
            </span>
          </Flex>
          <Flex>
            <span className="text-gray-400 block mr-2">更新时间</span>
            <span>
              {dayjs(articleDetail?.updateTime).format("YYYY:MM:DD HH:mm:ss")}
            </span>
          </Flex>
        </Flex>
      </Modal>

      {contextHolder}
    </>
  );
};
