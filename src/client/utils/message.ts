import { Notify, NotifyType } from 'react-vant'

export const message = (type: NotifyType, message: string) => {
    return Notify.show({ type, message })
}

export const messageSuccess = (message: string) => {
    return Notify.show({ type: 'success', message })
}

export const messageError = (message: string) => {
    return Notify.show({ type: 'danger', message })
}

export const messageWarning = (message: string) => {
    return Notify.show({ type: 'warning', message })
}

export const messageInfo = (message: string) => {
    return Notify.show({ type: 'primary', message })
}