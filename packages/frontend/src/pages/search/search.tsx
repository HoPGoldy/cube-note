import { useQueryArticleList } from "@/services/article";
import { SearchArticleDetail } from "@/types/article";
import { FC, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  PageContent,
  PageAction,
  ActionIcon,
  ActionSearch,
} from "@/layouts/page-with-action";
import { useQueryTagList } from "@/services/tag";
import { useTagDict } from "@/pages/tag-manager/use-tag-dict";
import { Tag } from "@/components/tag";
import { Card, Col, Flex, Input, Pagination, Row, Space } from "antd";
import { DEFAULT_PAGE_SIZE } from "@/config";
import { DesktopArea } from "@/layouts/responsive";
import { LeftOutlined } from "@ant-design/icons";
import { usePageTitle } from "@/store/global";
import { getColorValue } from "@/components/color-picker/color-dot";
import { ColorList } from "@/components/color-picker";
import { EmptyTip } from "@/components/empty-tip";

/**
 * 搜索页面
 * 可以通过关键字和标签来搜索笔记
 */
const SearchArticle: FC = () => {
  usePageTitle("搜索笔记");
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  // 搜索关键字
  const [keyword, setKeyword] = useState(
    () => searchParams.get("keyword") || "",
  );
  // 获取标签列表
  const { tagList } = useQueryTagList();
  // 标签映射
  const tagDict = useTagDict();
  // 当前分页
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedTag, setSelectedTag] = useState<string[]>();
  // 搜索结果列表
  const {
    status: searchStatus,
    articleList,
    total,
    isLoading: isSearching,
  } = useQueryArticleList({
    keyword,
    tagIds: selectedTag,
    page: currentPage,
  });

  const renderTagItem = (tagId: number) => {
    const item = tagDict.get(tagId);
    if (!item) return null;

    return (
      <Tag key={item.id} color={item.color}>
        {item.title}
      </Tag>
    );
  };

  const onKeywordSearch = (value: string) => {
    setKeyword(value);
    setCurrentPage(1);

    // 更新 url 参数
    if (value) searchParams.set("keyword", value);
    else searchParams.delete("keyword");
    setSearchParams(searchParams, { replace: true });
  };

  const renderSearchItem = (item: SearchArticleDetail) => {
    const colorfulTitle = item.title.replace(
      keyword,
      `<span class='text-red-500'>${keyword}</span>`,
    );
    const colorfulContent = item.content.replace(
      keyword,
      `<span class='text-red-500'>${keyword}</span>`,
    );
    return (
      <Link to={`/article/${item.id}`} key={item.id} className="w-full">
        <Card
          className="mb-4 hover:ring-2 ring-gray-300 dark:ring-neutral-500 transition-shadow"
          size="small"
        >
          <Row justify="space-between">
            <Col xs={24} md={{ flex: "auto", span: 12 }}>
              <div
                className="font-bold text-lg"
                dangerouslySetInnerHTML={{ __html: colorfulTitle }}
              />
            </Col>
            <Col xs={24} md={{ flex: "1", span: 12 }}>
              <Space
                wrap
                size={[0, 8]}
                className="flex flex-wrap md:flex-row-reverse mt-2 md:mt-0"
              >
                {item.tagIds?.map(renderTagItem)}
              </Space>
            </Col>
            <Col span={24}>
              <div
                className="text-sm text-gray-600 dark:text-neutral-300 mt-2"
                dangerouslySetInnerHTML={{ __html: colorfulContent }}
              />
            </Col>
          </Row>
        </Card>
      </Link>
    );
  };

  const onSelectTag = (id: string) => {
    // 如果有了就删除，没有就添加
    const newTags = selectedTag.includes(id)
      ? selectedTag.filter((item) => item !== id)
      : [...selectedTag, id];

    setSelectedTag(newTags);
    setCurrentPage(1);

    // 更新 url 参数
    if (newTags.length > 0) searchParams.set("tagIds", newTags.join(","));
    else searchParams.delete("tagIds");
    setSearchParams(searchParams, { replace: true });
  };

  const renderTagArea = () => {
    return (
      <div>
        {tagList.map((tag) => {
          return (
            <Tag
              key={tag.id}
              color={getColorValue(tag.color)}
              onClick={() => onSelectTag(tag.id)}
            >
              {tag.title}
            </Tag>
          );
        })}
      </div>
    );
  };

  const renderColorList = () => {
    return <ColorList />;
  };

  const renderSearchList = () => {
    if (isSearching) {
      return <EmptyTip title="正在搜索中..." subTitle="请稍候" />;
    }
    if (searchStatus === "pending") {
      return <EmptyTip subTitle="可使用关键词、标签和颜色进行搜索" />;
    }
    if (articleList.length === 0) {
      return (
        <EmptyTip title="没有找到相关笔记" subTitle="请尝试其他关键字或标签" />
      );
    }

    return (
      <Flex vertical align="center" gap={8} className="w-full">
        {articleList.map(renderSearchItem)}
        <Pagination
          total={total}
          pageSize={DEFAULT_PAGE_SIZE}
          current={currentPage}
          onChange={setCurrentPage}
        />
      </Flex>
    );
  };

  const renderContent = () => {
    return (
      <Flex vertical gap={16} align="center" className="p-4">
        <DesktopArea>
          <Input.Search
            placeholder="请输入标题或者正文，回车搜索"
            enterButton="搜索"
            autoFocus
            size="large"
            onSearch={onKeywordSearch}
          />
        </DesktopArea>
        {renderColorList()}
        {renderTagArea()}
        {renderSearchList()}
      </Flex>
    );
  };

  return (
    <>
      <PageContent>{renderContent()}</PageContent>

      <PageAction>
        <ActionIcon icon={<LeftOutlined />} onClick={() => navigate(-1)} />
        <ActionSearch onSearch={onKeywordSearch} />
      </PageAction>
    </>
  );
};

export default SearchArticle;
