import { message as antdMessage } from 'antd'
import { NoticeType } from 'antd/es/message/interface'


export const message = (type: NoticeType, content: string) => {
    return antdMessage.open({ type, content })
}

export const messageSuccess = (message: string) => {
    return antdMessage.success(message)
}

export const messageError = (message: string) => {
    return antdMessage.error(message)
}

export const messageWarning = (message: string) => {
    return antdMessage.warning(message)
}

export const messageInfo = (message: string) => {
    return antdMessage.info(message)
}