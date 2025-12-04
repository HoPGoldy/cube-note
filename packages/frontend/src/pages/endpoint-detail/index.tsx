import { useDetailType } from "@/utils/use-detail-type";
import { FC, useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Skeleton,
  Switch,
  Radio,
  Dropdown,
  Button,
  Space,
  Alert,
  Spin,
  Flex,
} from "antd";
import { DownOutlined, PlayCircleOutlined } from "@ant-design/icons";
import {
  useCreateEndpoint,
  useGetEndpointDetail,
  useUpdateEndpoint,
} from "@/services/monitored-endpoint";
import { CodeEditor } from "@/components/code-editor";
import { DETAIL_ID_KEY, DETAIL_TYPE_KEY } from "./use-detail-action";
import { codeTemplates } from "./code-templates";
import {
  executeCode,
  type CodeExecuteResponse,
} from "@/services/code-executor";

export const EndpointDetailModal: FC = () => {
  const { hostId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const detailType = searchParams.get(DETAIL_TYPE_KEY);
  const detailId = searchParams.get(DETAIL_ID_KEY);

  const isOpen = !!detailType;
  const { isAdd, isEdit, isReadonly } = useDetailType(detailType);

  const { mutateAsync: runAddEndpoint, isPending: adding } =
    useCreateEndpoint();
  const { mutateAsync: runEditEndpoint, isPending: updating } =
    useUpdateEndpoint();
  const { data: endpointDetailResp, isLoading } =
    useGetEndpointDetail(detailId);

  const endpointDetail = endpointDetailResp?.data;

  const [form] = Form.useForm();
  const endpointType = Form.useWatch("type", form);
  console.log("endpointType", endpointType);

  // 代码测试相关状态
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<CodeExecuteResponse | null>(
    null,
  );

  useEffect(() => {
    if (!endpointDetail) return;

    const formValues = {
      ...endpointDetail,
      headers: endpointDetail.headers
        ? JSON.stringify(endpointDetail.headers, null, 2)
        : "",
      bodyContent: endpointDetail.bodyContent || "",
      codeContent: endpointDetail.codeContent || "",
    };

    form.setFieldsValue(formValues);
    console.log("formValues", formValues);
  }, [endpointDetail, form]);

  const onCancel = () => {
    searchParams.delete(DETAIL_TYPE_KEY);
    searchParams.delete(DETAIL_ID_KEY);
    setSearchParams(searchParams, { replace: true });
  };

  const onSave = async () => {
    await form.validateFields();
    const values = form.getFieldsValue();

    values.hostId = hostId;

    const currentType = values.type || "CONFIG";

    // CONFIG 模式：解析 headers
    if (currentType === "CONFIG") {
      if (values.headers) {
        try {
          values.headers = JSON.parse(values.headers);
        } catch {
          Modal.error({
            title: "格式错误",
            content: "请求头必须是有效的JSON格式",
          });
          return false;
        }
      } else {
        values.headers = null;
      }

      // bodyContent 验证
      if (values.bodyContent) {
        const contentType = values.bodyContentType || "json";
        if (contentType === "json" || contentType === "x-www-form-urlencoded") {
          try {
            JSON.parse(values.bodyContent);
          } catch {
            Modal.error({
              title: "格式错误",
              content: `请求体内容必须是有效的JSON格式（当前编码类型: ${contentType}）`,
            });
            return false;
          }
        }
      } else {
        values.bodyContent = null;
      }

      // 清空 CODE 模式字段
      delete values.codeContent;
    } else {
      // CODE 模式：清空 CONFIG 模式字段
      delete values.url;
      delete values.method;
      delete values.headers;
      delete values.timeout;
      delete values.bodyContentType;
      delete values.bodyContent;
    }

    if (isAdd) {
      const resp = await runAddEndpoint(values);
      if (resp?.code !== 200) return false;
    } else if (isEdit) {
      const resp = await runEditEndpoint({ id: detailId, ...values });
      if (resp?.code !== 200) return false;
    }

    onCancel();
    return true;
  };

  // 测试代码执行
  const onTestCode = async () => {
    const code = form.getFieldValue("codeContent");
    if (!code?.trim()) {
      Modal.warning({
        title: "提示",
        content: "请先输入代码内容",
      });
      return;
    }

    setTestLoading(true);
    setTestResult(null);

    try {
      const resp = await executeCode({
        code,
        timeout: 10000,
        hostId,
      });
      if (resp.data) {
        setTestResult(resp.data);
      }
    } catch (error: any) {
      setTestResult({
        success: false,
        error: error?.message || "执行失败",
        executionTime: 0,
        logs: [],
      });
    } finally {
      setTestLoading(false);
    }
  };

  const renderExecutorTestResult = () => {
    if (testLoading) {
      return (
        <div style={{ textAlign: "center", padding: "16px 0" }}>
          <Spin tip="代码执行中..." />
        </div>
      );
    }

    if (testResult && !testLoading) {
      return (
        <Flex vertical gap={8} className="mb-4">
          <Alert
            type={testResult.success ? "success" : "error"}
            message={
              testResult.success
                ? `执行成功 (${testResult.executionTime}ms)`
                : `执行失败 (${testResult.executionTime}ms)`
            }
            showIcon
            closable
            onClose={() => setTestResult(null)}
          />
          <div
            style={{
              overflow: "auto",
              fontSize: 12,
            }}
          >
            {testResult.error && (
              <div style={{ color: "#ff4d4f", marginBottom: 8 }}>
                <strong>错误:</strong> {testResult.error}
              </div>
            )}

            {testResult.logs.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <strong>日志输出:</strong>
                <pre
                  style={{
                    background: "#f5f5f5",
                    padding: 8,
                    borderRadius: 4,
                    margin: "4px 0 0 0",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-all",
                  }}
                >
                  {testResult.logs.join("\n")}
                </pre>
              </div>
            )}

            {testResult.result !== undefined && (
              <div>
                <strong>返回结果:</strong>
                <pre
                  style={{
                    background: "#f5f5f5",
                    padding: 8,
                    borderRadius: 4,
                    margin: "4px 0 0 0",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-all",
                  }}
                >
                  {typeof testResult.result === "object"
                    ? JSON.stringify(testResult.result, null, 2)
                    : String(testResult.result)}
                </pre>
              </div>
            )}
          </div>
        </Flex>
      );
    }
  };

  return (
    <>
      <Modal
        title={isAdd ? "新增监控端点" : "编辑监控端点"}
        open={isOpen}
        onOk={onSave}
        width={700}
        loading={isLoading || adding || updating}
        onCancel={onCancel}
        destroyOnClose
        afterClose={() => {
          form.resetFields();
          setTestResult(null);
        }}
      >
        <Form
          form={form}
          layout="vertical"
          disabled={isReadonly}
          initialValues={{
            hostId: hostId,
            enabled: true,
            type: "CONFIG",
            method: "GET",
            timeout: 10,
            intervalTime: 30,
            bodyContentType: "json",
          }}
          style={{
            marginTop: 16,
            // maxHeight: "60vh",
            // overflowY: "auto",
            // overflowX: "hidden",
          }}
        >
          <Skeleton active loading={isLoading}>
            <Form.Item
              label="端点名称"
              name="name"
              rules={[{ required: true, message: "请输入端点名称" }]}
            >
              <Input placeholder="请输入端点名称" />
            </Form.Item>

            <Form.Item label="描述" name="desc">
              <Input.TextArea rows={2} placeholder="请输入描述（可选）" />
            </Form.Item>

            <Form.Item
              label="端点类型"
              name="type"
              tooltip={
                <div>
                  <div>CONFIG: 通过配置参数进行探测</div>
                  <div>CODE: 通过编写代码进行探测</div>
                </div>
              }
            >
              <Radio.Group>
                <Radio.Button value="CONFIG">配置模式</Radio.Button>
                <Radio.Button value="CODE">编码模式</Radio.Button>
              </Radio.Group>
            </Form.Item>

            {endpointType === "CONFIG" && (
              <>
                <Form.Item label="URL" name="url" tooltip="端点的具体请求路径">
                  <Input placeholder="例如: /api/health" />
                </Form.Item>

                <Form.Item label="请求方法" name="method">
                  <Select
                    placeholder="请选择请求方法"
                    options={[
                      { label: "GET", value: "GET" },
                      { label: "POST", value: "POST" },
                      { label: "PUT", value: "PUT" },
                      { label: "DELETE", value: "DELETE" },
                      { label: "PATCH", value: "PATCH" },
                      { label: "HEAD", value: "HEAD" },
                      { label: "OPTIONS", value: "OPTIONS" },
                    ]}
                  />
                </Form.Item>

                <Form.Item label="请求头 (JSON)" name="headers">
                  <Input.TextArea
                    rows={4}
                    placeholder='例如: {"Authorization": "Bearer token"}'
                  />
                </Form.Item>

                <Form.Item label="请求体编码" name="bodyContentType">
                  <Select
                    placeholder="请选择请求体编码类型"
                    options={[
                      { label: "JSON", value: "json" },
                      {
                        label: "x-www-form-urlencoded",
                        value: "x-www-form-urlencoded",
                      },
                      { label: "XML", value: "xml" },
                    ]}
                  />
                </Form.Item>

                <Form.Item
                  label="请求体内容"
                  name="bodyContent"
                  tooltip="请求体的内容。JSON/Form编码时输入JSON格式，XML编码时直接输入XML字符串"
                >
                  <Input.TextArea
                    rows={4}
                    placeholder='JSON/Form: {"key": "value"}&#10;XML: <root>...</root>'
                  />
                </Form.Item>

                <Form.Item label="超时时间 (秒)" name="timeout">
                  <InputNumber
                    style={{ width: "100%" }}
                    min={1}
                    max={300}
                    placeholder="例如: 10"
                  />
                </Form.Item>
              </>
            )}

            {/* CODE 模式字段 */}
            {endpointType === "CODE" && (
              <>
                <Form.Item
                  label="代码内容"
                  name="codeContent"
                  tooltip="编写探测逻辑代码，可使用 http 和 env 全局对象"
                  rules={[{ required: true, message: "请输入代码内容" }]}
                >
                  <CodeEditor
                    height={300}
                    language="javascript"
                    toolbarExtra={
                      <Space size="small">
                        <Button
                          type="link"
                          size="small"
                          icon={<PlayCircleOutlined />}
                          loading={testLoading}
                          onClick={onTestCode}
                        >
                          测试运行
                        </Button>
                        <Dropdown
                          menu={{
                            items: codeTemplates.map((t, index) => ({
                              key: index,
                              label: `${t.name} - ${t.description}`,
                              onClick: () =>
                                form.setFieldValue("codeContent", t.code),
                            })),
                          }}
                        >
                          <Button type="text" size="small">
                            选择示例代码 <DownOutlined />
                          </Button>
                        </Dropdown>
                      </Space>
                    }
                  />
                </Form.Item>

                {renderExecutorTestResult()}
              </>
            )}

            {/* 通用字段 */}
            <Form.Item
              label="探测间隔 (秒)"
              name="intervalTime"
              tooltip="每多少秒发送一次请求"
            >
              <InputNumber
                style={{ width: "100%" }}
                min={1}
                placeholder="例如: 60 (每60秒执行一次)"
              />
            </Form.Item>

            <Form.Item label="启用状态" name="enabled" valuePropName="checked">
              <Switch checkedChildren="启用" unCheckedChildren="禁用" />
            </Form.Item>
          </Skeleton>
        </Form>
      </Modal>
    </>
  );
};
