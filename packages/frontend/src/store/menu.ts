import { TabTypes } from "@/types/article";
import { atom } from "jotai";

/**
 * 当前选中的哪个标签
 */
export const stateCurrentTab = atom<TabTypes>(TabTypes.Sub);

/**
 * 当前显示的哪个文章
 */
export const stateCurrentArticleId = atom(undefined as string | undefined);

/**
 * 从根文章到当前文章的祖先文章 id 路径
 * 父文章 id 在最后一个
 */
export const stateParentArticleIds = atom(undefined as string[] | undefined);

/**
 * 父文章标题
 */
export const stateParentArticleTitle = atom<string>("");

/**
 * 当前选中的相关文章 id
 */
export const stateSelectedRelatedArticleIds = atom<string[]>([]);
