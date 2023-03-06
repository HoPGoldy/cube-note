import { TagGroupStorage, TagStorage, TagUpdateReqData } from '@/types/tag'
import { DatabaseAccessor } from '@/server/lib/sqlite'
import { sqlDelete, sqlInsert, sqlSelect, sqlUpdate } from '@/utils/sqlite'

interface Props {
    db: DatabaseAccessor
}

export const createService = (props: Props) => {
    const { dbRun, dbGet, dbAll } = props.db

    const addTag = async (newTag: TagStorage) => {
        const existTag = await dbGet(sqlSelect('tags', { title: newTag.title, createUserId: newTag.createUserId }))
        if (existTag) return { code: 400, msg: '标签已存在' }

        await dbRun(sqlInsert('tags', newTag))
        return { code: 200, msg: '添加成功', data: newTag.id }
    }

    const removeTag = async (id: string, userId: number) => {
        await dbRun(sqlDelete<TagStorage>('tags', { id, createUserId: userId }))
        return { code: 200 }
    }

    const updateTag = async (detail: TagUpdateReqData) => {
        const { id, ...rest } = detail

        await dbRun(sqlUpdate('tags', { ...rest }, { id }))
        return { code: 200 }
    }

    const getTagList = async (userId: number) => {
        const data = await dbAll(sqlSelect('tags', { createUserId: userId }))
        return { code: 200, data }
    }

    const getGroupList = async (userId: number) => {
        const data = await dbAll(sqlSelect('tagGroups', { createUserId: userId }))
        return { code: 200, data }
    }

    const addGroup = async (data: TagGroupStorage) => {
        const existTag = await dbGet(sqlSelect('tagGroups', { title: data.title, createUserId: data.createUserId }))
        if (existTag) return { code: 400, msg: '分组已存在' }

        await dbRun(sqlInsert('tagGroups', data))
        return { code: 200, msg: '添加成功', data: data.id }
    }

    /**
     * 删除分组
     * mehtod 为 force 时，删除分组下的所有标签，否则会移动到未命名分组
     */
    const removeGroup = async (id: string, method: string, userId: number) => {
        await dbRun(sqlDelete('tagGroups', { id, createUserId: userId }))

        // 删掉下属标签
        if (method === 'force') {
            await dbRun(sqlDelete('tags', { groupId: id, createUserId: userId }))
        }
        // 把该分组下的标签移动到未分组
        else {
            await dbRun(sqlUpdate('tags', { groupId: '' }, { groupId: id, createUserId: userId }))
        }

        return { code: 200 }
    }

    const updateGroup = async (detail: TagGroupStorage) => {
        const { id, title, createUserId } = detail
        await dbRun(sqlUpdate('tagGroups', { title }, { id, createUserId }))

        return { code: 200 }
    }

    const batchSetColor = async (ids: string[], color: string, userId: number) => {
        const tagIds = ids.map(id => `'${id}'`).join(',')
        await dbRun(sqlUpdate('tags', { color }, `id IN (${tagIds}) AND createUserId=${userId}`))

        return { code: 200 }
    }

    const batchSetGroup = async (ids: string[], groupId: string, userId: number) => {
        const tagIds = ids.map(id => `'${id}'`).join(',')
        await dbRun(sqlUpdate('tags', { groupId }, `id IN (${tagIds}) AND createUserId=${userId}`))

        return { code: 200 }
    }

    const batchRemoveTag = async (ids: string[], userId: number) => {
        const tagIds = ids.map(id => `'${id}'`).join(',')
        await dbRun(sqlDelete('tags', `id IN (${tagIds}) AND createUserId=${userId}`))

        return { code: 200 }
    }

    return {
        addTag, updateTag, removeTag, getTagList, getGroupList, addGroup, removeGroup, updateGroup,
        batchSetColor, batchSetGroup, batchRemoveTag
    }
}

export type TagService = ReturnType<typeof createService>