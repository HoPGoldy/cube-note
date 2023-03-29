import React, { FC, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageContent, PageAction, ActionButton } from '../../layouts/PageWithAction'
import { AddTagReqData, TagGroupListItem, TagListItem } from '@/types/tag'
import { useAddTag, useAddTagGroup, useQueryTagGroup, useQueryTagList, useUpdateTagGroup } from '../../services/tag'
import Loading from '../../layouts/Loading'
// import { Button } from '../../components/Button'
import dayjs from 'dayjs'
import { AddTag, Tag } from '../../components/Tag'
import { blurOnEnter } from '../../utils/input'
import { DEFAULT_TAG_GROUP } from '@/constants'
import { useDeleteGroup } from './DeleteGroup'
import { useSetGroupColor } from './SetGroupColor'
import { useTagConfig } from './TagConfig'
import { useBatchOperation } from './BatchOperation'
import { useAllTagGroup, useGroupedTag } from './tagHooks'
import { Col, Row, Button, Space, List, Card } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'

/**
 * 标签管理
 * 可以新增标签分组，设置标签颜色，移动标签到指定分组
 */
const TagManager: FC = () => {
    const navigate = useNavigate()
    // 获取标签分组
    const { data: tagGroupResp, isLoading } = useQueryTagGroup()
    // 获取标签分组
    const { tagGroups, setTagGroups } = useAllTagGroup(tagGroupResp?.data)
    // 获取标签列表
    const { data: tagListResp, isLoading: isLoadingTagList } = useQueryTagList()
    // 分组后的标签列表
    const { groupedTagDict } = useGroupedTag(tagListResp?.data)
    // 新增分组
    const { mutateAsync: addTagGroup, isLoading: isAddingGroup } = useAddTagGroup()
    // 标题输入框引用
    const titleInputRefs = useRef<Record<string, HTMLInputElement>>({})
    // 更新分组标题
    const { mutateAsync: updateGroup } = useUpdateTagGroup()
    // 新增标签
    const { mutateAsync: addTag, isLoading: isAddingTag } = useAddTag()
    // 功能 - 删除分组
    const { onClickDeleteGroup, renderDeleteModal } = useDeleteGroup()
    // 功能 - 设置分组内标签颜色
    const { renderColorPicker, onClickSetGroupColor } = useSetGroupColor({ groupedTagDict })
    // 功能 - 标签详情管理
    const { renderTagDetail, showTagDetail } = useTagConfig({ tagGroups })
    // 功能 - 批量操作
    const { isBatch, isTagSelected, onSelectTag, renderBatchBtn, renderBatchModal } = useBatchOperation({ tagGroups })

    const onAddGroup = async () => {
        const title = `新分组 ${dayjs().format('YYYY-MM-DD HH:mm:ss')}`
        const resp = await addTagGroup({ title })
        if (!resp.data) return

        const timer = setTimeout(() => {
            if (!resp.data) return
            const input = titleInputRefs.current[resp.data]
            input?.focus()
            input?.setSelectionRange(0, title.length)
        }, 200)

        return () => clearTimeout(timer)
    }

    const onTitleChange = (value: string, item: TagGroupListItem) => {
        item.title = value
        setTagGroups([...tagGroups])
    }

    const onSaveGroupTitle = async (item: TagGroupListItem) => {
        updateGroup({ ...item }) 
    }

    const onClickTag = (item: TagListItem) => {
        if (isBatch) onSelectTag(item.id)
        else showTagDetail(item)
    }

    const onClickAddBtn = async (title: string, groupId: number) => {
        if (!title) return

        const data: AddTagReqData = { title, color: '#404040' }
        if (groupId !== DEFAULT_TAG_GROUP) data.groupId = groupId

        const resp = await addTag(data)
        if (!resp?.data) return
    }

    const renderTagItem = (item: TagListItem) => {
        return (
            <Tag
                key={item.id}
                color={item.color}
                selected={isBatch ? isTagSelected(item.id) : undefined}
                onClick={() => onClickTag(item)}
            >{item.title}</Tag>
        )
    }

    const renderTagGroupItem = (item: TagGroupListItem) => {
        const tags = groupedTagDict[item.id] || []
        return (
            <List.Item>
                <Card
                    title={(
                        <input
                            ref={ins => ins && (titleInputRefs.current[item.id] = ins)}
                            style={{ width: '100%' }}
                            value={item.title}
                            onChange={e => onTitleChange(e.target.value, item)}
                            onKeyUp={blurOnEnter}
                            onBlur={() => onSaveGroupTitle(item)}
                            disabled={item.id === DEFAULT_TAG_GROUP}
                        />
                    )}
                    size="small"
                    extra={(
                        <Space style={{ margin: '0.8rem 0rem' }}>
                            {!isBatch && <Button
                                onClick={() => onClickSetGroupColor(item)}
                            >调整颜色</Button>}

                            {!isBatch && item.id !== -1 && <Button
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => onClickDeleteGroup(item)}
                            ></Button>}
                        </Space>
                    )}
                >
                    <Space size={[0, 8]} wrap>
                        {tags.map(renderTagItem)}
                        {!isBatch && <AddTag
                            onFinish={title => onClickAddBtn(title, item.id)}
                            loading={isAddingTag}
                        />}
                    </Space>
                </Card>
            </List.Item>
        )
    }

    const renderContent = () => {
        if (isLoading || isLoadingTagList) return <Loading />

        return (<>
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <Space>
                        <Button onClick={onAddGroup} loading={isAddingGroup} icon={<PlusOutlined />}>新增分组</Button>
                        {renderBatchBtn()}
                    </Space>
                </Col>
                <Col span={24}>
                    <List
                        grid={{ gutter: 16, column: 3 }}
                        dataSource={tagGroups}
                        renderItem={renderTagGroupItem}
                    />
                </Col>
            </Row>

            
        </>)
    }

    return (<>
        <PageContent>
            {renderContent()}
        </PageContent>
        <PageAction>
            <ActionButton onClick={() => navigate(-1)}>返回</ActionButton>
        </PageAction>

        {renderDeleteModal()}
        {renderColorPicker()}
        {renderBatchModal()}
        {renderTagDetail()}
    </>)
}

export default TagManager