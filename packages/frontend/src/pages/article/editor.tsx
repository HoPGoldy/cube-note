import { useEffect, useMemo, useRef, useState } from "react";
import debounce from "lodash/debounce";
import { autoSaveContent } from "@/services/article";
import { messageError } from "@/utils/message";
import { useIsMobile } from "@/layouts/responsive";
import { Editor } from "@/components/markdown-editor";
import { PreviewType } from "@uiw/react-md-editor";

interface Props {
  onAutoSave: () => void;
  articleId: string;
}

export const useEditor = (props: Props) => {
  const isMobile = useIsMobile();
  // 正在编辑的文本内容
  const [content, setContent] = useState("");
  // 内容是否被编辑了
  const isContentModified = useRef(false);
  // 自动保存的引用，防止闭包陷阱
  const contentRef = useRef(content);

  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  // 自动保存
  const autoSave = async (id: string) => {
    const resp = await autoSaveContent(id, contentRef.current);
    if (!resp.success) {
      messageError("自动保存失败");
      localStorage.setItem("article-autosave-content", content);
      localStorage.setItem("article-autosave-id", id.toString());
      localStorage.setItem("article-autosave-date", Date.now().toString());
      return;
    }

    props.onAutoSave();
  };

  // 编辑时的节流
  const onContentChangeThrottle = useMemo(
    () =>
      debounce(() => {
        autoSave(props.articleId);
      }, 1000),
    [props.articleId],
  );

  // 编辑时触发节流
  const onContentChange = (newContent: string) => {
    setContent(newContent);
    isContentModified.current = true;
    onContentChangeThrottle();
  };

  const renderEditor = () => {
    return (
      <Editor
        value={content}
        preview={(isMobile ? "edit" : "live") as PreviewType}
        onChange={onContentChange}
      />
    );
  };

  return {
    renderEditor,
    setEditorContent: setContent,
    content,
    isContentModified,
  };
};
