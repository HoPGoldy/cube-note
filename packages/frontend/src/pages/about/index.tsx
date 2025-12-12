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
      title="关于应用 Cube Note"
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
          专为个人构建的轻量级笔记应用。包含支持文件上传的 Markdown
          编辑器、双端响应式布局、数据自托管、支持搜索、标签、笔记嵌套等功能。
        </div>

        <a
          href="mailto:hopgoldy@gmail.com?&subject=cube-Note 相关"
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
