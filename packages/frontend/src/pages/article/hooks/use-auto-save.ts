import { useEffect, useRef, useState } from "react";
import { autoSaveContent } from "@/services/article";
import { messageError } from "@/utils/message";
import { useDebounceFn } from "ahooks";
import dayjs from "dayjs";

interface Props {
  content: string;
  articleId: string;
}

export const useAutoSave = (props: Props) => {
  // 内容是否被编辑了
  const isContentModified = useRef(false);
  // 自动保存的引用，防止闭包陷阱
  const contentRef = useRef(props.content);
  if (contentRef.current !== props.content) {
    contentRef.current = props.content;
    isContentModified.current = true;
  }

  const [autoSaveTip, setAutoSaveTip] = useState("");

  const { run } = useDebounceFn(
    async () => {
      const resp = await autoSaveContent(props.articleId, contentRef.current);
      if (!resp.success) {
        messageError("自动保存失败");
        localStorage.setItem("article-autosave-content", props.content);
        localStorage.setItem("article-autosave-id", props.articleId.toString());
        localStorage.setItem("article-autosave-date", Date.now().toString());
        return;
      }

      setAutoSaveTip(`自动保存于 ${dayjs().format("HH:mm")}`);
    },
    { wait: 1000 },
  );

  useEffect(() => {
    setAutoSaveTip("");
  }, [props.articleId]);

  return {
    autoSaveTip,
    setAutoSaveTip,
    isContentModified,
    run,
  };
};
