import {
  useAddArticle,
  useQueryArticleFavorite,
  useQueryArticleLink,
  useQueryArticleTree,
} from "@/services/article";
import {
  stateCurrentArticleId,
  stateCurrentTab,
  stateParentArticleIds,
  stateParentArticleTitle,
} from "@/store/menu";
import { TabTypes } from "@/types/article";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UnorderedListOutlined, HeartOutlined } from "@ant-design/icons";
import { useAtom, useAtomValue } from "jotai";
import { useGetAppConfig } from "@/services/app-config";

export const tabOptions = [
  {
    label: "下属",
    sidebarLabel: "下属笔记",
    value: TabTypes.Sub,
    icon: <UnorderedListOutlined />,
  },
  {
    label: "收藏",
    sidebarLabel: "我的收藏",
    value: TabTypes.Favorite,
    icon: <HeartOutlined />,
  },
];

/** 空列表占位符样式 */
export const EMPTY_CLASSNAME = "text-gray-500 py-4 cursor-default text-center";

export const useMenu = () => {
  const navigate = useNavigate();
  const currentTab = useAtomValue(stateCurrentTab);
  const { appConfig } = useGetAppConfig();
  const currentRootArticleId = appConfig.ROOT_ARTICLE_ID;
  const storeArticleId = useAtomValue(stateCurrentArticleId);

  const currentArticleId = storeArticleId || currentRootArticleId;

  const [parentArticleIds, setParentArticleIds] = useAtom(
    stateParentArticleIds,
  );
  const [parentArticleTitle, setParentArticleTitle] = useAtom(
    stateParentArticleTitle,
  );

  // 获取左下角菜单树
  const { data: articleTree } = useQueryArticleTree(currentRootArticleId);
  // 获取当前文章的子级、父级文章
  const { data: articleLink, isLoading: linkLoading } = useQueryArticleLink(
    currentArticleId,
    !!(currentArticleId && currentTab === TabTypes.Sub),
  );
  // 获取收藏文章
  const { data: articleFavorite, isLoading: favoriteLoading } =
    useQueryArticleFavorite(currentTab === TabTypes.Favorite);
  console.log("🚀 ~ useMenu ~ articleFavorite:", articleFavorite);
  // 新增文章
  const { mutateAsync: addArticle } = useAddArticle();

  const createArticle = async () => {
    if (!currentArticleId) {
      console.error("当前文章不存在，无法创建子文章");
      return;
    }

    const title = "新笔记";
    const resp = await addArticle({
      title,
      content: "",
      parentId: currentArticleId,
    });
    if (!resp.success) return;

    navigate(`/article/${resp.data?.id}?mode=edit&focus=title`);
  };

  // 选择了新的文章，把该文章的父级信息更新到 store
  useEffect(() => {
    if (!articleLink || !articleLink.data) return;
    setParentArticleIds(articleLink.data.parentArticleIds);
    setParentArticleTitle(articleLink.data.parentArticleTitle || "");
  }, [articleLink]);

  return {
    currentTab,
    currentRootArticleId,
    parentArticleIds,
    parentArticleTitle,
    articleTree,
    articleLink,
    linkLoading,
    articleFavorite,
    favoriteLoading,
    createArticle,
  };
};
