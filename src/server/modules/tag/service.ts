import { AppResponse } from '@/types/global'
import { WithId } from 'mongodb'
import { TagStorage } from '@/types/tag'
import { DatabaseAccessor } from '@/server/lib/mongodb'

interface Props {
    db: DatabaseAccessor
}

export const createService = (props: Props) => {
    const { getTagCollection } = props.db

    const addTag = async (title: string): Promise<AppResponse> => {
        const tagCollection = getTagCollection()
        const existTag = await tagCollection.findOne({ title })
        if (existTag) return { code: 400, msg: '标签已存在' }

        const tag: TagStorage = {
            title,
            createTime: Date.now(),
        }
        const newTag = await tagCollection.insertOne(tag)
        return { code: 200, msg: '添加成功', data: newTag }
    }

    const removeTag = async (title: string): Promise<AppResponse> => {
        const tagCollection = getTagCollection()
        await tagCollection.deleteOne({ title })
        return { code: 200, msg: '删除成功' }
    }

    const getTagList = async (): Promise<AppResponse<WithId<TagStorage>[]>> => {
        const tagCollection = getTagCollection()
        const tagList = await tagCollection.find().toArray()
        return { code: 200, data: tagList }
    }

    return { addTag, removeTag, getTagList }
}

export type TagService = ReturnType<typeof createService>