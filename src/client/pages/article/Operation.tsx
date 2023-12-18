import { MobileDrawer } from '@/client/components/MobileDrawer';
import { DesktopArea, useIsMobile } from '@/client/layouts/Responsive';
import { Button, Col, Popover, Row, Space, Switch, Tooltip } from 'antd';
import React, { ChangeEventHandler, useRef, useState } from 'react';
import {
  HeartFilled,
  FormOutlined,
  SaveOutlined,
  StarFilled,
  LoadingOutlined,
  DeleteOutlined,
  LeftOutlined,
  CloudUploadOutlined,
  UnorderedListOutlined,
  QuestionCircleFilled,
} from '@ant-design/icons';
import { useFavoriteArticle } from '@/client/services/article';
import { useSearchParams } from 'react-router-dom';
import { useDelete } from './Delete';
import { ActionButton, ActionIcon } from '@/client/layouts/PageWithAction';
import { uploadFiles } from '@/client/services/file';
import { STATUS_CODE } from '@/config';
import { messageError } from '@/client/utils/message';
import { getFileUrl } from '@/client/components/FileUploaderPlugin';
import { ColorPicker } from '@/client/components/ColorPicker';
import { ArticleContent } from '@/types/article';
import Loading from '@/client/layouts/Loading';
import dayjs from 'dayjs';
import { useAtomValue } from 'jotai';
import { stateUser } from '@/client/store/user';

interface Props {
  currentArticleId: number;
  isEdit: boolean;
  title: string;
  articleDetail?: ArticleContent;
  updatingArticle: boolean;
  onClickSaveBtn: () => Promise<void>;
  onClickExitBtn: () => Promise<void>;
  onChangeColor: (color: string) => void;
  onSetListArticle: (value: boolean) => void;
  createArticle: () => Promise<void>;
}

export const useOperation = (props: Props) => {
  const { isEdit, title, articleDetail, updatingArticle, currentArticleId } = props;
  const isMobile = useIsMobile();
  const [searchParams, setSearchParams] = useSearchParams();
  /** 切换收藏状态 */
  const { mutateAsync: updateFavoriteState } = useFavoriteArticle();
  /** 根节点文章 */
  const rootArticleId = useAtomValue(stateUser)?.rootArticleId;
  /** 是否展开文章操作 */
  const [isOperationDrawerOpen, setIsOperationDrawerOpen] = useState(false);
  /** 是否收藏 */
  const [isFavorite, setIsFavorite] = useState(false);
  /** 保存按钮的文本 */
  const [saveBtnText, setSaveBtnText] = useState('');
  /** 删除功能 */
  const deleteArticle = useDelete();
  /** 是否为根节点文章 */
  const isRootArticle = currentArticleId === rootArticleId;
  /** 移动端的附件选择器 */
  const fileSelectRef = useRef<HTMLInputElement>(null);
  /** 颜色选择器是否显示 */
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);

  /** 进入编辑模式 */
  const startEdit = () => {
    searchParams.set('mode', 'edit');
    setSearchParams(searchParams, { replace: true });
  };

  /** 退出编辑模式 */
  const endEdit = async () => {
    searchParams.delete('mode');
    setSearchParams(searchParams, { replace: true });
    setSaveBtnText('');

    props.onClickExitBtn();
  };

  /** 创建子笔记 */
  // const createChildArticle = async () => {
  //   await props.createArticle();
  //   setIsOperationDrawerOpen(false);
  // };

  /** 渲染移动端非编辑时的操作弹窗 */
  const renderOperationDrawer = () => {
    return (
      <MobileDrawer
        title='文章操作'
        open={isOperationDrawerOpen}
        onClose={() => setIsOperationDrawerOpen(false)}
        height={240}
        footer={
          // <Button block size='large' type='primary' onClick={createChildArticle}>
          //   创建子笔记
          // </Button>
          null
        }>
        <div className='flex flex-nowrap flex-col h-full'>
          <div className='flex-grow overflow-y-auto mb-2'>{renderConfigContent()}</div>
          <div className='flex-shrink-0 mb-2'>
            <Row gutter={[8, 8]}>
              {!isRootArticle && (
                <Col span={8}>
                  <Button
                    size='large'
                    block
                    danger
                    onClick={() => deleteArticle.showDeleteDialog({ title, id: currentArticleId })}>
                    删除
                  </Button>
                </Col>
              )}
              <Col span={isRootArticle ? 12 : 8}>
                <Button
                  size='large'
                  block
                  onClick={() => setIsColorPickerOpen(true)}
                  className='flex items-center justify-center'>
                  {articleDetail?.color && (
                    <div
                      className='inline-block w-4 h-4 mr-2 rounded-full cursor-pointer'
                      style={{ backgroundColor: articleDetail.color }}
                    />
                  )}
                  <span>颜色</span>
                </Button>
              </Col>
              <Col span={isRootArticle ? 12 : 8}>
                <Button
                  size='large'
                  block
                  onClick={() => {
                    updateFavoriteState({ id: currentArticleId, favorite: !isFavorite });
                    setIsFavorite(!isFavorite);
                  }}>
                  {isFavorite ? (
                    <span className='text-red-500'>
                      <HeartFilled /> 已收藏
                    </span>
                  ) : (
                    '收藏'
                  )}
                </Button>
              </Col>
            </Row>
          </div>
        </div>
        {deleteArticle.renderDeleteModal()}
        {renderColorPicker()}
      </MobileDrawer>
    );
  };

  /** 选中颜色选择弹窗 */
  const onSelectedColor = (color: string) => {
    setIsColorPickerOpen(false);
    props.onChangeColor(color === '#000' ? '' : color);
  };

  /** 渲染颜色选择弹窗 */
  const renderColorPicker = () => {
    return (
      <ColorPicker
        style={{ top: isMobile ? '70vh' : '10vh' }}
        onChange={onSelectedColor}
        visible={isColorPickerOpen}
        onClose={() => setIsColorPickerOpen(false)}
      />
    );
  };

  /** 渲染文章配置弹窗内容 */
  const renderConfigContent = () => {
    if (!articleDetail) {
      return <Loading tip='加载中...' />;
    }

    return (
      <Row>
        <Col span={24}>
          <div className='mb-4 flex items-center justify-between dark:text-neutral-200'>
            <div>
              <span className='text-base mr-2'>列出子笔记</span>
              <Tooltip
                title='开启后，将会在正文内容下方以列表形式展示子笔记，目录页、索引页建议开启'
                placement='bottom'>
                <QuestionCircleFilled className='text-gray-500 cursor-pointer' />
              </Tooltip>
            </div>
            <span className='float-right'>
              <Switch
                checkedChildren='开启'
                unCheckedChildren='关闭'
                checked={articleDetail.listSubarticle}
                onClick={props.onSetListArticle}
              />
            </span>
          </div>
        </Col>
        <Col span={24}>
          <span className='text-gray-400'>创建时间</span>
          <span className='float-right dark:text-neutral-200'>
            {dayjs(articleDetail.createTime).format('YYYY:MM:DD HH:mm:ss')}
          </span>
        </Col>
        <Col span={24}>
          <span className='text-gray-400'>最后更新时间</span>
          <span className='float-right dark:text-neutral-200'>
            {dayjs(articleDetail.updateTime).format('YYYY:MM:DD HH:mm:ss')}
          </span>
        </Col>
      </Row>
    );
  };

  /** 渲染桌面端右上角的文章功能按钮 */
  const renderDesktopOperation = () => {
    const SaveIcon = updatingArticle ? LoadingOutlined : SaveOutlined;

    return (
      <DesktopArea>
        <Space className='text-xl text-gray-500 flex-shrink-0 ml-4'>
          {isEdit && <div className='text-base cursor-default'>{saveBtnText}</div>}

          <Button
            icon={<StarFilled style={{ color: articleDetail?.color }} />}
            onClick={() => setIsColorPickerOpen(true)}>
            颜色
          </Button>

          <Button
            icon={
              <HeartFilled
                className={'hover:scale-125 transition-all ' + (isFavorite ? 'text-red-500 ' : '')}
              />
            }
            onClick={() => {
              updateFavoriteState({ id: currentArticleId, favorite: !isFavorite });
              setIsFavorite(!isFavorite);
            }}>
            {isFavorite ? '取消收藏' : '收藏'}
          </Button>

          {!isRootArticle && (
            <Button
              icon={<DeleteOutlined />}
              onClick={() => deleteArticle.showDeleteDialog({ title, id: currentArticleId })}>
              删除
            </Button>
          )}

          <Popover
            placement='bottomRight'
            // trigger="click"
            content={renderConfigContent()}
            arrow
            overlayClassName='w-80'
            key='setting'>
            <Button icon={<UnorderedListOutlined />}>设置</Button>
          </Popover>

          {isEdit ? (
            <Button type='primary' onClick={endEdit} icon={<SaveIcon />}>
              保存
            </Button>
          ) : (
            <Button type='primary' onClick={startEdit} icon={<FormOutlined />}>
              编辑
            </Button>
          )}
        </Space>
        {deleteArticle.renderDeleteModal()}
        {renderColorPicker()}
      </DesktopArea>
    );
  };

  /** 移动端选中了附件 */
  const onFileSelect: ChangeEventHandler<HTMLInputElement> = async (event) => {
    event.preventDefault();

    const files = event.target.files;
    if (!files) return;

    const resp = await uploadFiles(files);
    // 解决同一个文件不能重复上传的问题
    event.target.value = '';
    if (resp.code !== STATUS_CODE.SUCCESS || !resp.data) {
      messageError(resp.msg || '上传失败');
      return;
    }

    const insertFileText = resp.data.map(getFileUrl).join('\n');

    // 通过 dom 取到 bytemd 内部的 codemirror 实例
    // 然后将上传好的文件链接插入到光标处
    const cm: CodeMirror.Editor = (document.querySelector('.CodeMirror.CodeMirror-wrap') as any)
      ?.CodeMirror;
    if (!cm) {
      messageError('获取编辑器失败，无法上传文件');
      return;
    }

    cm.replaceSelection(insertFileText);
  };

  /** 渲染移动端在编辑状态下的底部操作栏 */
  const renderMobileEditBar = () => {
    return (
      <>
        <input
          type='file'
          ref={fileSelectRef}
          style={{ display: 'none' }}
          onChange={onFileSelect}></input>
        <ActionIcon icon={<LeftOutlined />} onClick={endEdit} />
        <ActionIcon icon={<CloudUploadOutlined />} onClick={() => fileSelectRef.current?.click()} />
        <ActionButton onClick={props.onClickSaveBtn} loading={updatingArticle}>
          保存
        </ActionButton>
      </>
    );
  };

  return {
    renderOperationDrawer,
    renderDesktopOperation,
    renderMobileEditBar,
    setIsOperationDrawerOpen,
    setIsFavorite,
    setSaveBtnText,
    startEdit,
  };
};
