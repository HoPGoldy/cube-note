import { useEffect, useRef, useState } from "react";
import { autoSaveContent } from "@/services/article";
import { messageError } from "@/utils/message";
import { useThrottleFn } from "ahooks";
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
  const [autoSaveTip, setAutoSaveTip] = useState("");

  const { run } = useThrottleFn(
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
    { wait: 5000 },
  );

  useEffect(() => {
    setAutoSaveTip("");
  }, [props.articleId]);

  useEffect(() => {
    contentRef.current = props.content;
  }, [props.content]);

  return {
    autoSaveTip,
    setAutoSaveTip,
    isContentModified,
    run,
  };
};
