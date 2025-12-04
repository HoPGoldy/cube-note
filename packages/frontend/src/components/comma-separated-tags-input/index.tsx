import React, { useState, useEffect } from "react";
import { Select } from "antd";

interface CommaSeparatedTagsInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

export const CommaSeparatedTagsInput: React.FC<
  CommaSeparatedTagsInputProps
> = ({
  value = "",
  onChange,
  placeholder = "请输入标签，可直接输入或从下拉选择",
}) => {
  // 将逗号分隔的字符串转换为数组
  const getDefaultTags = () => {
    if (!value) return [];
    return value
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag);
  };

  const [tags, setTags] = useState<string[]>(getDefaultTags());

  // 当外部value变化时，更新内部状态
  useEffect(() => {
    setTags(getDefaultTags());
  }, [value]);

  const handleChange = (newTags: string[]) => {
    setTags(newTags);
    // 将数组转换为逗号分隔的字符串
    onChange?.(newTags.join(", "));
  };

  return (
    <Select
      mode="tags"
      style={{ width: "100%" }}
      placeholder={placeholder}
      value={tags}
      onChange={handleChange}
      tokenSeparators={[","]}
    />
  );
};
