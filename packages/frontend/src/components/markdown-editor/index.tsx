import {
  FC,
  useRef,
  useCallback,
  ClipboardEventHandler,
  useState,
} from "react";
import MDEditor, { MDEditorProps, RefMDEditor } from "@uiw/react-md-editor";
import { Button, Flex, message, Spin, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useUploadFile, useRequestFileUrl } from "@/services/attachment";
import { messageError } from "@/utils/message";

interface Props extends MDEditorProps {
  value?: string;
  onChange?: (value: string) => void;
}

export const Editor: FC<Props> = ({ value = "", onChange, ...props }) => {
  const editorRef = useRef<RefMDEditor>(null);
  const { mutateAsync: uploadFile } = useUploadFile();
  const { mutateAsync: requestFileUrl } = useRequestFileUrl();
  const [loading, setLoading] = useState(false);

  const handleUpload = async (file: File) => {
    try {
      const resp = await uploadFile(file);
      if (resp?.code !== 200) {
        message.error("上传失败");
        return false;
      }

      // 插入markdown链接，使用特殊格式 !attachment:fileId
      // 实际的文件URL在预览/点击时通过request接口获取
      const fileLink = `[${file.name}](!attachment:${resp.data.id})`;
      const newValue = value + "\n" + fileLink;
      onChange?.(newValue);
      message.success("文件上传并插入成功");
    } catch {
      message.error("上传出错");
    }
    return false;
  };

  // 处理markdown中的attachment链接
  const handleLinkClick = useCallback(
    async (e: React.MouseEvent<HTMLAnchorElement>) => {
      const href = e.currentTarget.getAttribute("href") || "";

      if (href.startsWith("!attachment:")) {
        e.preventDefault();
        const fileId = href.replace("!attachment:", "");

        try {
          const res = await requestFileUrl(fileId);
          if (res?.code === 200) {
            window.open(res.data.url);
          } else {
            message.error("获取文件链接失败");
          }
        } catch {
          message.error("下载失败");
        }
      }
    },
    [requestFileUrl],
  );

  const uploadAndInsertImg = async (fileArray: File[]) => {
    try {
      const fileMdStrings: string[] = [];

      for (const file of fileArray) {
        setLoading(true);
        const response = await uploadFile(file);
        console.log("🚀 ~ uploadAndInsertImg ~ response:", response);

        if (!response || !response.success) {
          messageError("图片上传失败");
          continue;
        }

        let fileMdString = `[](/api/attachments/request/${response.data.id})`;
        if (file.type.match(/^image\/(gif|jpe?g|a?png|bmp)/i)) {
          fileMdString = "!" + fileMdString;
        }

        fileMdStrings.push(fileMdString);
      }

      const editor = editorRef.current;
      const textarea = editor?.textarea;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      const newValue =
        value.substring(0, start) +
        "\n" +
        fileMdStrings.join("\n\n") +
        value.substring(end);
      onChange?.(newValue);
    } finally {
      setLoading(false);
    }
  };

  const onPaste: ClipboardEventHandler<HTMLDivElement> = async (e) => {
    const clipboardData = e.clipboardData;
    if (!clipboardData) return;

    const items = clipboardData.items;
    const imageFiles: File[] = [];
    //  纯图片处理
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const file = item.getAsFile();
      if (file) imageFiles.push(file);
    }

    console.log("🚀 ~ onPaste ~ imageFiles:", imageFiles);
    if (imageFiles.length <= 0) return;

    e.preventDefault();
    e.stopPropagation();
    uploadAndInsertImg(imageFiles);
  };

  return (
    <div className="relative">
      <div style={{ marginBottom: 8 }}>
        <Upload beforeUpload={handleUpload} showUploadList={false}>
          <Button type="primary" icon={<UploadOutlined />} size="small">
            上传文件到编辑器
          </Button>
        </Upload>
      </div>
      <div onClick={handleLinkClick as any}>
        <MDEditor
          ref={editorRef}
          value={value}
          onPaste={onPaste}
          onChange={(val) => onChange?.(val || "")}
          previewOptions={{
            components: {
              img: (props) => {
                console.log("image props:", props);
                return <div>233</div>;
              },
              a: (props) => {
                console.log("🚀 ~ Editor ~ props:", props);
                return <div>123321</div>;
              },
            },
          }}
          {...props}
        />
      </div>
      {loading && (
        <Flex
          align="center"
          justify="center"
          className="absolute top-0 left-0 w-full h-full bg-gray-300/30"
        >
          <Spin />
        </Flex>
      )}
    </div>
  );
};
