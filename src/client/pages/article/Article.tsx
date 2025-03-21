import React, { FC, useState, useEffect, useRef } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ActionButton, PageContent, PageAction, ActionIcon } from '../../layouts/PageWithAction';
import {
  useQueryArticleContent,
  useQueryArticleSublink,
  useUpdateArticle,
} from '../../services/article';
import Loading from '../../layouts/Loading';
import Preview from './Preview';
import { useEditor } from './Editor';
import { messageWarning } from '@/client/utils/message';
import { STATUS_CODE } from '@/config';
import { stateCurrentArticleId } from '@/client/store/menu';
import { ArticleSubLinkDetail, UpdateArticleReqData } from '@/types/article';
import TagArea from './TagArea';
import { blurOnEnter } from '@/client/utils/input';
import dayjs from 'dayjs';
import { SettingOutlined, SearchOutlined, MenuOutlined } from '@ant-design/icons';
import s from './styles.module.css';
import { useOperation } from './Operation';
import { useMobileMenu } from './Menu';
import { Button, Card, Drawer } from 'antd';
import { PageTitle } from '@/client/components/PageTitle';
import { MobileSetting } from '../userSetting';
import { useSetAtom } from 'jotai';
import { MobileArea } from '@/client/layouts/Responsive';

const About: FC = () => {
  const params = useParams();
  const setCurrentArticleId = useSetAtom(stateCurrentArticleId);
  const [searchParams, setSearchParams] = useSearchParams();
  /** 页面是否在编辑中 */
  const isEdit = searchParams.get('mode') === 'edit';
  /** 是否展示设置 */
  const [showSetting, setShowSetting] = useState(false);
  /** 当前文章 id */
  const currentArticleId = +(params.articleId as string);
  /** 获取详情 */
  const { data: articleResp, isFetching: isLoadingArticle } =
    useQueryArticleContent(currentArticleId);
  // 获取当前文章的子级、父级文章
  const { data: articleLink, isLoading: linkLoading } = useQueryArticleSublink(
    currentArticleId,
    !!articleResp?.data?.listSubarticle,
  );
  /** 保存详情 */
  const { mutateAsync: updateArticle, isLoading: updatingArticle } = useUpdateArticle();
  /** 标题是否被修改 */
  const isTitleModified = useRef(false);
  /** 标题输入框 */
  const titleInputRef = useRef<HTMLInputElement>(null);
  /** 正在编辑的标题内容 */
  const [title, setTitle] = useState('');
  /** 功能 - 导航抽屉 */
  const menu = useMobileMenu({
    currentArticleId,
  });
  /** 新增子笔记按钮长按计时器 */
  const addSubArticleTimer = useRef<NodeJS.Timeout>();

  /** 点击保存按钮必定会触发保存，无论内容是否被修改 */
  const onClickSaveBtn = async () => {
    await saveEdit({ title, content });
  };

  /** 只有在内容变化时，点击退出按钮才会自动保存 */
  const onClickExitBtn = async () => {
    if (isContentModified.current) onClickSaveBtn();
    isContentModified.current = false;
  };

  /** 文章相关的操作 */
  const operation = useOperation({
    currentArticleId,
    articleDetail: articleResp?.data,
    isEdit,
    title,
    updatingArticle,
    onChangeColor: (color) => saveEdit({ color }),
    onSetListArticle: (v) => saveEdit({ listSubarticle: v }),
    onClickSaveBtn,
    onClickExitBtn,
    createArticle: menu.menu.createArticle,
  });

  /** 功能 - 编辑器 */
  const { renderEditor, setEditorContent, content, isContentModified } = useEditor({
    onAutoSave: () => operation.setSaveBtnText(`自动保存于 ${dayjs().format('HH:mm')}`),
    articleId: currentArticleId,
  });

  useEffect(() => {
    setCurrentArticleId(currentArticleId);
  }, [currentArticleId]);

  // 新增笔记时，自动聚焦标题输入框
  useEffect(() => {
    if (searchParams.get('focus') !== 'title') return;
    setTimeout(() => {
      titleInputRef.current?.select();
      searchParams.delete('focus');
      setSearchParams(searchParams, { replace: true });
    }, 100);
  }, [searchParams.get('focus')]);

  useEffect(() => {
    if (!articleResp?.data) return;

    setTitle(articleResp.data.title);
    setEditorContent(articleResp.data.content);
    operation.setIsFavorite(articleResp.data.favorite);
  }, [articleResp]);

  const saveEdit = async (data: Partial<UpdateArticleReqData>) => {
    if (data.title === '') {
      messageWarning('标题不能为空');
      return;
    }

    const resp = await updateArticle({ ...data, id: currentArticleId });
    if (resp.code !== STATUS_CODE.SUCCESS) return;

    operation.setSaveBtnText('');
  };

  /** 渲染底部的子笔记项目 */
  const renderSubArticleItem = (item: ArticleSubLinkDetail) => {
    return (
      <Link to={`/article/${item.id}`} key={item.id}>
        <Card
          size='small'
          className='hover:ring-2 ring-gray-300 dark:ring-neutral-500 transition-all cursor-pointer'>
          <div className='flex justify-between items-center'>
            <span className='font-bold'>{item.title}</span>
            {item.color && (
              <div
                className='flex-shrink-0 w-3 h-3 bg-gray-300 rounded'
                style={{ backgroundColor: item.color }}
              />
            )}
          </div>
        </Card>
      </Link>
    );
  };

  /** 渲染底部的子笔记列表 */
  const renderSubArticleList = () => {
    if (!articleResp?.data?.listSubarticle || isEdit) return null;
    if (linkLoading) return <Loading className='mt-10' tip='信息加载中...' />;
    if (!articleLink?.data?.length) return null;

    return (
      <>
        <div className='w-full xl:w-[60%] mx-auto bg-neutral-100 dark:bg-neutral-800 p-3 rounded-lg box-border mb-2'>
          <div className='mb-2'>子笔记列表：</div>
          <div className='grid gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
            {articleLink?.data.map(renderSubArticleItem)}
          </div>
        </div>
        {/* 留出一些底部空间 */}
        <div className='w-full flex-shrink-0 h-10'></div>
      </>
    );
  };

  const renderContent = () => {
    if (isLoadingArticle) return <Loading tip='信息加载中...' />;

    return (
      <div className='box-border p-4 md:w-full h-full flex flex-col flex-nowrap'>
        <div className='flex justify-between items-center md:items-start'>
          <input
            ref={titleInputRef}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              isTitleModified.current = true;
            }}
            onKeyUp={blurOnEnter}
            onBlur={() => {
              if (isTitleModified.current) saveEdit({ title });
              isTitleModified.current = false;
            }}
            placeholder='请输入笔记名'
            className='font-bold border-0 text-3xl my-2 w-full dark:text-white'
          />
          {operation.renderDesktopOperation()}
          <MobileArea>
            <Button
              size='large'
              className='flex-shrink-0'
              icon={<SettingOutlined />}
              onClick={() => operation.setIsOperationDrawerOpen(true)}></Button>
          </MobileArea>
        </div>

        <TagArea
          articleId={currentArticleId}
          value={articleResp?.data?.tagIds || []}
          disabled={!isEdit}
        />

        {isEdit ? (
          <div className={[s.editorArea, s.mdArea].join(' ')}>{renderEditor()}</div>
        ) : (
          <div className={`md:w-[100%] ${s.mdArea}`}>
            <Preview value={content} />
          </div>
        )}

        {renderSubArticleList()}
      </div>
    );
  };

  const onLongClick = () => {
    console.log(1);
    addSubArticleTimer.current = setTimeout(() => {
      // messageSuccess('新增子笔记');
      navigator.vibrate?.(30);
      menu.menu.createArticle();
    }, 1000);
  };

  const onLongClickEnd = () => {
    clearTimeout(addSubArticleTimer.current);
  };

  const renderActionBar = () => {
    if (isEdit) return operation.renderMobileEditBar();

    return (
      <>
        {menu.renderMenuDrawer()}
        {operation.renderOperationDrawer()}

        <ActionIcon icon={<SettingOutlined />} onClick={() => setShowSetting(true)} />
        <Drawer
          open={showSetting}
          onClose={() => setShowSetting(false)}
          closable={false}
          placement='left'
          className={s.settingDrawer}
          width='100%'>
          <MobileSetting onBack={() => setShowSetting(false)} />
        </Drawer>
        <Link to='/search'>
          <ActionIcon icon={<SearchOutlined />} />
        </Link>
        <ActionIcon icon={<MenuOutlined />} onClick={() => menu.setIsMenuDrawerOpen(true)} />
        <ActionButton
          onClick={operation.startEdit}
          onTouchStart={onLongClick}
          onTouchEnd={onLongClickEnd}>
          编辑
          <span className='ml-2 text-xs'>长按添加子笔记</span>
        </ActionButton>
      </>
    );
  };

  return (
    <>
      <PageTitle title={title || '笔记'} />
      <PageContent>{renderContent()}</PageContent>

      <PageAction>{renderActionBar()}</PageAction>
    </>
  );
};

export default About;
