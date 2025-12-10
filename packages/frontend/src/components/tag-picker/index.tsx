import { FC } from "react";
import { Button, Card, Col, Flex, Modal, Row, Space } from "antd";
import { MobileDrawer } from "@/components/mobile-drawer";
import { TagListItem } from "@/types/tag";
import { useQueryTagList } from "@/services/tag";
import { ControlOutlined } from "@ant-design/icons";
import { Tag } from "@/components/tag";
import Loading from "@/layouts/loading";
import { useIsMobile } from "@/layouts/responsive";
import { useNavigate } from "react-router-dom";
import { ColorDot, getColorValue } from "../color-picker/color-dot";

interface Props {
  open: boolean;
  onClose: () => void;
  selectedTags: string[];
  onSelected: (item: TagListItem) => void;
}

/**
 * 标签选择器
 */
export const TagPicker: FC<Props> = (props) => {
  const { open, onClose, selectedTags, onSelected } = props;
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const { tagList, isLoading: isTagLoading } = useQueryTagList();
  console.log("🚀 ~ TagPicker ~ tagList:", tagList);

  const renderTag = (item: TagListItem) => {
    return (
      <Tag
        key={item.id}
        color={getColorValue(item.color)}
        selected={selectedTags.includes(item.id)}
        onClick={() => onSelected(item)}
      >
        {item.title}
      </Tag>
    );
    return (
      <Card
        key={item.id}
        color={item.color}
        // selected={selectedTags.includes(item.id)}
        styles={{ body: { padding: "6px 16px" } }}
        onClick={() => onSelected(item)}
      >
        <Flex align="center" gap={8}>
          <div>{item.title}</div>
          {item.color && <ColorDot color={item.color} />}
        </Flex>
      </Card>
    );
  };

  const renderContent = () => {
    if (isTagLoading) return <Loading tip="加载标签中..." />;

    return (
      <div className="mx-2">
        <Space wrap size={[8, 8]}>
          {tagList.map(renderTag)}
        </Space>
      </div>
    );
  };

  const renderModal = () => {
    if (isMobile)
      return (
        <MobileDrawer
          title="标签选择"
          open={open}
          onClose={onClose}
          footer={
            <Row gutter={8}>
              <Col flex="0">
                <Button
                  size="large"
                  icon={<ControlOutlined />}
                  onClick={() => navigate("/tags")}
                />
              </Col>
              <Col flex="1">
                <Button block size="large" onClick={onClose}>
                  关闭
                </Button>
              </Col>
            </Row>
          }
        >
          {renderContent()}
        </MobileDrawer>
      );

    return (
      <Modal
        title="标签选择"
        open={open}
        onCancel={onClose}
        onOk={onClose}
        cancelButtonProps={{
          onClick: () => navigate("/tags"),
        }}
        cancelText="管理标签"
      >
        {renderContent()}
      </Modal>
    );
  };

  return renderModal();
};
