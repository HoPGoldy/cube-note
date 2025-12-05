import { FC, useState } from "react";
import { AddTag, EditTagEntry, Tag } from "@/components/tag";
import { useAddTag, useQueryTagList } from "@/services/tag";
import { useUpdateArticle } from "@/services/article";
import { useNavigate } from "react-router-dom";
import { TagPicker } from "@/components/tag-picker";
import { Draggable } from "@/components/draggable";
import { useTagDict } from "../tag-manager/tag-hooks";
import { PageLoading } from "@/components/page-loading";

interface Props {
  /**
   * 当前文章 id
   */
  articleId: string;
  /**
   * 当前文章选中的标签
   */
  value: number[];
  /**
   * 是否禁用编辑
   */
  disabled?: boolean;
}

const TagArea: FC<Props> = (props) => {
  const { articleId, value = [], disabled } = props;
  const navigate = useNavigate();
  // 新增标签
  const { mutateAsync: addTag, isPending: isAddingTag } = useAddTag();
  // 整个标签列表
  const { data: tagListResp, isLoading: isLoadingTagList } = useQueryTagList();
  // 标签映射
  const tagDict = useTagDict(tagListResp?.data);
  // 更新文章选中的标签列表
  const { mutateAsync: updateArticle } = useUpdateArticle();
  // 是否处于编辑状态
  const [editingTag, setEditingTag] = useState(false);

  const onClickAddBtn = async (newLabel: string) => {
    if (!newLabel) return;
    // 先添加标签
    const resp = await addTag({ title: newLabel, color: "#404040" });
    if (!resp?.data) return;

    // 再更新文章的标签列表
    updateArticle({ id: articleId, tagIds: [...value, resp.data] });
  };

  const onClickTag = (id: number) => {
    if (disabled) {
      navigate(`/search?tagIds=${id}`);
      return;
    }
  };

  /** 选择 / 取消选择标签 */
  const onPickTag = (id: number) => {
    // 更新文章的标签列表
    const newSelected = value.includes(id)
      ? value.filter((v) => v !== id)
      : [...value, id];

    updateArticle({ id: articleId, tagIds: newSelected });
  };

  /** 更新排序 */
  const onChangeOrder = (newOrder: number[]) => {
    updateArticle({
      id: articleId,
      tagIds: newOrder.filter(Boolean),
    });
  };

  const renderTagItem = (itemId: number) => {
    const tagInfo = tagDict.get(itemId);
    if (!tagInfo) return null;

    return (
      <div className="inline-block max-w-full overflow-hidden" key={itemId}>
        {tagInfo && (
          <Tag color={tagInfo.color} onClick={() => onClickTag(itemId)}>
            {tagInfo.title}
          </Tag>
        )}
      </div>
    );
  };

  const renderTagList = () => {
    if (isLoadingTagList) return <PageLoading tip="标签加载中..." />;
    if (!value) return <div>暂无标签</div>;
    const existTagIds = value.filter((id) => tagDict.has(id));

    return (
      <Draggable
        className="w-full"
        value={existTagIds}
        renderItem={renderTagItem}
        onChange={onChangeOrder}
        extra={
          <>
            {!disabled && (
              <div className="inline-block truncate" key="add">
                <AddTag onFinish={onClickAddBtn} loading={isAddingTag} />
              </div>
            )}
            {!disabled && (
              <div className="inline-block truncate" key="pick">
                <EditTagEntry
                  onClick={() => setEditingTag(!editingTag)}
                  label="选择标签"
                />
              </div>
            )}
          </>
        }
      />
    );
  };

  return (
    <>
      {renderTagList()}
      <TagPicker
        selectedTags={value}
        open={editingTag}
        onClose={() => setEditingTag(false)}
        onSelected={(item) => onPickTag(item.id)}
      />
    </>
  );
};

export default TagArea;
