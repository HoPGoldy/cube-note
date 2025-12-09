import { useState } from "react";
import { useBatchDeleteTag, useBatchSetTagColor } from "../../services/tag";
import { messageSuccess, messageWarning } from "../../utils/message";

export const useBatchOperation = () => {
  // 是否处于批量操作模式
  const [isBatch, setIsBatch] = useState(false);
  // 当前选中的标签
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  // 删除标签
  const { mutateAsync: deleteTag } = useBatchDeleteTag();
  // 批量设置标签颜色
  const { mutateAsync: updateTagColor } = useBatchSetTagColor();

  const isTagSelected = (id: string) => {
    return selectedTagIds.includes(id);
  };

  const onSelectTag = (id: string) => {
    // 如果有了就删除，没有就添加
    if (isTagSelected(id))
      setSelectedTagIds(selectedTagIds.filter((item) => item !== id));
    else setSelectedTagIds([...selectedTagIds, id]);
  };

  const onSaveDelete = async () => {
    if (selectedTagIds.length === 0) {
      messageWarning("请选择需要删除的标签");
      return;
    }
    const resp = await deleteTag({ ids: selectedTagIds });
    if (!resp.success) return;

    messageSuccess("删除成功");
    setSelectedTagIds([]);
  };

  const onSaveColor = async (color: string) => {
    if (selectedTagIds.length === 0) {
      messageWarning("请选择需要设置颜色的标签");
      return;
    }

    const resp = await updateTagColor({ tagIds: selectedTagIds, color });
    if (!resp.success) return;

    messageSuccess("设置成功");
    setSelectedTagIds([]);
  };

  return {
    isBatch,
    setIsBatch,
    selectedTagIds,
    setSelectedTagIds,
    isTagSelected,
    onSelectTag,
    onSaveColor,
    onSaveDelete,
  };
};
