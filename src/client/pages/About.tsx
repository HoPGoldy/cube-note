import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContent, PageAction, ActionButton } from '../layouts/PageWithAction';
import { Card } from 'antd';
import { GithubOutlined, SendOutlined } from '@ant-design/icons';
import { Cell } from '../components/Cell';
import { PageTitle } from '../components/PageTitle';

const About: FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <PageTitle title='关于应用' />
      <PageContent>
        <div className='p-4 text-base md:w-1/2 mx-auto'>
          <Card size='small' className='text-center text-base font-bold'>
            关 于
          </Card>
          <Card size='small' className='mt-4 text-base'>
            又快又好用的简单记事本 APP。
            <br />
            <br />
            包含支持文件上传的 Markdown
            编辑器、双端响应式布局、数据自托管、支持搜索、标签、笔记嵌套等功能。
          </Card>
          <Card size='small' className='mt-4'>
            <a href='mailto:hopgoldy@gmail.com?&subject=cube-dnote 相关'>
              <Cell
                title={
                  <div className='dark:text-neutral-300'>
                    <SendOutlined /> &nbsp;联系我
                  </div>
                }
                extra={
                  <div className='text-gray-500 dark:text-neutral-200'>hopgoldy@gmail.com</div>
                }
              />
            </a>
          </Card>
          <Card size='small' className='mt-4'>
            <a href='https://github.com/HoPGoldy/cube-note' target='_blank' rel='noreferrer'>
              <Cell
                title={
                  <div className='dark:text-neutral-300'>
                    <GithubOutlined /> &nbsp;开源地址
                  </div>
                }
                extra={<div className='text-gray-500 dark:text-neutral-200'>github</div>}
              />
            </a>
          </Card>
        </div>

        <div className='text-center absolute w-full bottom-0 text-mainColor mb-0 md:mb-4 dark:text-gray-200'>
          Powered by 💗 Yuzizi
        </div>
      </PageContent>
      <PageAction>
        <ActionButton onClick={() => navigate(-1)}>返回</ActionButton>
      </PageAction>
    </>
  );
};

export default About;
