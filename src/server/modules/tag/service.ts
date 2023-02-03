import { TagStorage, TagUpdateReqData } from '@/types/tag'
import { DatabaseAccessor } from '@/server/lib/mongodb'
import { ObjectId } from 'mongodb'
import isNil from 'lodash/isNil'

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

    return { addTag, updateTag, removeTag, getTagList, getGroupList }
}

export type TagService = ReturnType<typeof createService>