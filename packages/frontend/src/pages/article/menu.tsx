import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Breadcrumb, Button, Col, Flex, Row } from "antd";
import { MobileDrawer } from "@/components/mobile-drawer";
import { TreeMenu } from "@/components/tree-menu/mobile";
import {
  EMPTY_CLASSNAME,
  tabOptions,
  useMenu,
} from "@/layouts/sidebar/use-menu";
import { ArticleMenuItem, ArticleTreeNode, TabTypes } from "@/types/article";
import {
  stateCurrentArticleId,
  stateCurrentTab,
  stateParentArticleIds,
} from "@/store/menu";
import { SplitLine } from "@/components/cell";
import { useQueryArticleTree } from "@/services/article";
import { BreadcrumbItemType } from "antd/es/breadcrumb/Breadcrumb";
import { useAtomValue, useSetAtom } from "jotai";
import { useGetAppConfig } from "@/services/app-config";
import { ColorDot } from "@/components/color-picker/color-dot";

interface Props {
  currentArticleId: string;
}

/**
 * 面包屑导航
 */
export const useBreadcrumb = () => {
  const { appConfig } = useGetAppConfig();
  /** 根节点 id */
  const rootArticleId = appConfig.ROOT_ARTICLE_ID;
  /** 当前查看的文章祖先节点 */
  const parentArticleIds = useAtomValue(stateParentArticleIds);
  /** 当前文章 id */
  const currentArticleId = useAtomValue(stateCurrentArticleId);
  // 获取左下角菜单树
  const { data: articleTree } = useQueryArticleTree(rootArticleId);

  /** 当前面包屑配置项 */
  const breadcrumbConfig = useMemo(() => {
    if (!articleTree || !currentArticleId) return [];

    const pathNodes: ArticleTreeNode[] = [];
    const idPath = [...(parentArticleIds || []), currentArticleId];

    idPath.reduce(
      (prev, cur) => {
        const item = prev.find((i) => i.id === cur);
        if (!item) return [];
        pathNodes.push(item);
        return item.children || [];
      },
      articleTree?.data ? articleTree.data : [],
    );

    const config: BreadcrumbItemType[] = pathNodes.map((i) => ({
      title: (
        <div className="truncate w-fit max-w-[8rem]" title={i.title}>
          <Link to={`/article/${i.id}`}>{i.title}</Link>
        </div>
      ),
    }));

    return config;
  }, [parentArticleIds, articleTree, currentArticleId]);

  /** 渲染桌面端面包屑 */
  const renderBreadcrumb = () => {
    return (
      <Breadcrumb
        items={breadcrumbConfig}
        className="overflow-y-hidden overflow-x-auto noscrollbar"
        separator=">"
      />
    );
  };

  return { renderBreadcrumb };
};

/**
 * 笔记导航功能
 * 只有移动端会用到这个功能，桌面端这个功能由 Sidebar 组件负责
 */
export const useMobileMenu = (props: Props) => {
  const { currentArticleId } = props;
  const navigate = useNavigate();
  const menu = useMenu();
  const setCurrentMenu = useSetAtom(stateCurrentTab);
  /** 是否展开导航抽屉 */
  const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState(false);
  /** 当前 treeMenu 所处的层级 */
  const [treeMenuPath, setTreeMenuPath] = useState<string[]>([]);
  /** 面包屑功能 */
  const { renderBreadcrumb } = useBreadcrumb();

  useEffect(() => {
    const totalPath = [...(menu.parentArticleIds || []), currentArticleId];
    setTreeMenuPath(totalPath.slice(1));
  }, [menu.parentArticleIds, currentArticleId]);

  const onCloseDrawer = () => {
    setIsMenuDrawerOpen(false);
    setTreeMenuPath(menu.parentArticleIds || []);
  };

  // const onBackHomePage = () => {
  //     navigate(`/article/${menu.currentRootArticleId}`)
  //     setIsMenuDrawerOpen(false)
  // }

  /** 渲染下属文章列表 */
  const renderSubMenu = () => {
    if (!isMenuDrawerOpen) return null;
    if (menu.linkLoading) return <div className="my-8">加载中...</div>;

    return (
      <>
        <TreeMenu
          value={treeMenuPath}
          onChange={setTreeMenuPath}
          onClickNode={(node) => {
            navigate(`/article/${node.id}`);
            setIsMenuDrawerOpen(false);
          }}
          treeData={menu?.articleTree?.data?.[0]?.children || []}
        />
      </>
    );
  };

  const renderMenuItem = (
    item: ArticleMenuItem,
    index: number,
    list: ArticleMenuItem[],
  ) => {
    return (
      <div key={item.id}>
        <div
          className="py-2 px-4 flex justify-between items-center h-[32px] text-base"
          onClick={() => {
            navigate(`/article/${item.id}`);
            setIsMenuDrawerOpen(false);
          }}
        >
          <span className="truncate">{item.title}</span>
          <ColorDot color={item.color} />
        </div>
        {index < list.length - 1 ? <SplitLine /> : null}
      </div>
    );
  };

  /** 渲染收藏文章列表 */
  const renderFavoriteMenu = () => {
    if (menu.favoriteLoading) return <div className="my-8">加载中...</div>;
    const currentMenu = menu.articleFavorite?.data || [];
    // console.log('🚀 ~ 收藏文章列表', currentMenu)

    return (
      <>
        {currentMenu.length === 0 ? (
          <div className={EMPTY_CLASSNAME}>暂无收藏</div>
        ) : (
          currentMenu.map((i, index) => renderMenuItem(i, index, currentMenu))
        )}
      </>
    );
  };

  const renderCurrentMenu = () => {
    switch (menu.currentTab) {
      case TabTypes.Sub:
        return renderSubMenu();
      case TabTypes.Favorite:
        return renderFavoriteMenu();
      default:
        return null;
    }
  };

  const renderMenuDrawer = () => {
    return (
      <MobileDrawer
        title={
          <div className="w-[95vw] overflow-x-auto">{renderBreadcrumb()}</div>
        }
        open={isMenuDrawerOpen}
        onClose={onCloseDrawer}
        footer={
          <Row gutter={8}>
            {/* <Col flex="0">
              <Button
                size="large"
                icon={<HomeOutlined />}
                onClick={onBackHomePage}
              />
            </Col> */}
            <Col flex="1">
              <Button block size="large" onClick={onCloseDrawer}>
                关闭
              </Button>
            </Col>
          </Row>
        }
        height="80%"
      >
        <div className="flex flex-col flex-nowrap h-full">
          <div className="flex-grow overflow-y-auto">{renderCurrentMenu()}</div>
          <div className="flex-shrink-0 mx-2">
            <Flex gap={8}>
              {tabOptions.map((tab) => {
                return (
                  <Button
                    key={tab.value}
                    size="large"
                    block
                    type={menu.currentTab === tab.value ? "primary" : "default"}
                    onClick={() => setCurrentMenu(tab.value)}
                    icon={tab.icon}
                  >
                    {tab.label}
                  </Button>
                );
              })}
            </Flex>
          </div>
        </div>
      </MobileDrawer>
    );
  };

  return { menu, renderMenuDrawer, setIsMenuDrawerOpen };
};
