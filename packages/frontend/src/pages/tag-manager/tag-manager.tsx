import { FC, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PageContent,
  PageAction,
  ActionIcon,
} from "@/layouts/page-with-action";
import { TagListItem } from "@/types/tag";
import { useQueryTagList } from "@/services/tag";
import Loading from "@/layouts/loading";
import { useBatchOperation } from "./use-batch-operation";
import { Button, Card, Checkbox, Col, Flex, Row } from "antd";
import {
  LeftOutlined,
  BuildOutlined,
  DownSquareOutlined,
  DiffOutlined,
  ExportOutlined,
  BgColorsOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { MobileArea } from "@/layouts/responsive";
import { usePageTitle } from "@/store/global";
import { useTagDetailAction } from "../tag-detail/use-detail-action";
import { ColorPicker } from "@/components/color-picker";
import { ColorDot } from "@/components/color-picker/color-dot";

/**
 * 标签管理
 * 可以新增标签，设置标签颜色，删除标签
 */
const TagManager: FC = () => {
  usePageTitle("标签管理");
  const navigate = useNavigate();

  const [showColorPicker, setShowColorPicker] = useState(false);
  const { tagList, isLoading: isLoadingTagList } = useQueryTagList();
  const tagDetailActions = useTagDetailAction();
  const batchOpts = useBatchOperation();

  const renderTagItem = (item: TagListItem) => {
    const checked = batchOpts.selectedTagIds.includes(item.id);
    return (
      <Col key={item.id} xs={24} sm={12} md={8} lg={6} xl={4} className="p-1">
        <Card
          styles={{ body: { padding: "12px 16px" } }}
          className="hover:ring-2 ring-gray-300 dark:ring-neutral-500 transition-all cursor-pointer"
          onClick={() => {
            if (!batchOpts.isBatch) {
              tagDetailActions.onEdit(item.id);
              return;
            }

            if (!checked) {
              batchOpts.setSelectedTagIds([
                ...batchOpts.selectedTagIds,
                item.id,
              ]);
            } else {
              batchOpts.setSelectedTagIds(
                batchOpts.selectedTagIds.filter((id) => id !== item.id),
              );
            }
          }}
        >
          <Flex gap={8} justify="space-between" align="center">
            <Flex gap={8} justify="flex-start" align="center">
              {batchOpts.isBatch && <Checkbox checked={checked} />}
              <div>{item.title}</div>
            </Flex>
            <ColorDot color={item.color} />
          </Flex>
        </Card>
      </Col>
    );
  };

  const renderBatchBtn = () => {
    if (!batchOpts.isBatch) {
      return (
        <Button
          onClick={() => batchOpts.setIsBatch(true)}
          icon={<DiffOutlined />}
        >
          批量操作
        </Button>
      );
    }

    return (
      <>
        <Button
          onClick={() => {
            batchOpts.setIsBatch(false);
            batchOpts.setSelectedTagIds([]);
          }}
          icon={<ExportOutlined />}
        >
          退出批量操作
        </Button>
        <Button
          onClick={() => setShowColorPicker(true)}
          icon={<BgColorsOutlined />}
        >
          批量设置颜色
        </Button>
        <Button
          onClick={batchOpts.onSaveDelete}
          danger
          icon={<DeleteOutlined />}
        >
          批量删除
        </Button>
      </>
    );
  };

  const renderContent = () => {
    if (isLoadingTagList) return <Loading />;

    return (
      <Flex vertical gap="md">
        <Flex justify="flex-end" align="center" gap={8}>
          <Button
            onClick={tagDetailActions.onAdd}
            type="primary"
            icon={<PlusOutlined />}
          >
            新增标签
          </Button>
          {renderBatchBtn()}
        </Flex>
        <Row>{tagList.map(renderTagItem)}</Row>
      </Flex>
    );
  };

  return (
    <>
      <PageContent>
        <div className="box-border p-2 flex flex-col flex-nowrap h-full">
          <div className="flex-grow overflow-y-auto overflow-x-hidden">
            <MobileArea>
              <Card
                size="small"
                className="text-center text-base font-bold mb-2"
              >
                标签管理
              </Card>
            </MobileArea>
            {renderContent()}
          </div>
        </div>
      </PageContent>
      <PageAction>
        <ActionIcon icon={<LeftOutlined />} onClick={() => navigate(-1)} />
        <ActionIcon
          icon={batchOpts.isBatch ? <DownSquareOutlined /> : <BuildOutlined />}
          onClick={() => batchOpts.setIsBatch(!batchOpts.isBatch)}
        />
      </PageAction>

      <ColorPicker
        onChange={batchOpts.onSaveColor}
        visible={showColorPicker}
        onClose={() => setShowColorPicker(false)}
      />
    </>
  );
};

export default TagManager;
