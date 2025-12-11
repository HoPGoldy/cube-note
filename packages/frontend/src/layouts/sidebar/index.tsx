import React, { FC } from "react";
import { ArticleMenuItem, TabTypes } from "@/types/article";
import { stateCurrentTab } from "@/store/menu";
import { Link, useNavigate } from "react-router-dom";
import { TreeMenu } from "@//components/tree-menu";
import {
  PlusOutlined,
  RollbackOutlined,
  InsertRowLeftOutlined,
} from "@ant-design/icons";
import { Button, Col, Row, Tooltip } from "antd";
import s from "./styles.module.css";
import { EMPTY_CLASSNAME, tabOptions, useMenu } from "./use-menu";
import Loading from "../loading";
import { useSetAtom } from "jotai";
import { ColorDot } from "@/components/color-picker/color-dot";

export const Sidebar: FC = () => {
  const setCurrentTab = useSetAtom(stateCurrentTab);
  const menu = useMenu();
  const navigate = useNavigate();

  const renderMenuItem = (item: ArticleMenuItem) => {
    return (
      <Link key={item.id} to={`/article/${item.id}`}>
        <div className={s.menuItem} title={item.title}>
          <span className="truncate">{item.title}</span>
          <ColorDot color={item.color} />
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

    return (
      <>
        {menu.parentArticleIds && (
          <Link
            to={`/article/${menu.parentArticleIds[menu.parentArticleIds.length - 1]}`}
          >
            <Button
              className={`${s.toolBtn} keep-antd-style mb-2`}
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
          className={`${s.toolBtn} keep-antd-style mt-2`}
          icon={<PlusOutlined />}
          onClick={menu.createArticle}
          block
        >
          创建子笔记
        </Button>
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
            <Col span={12} key={item.value}>
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
        {renderCurrentMenu()}
      </div>
      <TreeMenu
        treeData={menu.articleTree?.data[0]?.children || []}
        onClickNode={(node) => navigate(`/article/${node.id}`)}
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
