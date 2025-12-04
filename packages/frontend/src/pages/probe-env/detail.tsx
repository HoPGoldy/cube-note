import React, { useEffect } from "react";
import { Modal, Form, Input, Switch, App } from "antd";
import { useSearchParams } from "react-router-dom";
import { useDetailType } from "@/utils/use-detail-type";
import {
  useAddProbeEnv,
  useUpdateProbeEnv,
  useGetProbeEnvList,
  ProbeEnvCreateRequest,
} from "@/services/probe-env";

const { TextArea } = Input;

export const DetailModal: React.FC = () => {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  const detailType = searchParams.get("modal");
  const itemId = searchParams.get("id") ?? "";
  const isOpen = !!detailType;
  const { isAdd, isEdit } = useDetailType(detailType ?? undefined);

  const { data: listData } = useGetProbeEnvList();
  const { mutateAsync: addEnv, isPending: addLoading } = useAddProbeEnv();
  const { mutateAsync: updateEnv, isPending: updateLoading } =
    useUpdateProbeEnv();

  // 从列表中获取当前编辑项
  const allData = listData?.data?.list ?? [];
  const detailRecord = allData.find((item: any) => item.id === itemId);

  useEffect(() => {
    if (isEdit && detailRecord) {
      form.setFieldsValue({
        key: detailRecord.key,
        // 敏感变量不回填值
        value: detailRecord.isSecret ? "" : detailRecord.value,
        isSecret: detailRecord.isSecret,
        desc: detailRecord.desc,
      });
    } else if (isAdd) {
      form.resetFields();
    }
  }, [isEdit, isAdd, detailRecord, form]);

  const onClose = () => {
    searchParams.delete("modal");
    searchParams.delete("id");
    setSearchParams(searchParams, { replace: true });
    form.resetFields();
  };

  const onSubmit = async () => {
    const values = await form.validateFields();

    if (isAdd) {
      const data: ProbeEnvCreateRequest = {
        key: values.key,
        value: values.value,
        isSecret: values.isSecret ?? false,
        desc: values.desc || undefined,
      };
      await addEnv(data);
      message.success("创建成功");
    } else if (isEdit) {
      // 编辑时，如果值为空且是敏感变量，不更新值
      const updateData: any = {
        id: itemId,
        key: values.key,
        isSecret: values.isSecret ?? false,
        desc: values.desc || null,
      };

      // 只有当值非空时才更新
      if (values.value) {
        updateData.value = values.value;
      }

      await updateEnv(updateData);
      message.success("更新成功");
    }

    onClose();
  };

  const title = isAdd ? "新增环境变量" : "编辑环境变量";

  return (
    <Modal
      title={title}
      open={isOpen}
      onCancel={onClose}
      onOk={onSubmit}
      confirmLoading={addLoading || updateLoading}
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ isSecret: false }}
        className="mt-4"
      >
        <Form.Item
          name="key"
          label="变量名"
          rules={[
            { required: true, message: "请输入变量名" },
            {
              pattern: /^[A-Z][A-Z0-9_]*$/,
              message:
                "变量名必须以大写字母开头，只能包含大写字母、数字和下划线",
            },
          ]}
          extra="建议使用大写字母 + 下划线命名，如 API_KEY"
        >
          <Input placeholder="如: API_KEY, DB_PASSWORD" maxLength={100} />
        </Form.Item>

        <Form.Item
          name="value"
          label="变量值"
          rules={[{ required: isAdd, message: "请输入变量值" }]}
          extra={
            isEdit && detailRecord?.isSecret
              ? "敏感变量留空表示保持原值不变"
              : undefined
          }
        >
          <TextArea
            placeholder={
              isEdit && detailRecord?.isSecret
                ? "留空保持原值不变"
                : "请输入变量值"
            }
            autoSize={{ minRows: 2, maxRows: 6 }}
            maxLength={10000}
          />
        </Form.Item>

        <Form.Item
          name="isSecret"
          label="敏感信息"
          valuePropName="checked"
          extra="敏感信息在列表中不会显示实际值"
        >
          <Switch checkedChildren="是" unCheckedChildren="否" />
        </Form.Item>

        <Form.Item name="desc" label="描述" extra="可选，帮助理解变量用途">
          <TextArea
            placeholder="如: 用于访问 GitHub API 的 Token"
            autoSize={{ minRows: 2, maxRows: 4 }}
            maxLength={500}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
