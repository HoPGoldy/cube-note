import React, { FC } from "react";
import { ArticleMenuItem, TabTypes } from "@/types/article";
import { stateCurrentTab } from "@/store/menu";
import { Link, useNavigate } from "react-router-dom";
import { TreeMenu } from "@//components/tree-menu";
import {
  PlusOutlined,
  RollbackOutlined,
  LinkOutlined,
  InsertRowLeftOutlined,
} from "@ant-design/icons";
import { Button, Col, Row, Space, Tooltip } from "antd";
import s from "./styles.module.css";
import { EMPTY_CLASSNAME, tabOptions, useMenu } from "./use-menu";
import Loading from "../loading";
import { useSetAtom } from "jotai";

export const Sidebar: FC = () => {
  const setCurrentTab = useSetAtom(stateCurrentTab);
  const menu = useMenu();
  const navigate = useNavigate();

  const renderMenuItem = (item: ArticleMenuItem) => {
    return (
      <Link key={item.id} to={`/article/${item.id}`}>
        <div className={s.menuItem} title={item.title}>
          <span className="truncate">{item.title}</span>
          {item.color && (
            <div
              className="flex-shrink-0 w-3 h-3 rounded"
              style={{ backgroundColor: item.color }}
            />
          )}
        </div>
      </Link>
    );
  };

  /** 渲染下属文章列表 */
  const renderSubMenu = () => {
    if (menu.linkLoading) {
      return <Loading tip="加载中..." className="my-8" />;
    }
    const currentMenu = menu.articleLink?.data?.childrenArticles || [];
    // console.log('🚀 ~ 下属文章列表', currentMenu)

    return (
      <>
        {menu.parentArticleIds && (
          <Link
            to={`/article/${menu.parentArticleIds[menu.parentArticleIds.length - 1]}`}
          >
            <Button
              className={`${s.toolBtn} keep-antd-style`}
              icon={<RollbackOutlined />}
              block
            >
              返回{menu.parentArticleTitle}
            </Button>
          </Link>
        )}
        {currentMenu.length === 0 ? (
          <div className={EMPTY_CLASSNAME}>暂无子笔记</div>
        ) : (
          currentMenu.map(renderMenuItem)
        )}

        <Button
          className={`${s.toolBtn} keep-antd-style`}
          icon={<PlusOutlined />}
          onClick={menu.createArticle}
          block
        >
          创建子笔记
        </Button>
      </>
    );
  };

  /** 渲染相关文章列表 */
  const renderRelatedMenu = () => {
    if (menu.relatedLinkLoading) {
      return <Loading tip="加载中..." className="my-8" />;
    }
    const currentMenu = menu.articleRelatedLink?.data?.relatedArticles || [];
    // console.log('🚀 ~ 相关文章列表', currentMenu)

    const addRelateBtn = (
      <TreeMenu
        key="related-tree"
        value={menu.selectedRelatedArticleIds}
        onChange={menu.onUpdateRelatedArticleIds}
        onClickNode={menu.onUpdateRelatedList}
        treeData={menu.articleTree?.data?.children || []}
      >
        <Button
          className={`${s.toolBtn} keep-antd-style`}
          icon={<LinkOutlined />}
          block
        >
          关联其他笔记
        </Button>
      </TreeMenu>
    );

    if (currentMenu.length === 0) {
      return (
        <>
          {<div className={EMPTY_CLASSNAME}>暂无相关笔记</div>}
          {addRelateBtn}
        </>
      );
    }

    return (
      <>
        {currentMenu.map(renderMenuItem)}
        {addRelateBtn}
      </>
    );
  };

  /** 渲染收藏文章列表 */
  const renderFavoriteMenu = () => {
    if (menu.favoriteLoading) {
      return <Loading tip="加载中..." className="my-8" />;
    }
    const currentMenu = menu.articleFavorite?.data || [];
    // console.log('🚀 ~ 收藏文章列表', currentMenu)

    return (
      <>
        {currentMenu.length === 0 ? (
          <div className={EMPTY_CLASSNAME}>暂无收藏</div>
        ) : (
          currentMenu.map(renderMenuItem)
        )}
      </>
    );
  };

  const renderCurrentMenu = () => {
    switch (menu.currentTab) {
      case TabTypes.Sub:
        return renderSubMenu();
      case TabTypes.Related:
        return renderRelatedMenu();
      case TabTypes.Favorite:
        return renderFavoriteMenu();
      default:
        return null;
    }
  };

  const renderTabBtns = () => {
    return (
      <Row gutter={8}>
        {tabOptions.map((item) => {
          const className = [s.toolBtn, "keep-antd-style"];
          if (item.value === menu.currentTab) className.push(s.selectedToolBtn);
          return (
            <Col span={8} key={item.value}>
              <Tooltip
                title={item.sidebarLabel}
                placement="bottom"
                color="#4b5563"
              >
                <Button
                  className={className.join(" ")}
                  onClick={() => setCurrentTab(item.value)}
                  // style={{ backgroundColor: item.value === menu.currentTab ? '#f0f0f0' : '' }}
                  icon={item.icon}
                  block
                ></Button>
              </Tooltip>
            </Col>
          );
        })}
      </Row>
    );
  };

  return (
    <section className={s.sideberBox}>
      {renderTabBtns()}

      <div className="flex-grow flex-shrink overflow-y-auto noscrollbar overflow-x-hidden my-3">
        <Space direction="vertical" style={{ width: "100%" }}>
          {renderCurrentMenu()}
        </Space>
      </div>
      <TreeMenu
        treeData={menu.articleTree?.data?.children || []}
        onClickNode={(node) => navigate(`/article/${node.value}`)}
      >
        <Button
          className={`${s.toolBtn} keep-antd-style`}
          icon={<InsertRowLeftOutlined />}
          block
        >
          笔记树
        </Button>
      </TreeMenu>
    </section>
  );
};
