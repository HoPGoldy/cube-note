import { Tag } from "@/components/tag";
import Loading from "@/layouts/loading";
import { TagListItem } from "@/types/tag";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { TagPicker } from "@/components/tag-picker";

interface Props {
  tagList?: TagListItem[];
  isTagLoading: boolean;
  setCurrentPage: (page: number) => void;
}

export const useTagArea = (props: Props) => {
  const { tagList, isTagLoading, setCurrentPage } = props;
  const [searchParams, setSearchParams] = useSearchParams();
  // 当前选中的标签
  const [selectedTag, setSelectedTag] = useState<string[]>(() => {
    return (
      searchParams
        .get("tagIds")
        ?.split(",")
        ?.map((id) => id.trim()) || []
    );
  });
  /** 移动端标签选择是否展开 */
  const [isTagDrawerOpen, setIsTagDrawerOpen] = useState(false);

  const isTagSelected = (id: string) => {
    return selectedTag.includes(id);
  };

  const onSelectTag = (id: string) => {
    // 如果有了就删除，没有就添加
    const newTags = isTagSelected(id)
      ? selectedTag.filter((item) => item !== id)
      : [...selectedTag, id];

    setSelectedTag(newTags);
    setCurrentPage(1);

    // 更新 url 参数
    if (newTags.length > 0) searchParams.set("tagIds", newTags.join(","));
    else searchParams.delete("tagIds");
    setSearchParams(searchParams, { replace: true });
  };

  const renderTag = (item: TagListItem) => {
    return (
      <Tag
        key={item.id}
        color={item.color}
        selected={isTagSelected(item.id)}
        onClick={() => onSelectTag(item.id)}
      >
        {item.title}
      </Tag>
    );
  };

  const renderTagSelectPanel = () => {
    if (isTagLoading) return <Loading tip="加载标签中..." />;

    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {tagList?.map(renderTag)}
      </div>
    );
  };

  const renderMobileTagSelectPanel = () => {
    return (
      <TagPicker
        selectedTags={selectedTag}
        open={isTagDrawerOpen}
        onClose={() => setIsTagDrawerOpen(false)}
        onSelected={(item) => onSelectTag(item.id)}
      />
    );
  };

  return {
    renderTagSelectPanel,
    renderMobileTagSelectPanel,
    setIsTagDrawerOpen,
    selectedTag,
  };
};
