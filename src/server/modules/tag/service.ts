import { SetTagGroupReqData, TagGroupStorage, TagStorage, TagUpdateReqData } from '@/types/tag'
import { DatabaseAccessor } from '@/server/lib/mongodb'
import { ObjectId } from 'mongodb'
import isNil from 'lodash/isNil'
import { DEFAULT_TAG_GROUP } from '@/constants'

interface Props {
    db: DatabaseAccessor
}

export const createService = (props: Props) => {
    const { getTagCollection, getTagGroupCollection } = props.db

    const addTag = async (data: TagStorage) => {
        const tagCollection = getTagCollection()
        const existTag = await tagCollection.findOne({ title: data.title })
        if (existTag) return { code: 400, msg: '标签已存在' }

        const newTag = await tagCollection.insertOne(data)
        return { code: 200, msg: '添加成功', data: newTag.insertedId.toString() }
    }

    const removeTag = async (id: string) => {
        const tagCollection = getTagCollection()
        await tagCollection.deleteOne({ _id: new ObjectId(id) })
        return { code: 200 }
    }

    const updateTag = async (detail: TagUpdateReqData) => {
        const collection = getTagCollection()
        const _id = new ObjectId(detail.id)
        const oldTag = await collection.findOne({ _id })
        if (!oldTag) {
            return { code: 400, msg: '标签不存在' }
        }


        await collection.updateOne({ _id }, { $set: {
            title: detail.title || oldTag.title,
            color: detail.color || oldTag.color,
            groupId: isNil(detail.groupId) ? oldTag.groupId : detail.groupId,
        } })

        return { code: 200 }
    }

    const getTagList = async () => {
        const tagCollection = getTagCollection()
        const tagList = await tagCollection.find().toArray()

        return { code: 200, data: tagList }
    }

    const getGroupList = async () => {
        const collection = getTagGroupCollection()
        const groupList = await collection.find().toArray()

        return { code: 200, data: groupList }
    }

    const addGroup = async (data: TagGroupStorage) => {
        const collection = getTagGroupCollection()
        const existGroup = await collection.findOne({ title: data.title })
        if (existGroup) return { code: 400, msg: '分组已存在' }

        const newGroup = await collection.insertOne(data)
        return { code: 200, msg: '添加成功', data: newGroup.insertedId.toString() }
    }

    /**
     * 删除分组
     * mehtod 为 force 时，删除分组下的所有标签，否则会移动到未命名分组
     */
    const removeGroup = async (id: string, method: string) => {
        const collection = getTagGroupCollection()
        await collection.deleteOne({ _id: new ObjectId(id) })

        const tagCollection = getTagCollection()
        // 删掉下属标签
        if (method === 'force') {
            await tagCollection.deleteMany({ groupId: id })
        }
        // 把该分组下的标签移动到未分组
        else {
            await tagCollection.updateMany({ groupId: id }, { $set: { groupId: '' } })
        }

        return { code: 200 }
    }

    const updateGroup = async (detail: TagUpdateReqData) => {
        const collection = getTagGroupCollection()
        const _id = new ObjectId(detail.id)

        await collection.updateOne({ _id }, { $set: {
            title: detail.title
        } })

        return { code: 200 }
    }

    const batchSetColor = async (ids: string[], color: string) => {
        const collection = getTagCollection()
        await collection.updateMany({
            _id: {
                $in: ids.map(id => new ObjectId(id))
            }
        }, {
            $set: { color }
        })

        return { code: 200 }
    }

    const batchSetGroup = async ({ ids, groupId }: SetTagGroupReqData) => {
        const collection = getTagCollection()
        await collection.updateMany({
            _id: { $in: ids.map(id => new ObjectId(id)) }
        }, {
            $set: { groupId: groupId === DEFAULT_TAG_GROUP ? '' : groupId }
        })

        return { code: 200 }
    }

    const batchRemoveTag = async (ids: string[]) => {
        const collection = getTagCollection()
        await collection.deleteMany({
            _id: {
                $in: ids.map(id => new ObjectId(id))
            }
        })

        return { code: 200 }
    }

    return {
        addTag, updateTag, removeTag, getTagList, getGroupList, addGroup, removeGroup, updateGroup,
        batchSetColor, batchSetGroup, batchRemoveTag
    }
}

export type TagService = ReturnType<typeof createService>