import { FC } from "react";
import { Flex, Modal } from "antd";
import { SendOutlined, GithubOutlined } from "@ant-design/icons";

interface AboutModalModalProps {
  open: boolean;
  onClose: () => void;
}

export const AboutModal: FC<AboutModalModalProps> = (props) => {
  return (
    <Modal
      open={props.open}
      onCancel={() => props.onClose()}
      onOk={() => props.onClose()}
      title="关于应用 Cube Probe"
      footer={(_, { OkBtn }) => (
        <Flex align="center" justify="space-between">
          <div className="text-gray-500 dark:text-gray-200">
            Powered by 💗 Yuzizi
          </div>
          <OkBtn />
        </Flex>
      )}
    >
      <Flex gap={16} vertical className="mb-4">
        <div className="mt-4 mb-2 text-base">
          轻量级探针监控应用。 包含支持 nodejs 编码方式的 web 探针监控功能和
          webhook 通知功能。
        </div>

        <a
          href="mailto:hopgoldy@gmail.com?&subject=cube-dnote 相关"
          className="p-2 text-gray-500 dark:text-neutral-200 bg-gray-100 rounded-md"
        >
          <Flex justify="space-between">
            <div className="dark:text-neutral-300">
              <SendOutlined /> &nbsp;联系我
            </div>
            <div>hopgoldy@gmail.com</div>
          </Flex>
        </a>
        <a
          href="https://github.com/HoPGoldy/frontend-app"
          className="p-2 text-gray-500 dark:text-neutral-200 bg-gray-100 rounded-md"
          target="_blank"
          rel="noreferrer"
        >
          <Flex justify="space-between">
            <div className="dark:text-neutral-300">
              <GithubOutlined /> &nbsp;开源地址
            </div>
            <div>github</div>
          </Flex>
        </a>
      </Flex>
    </Modal>
  );
};
