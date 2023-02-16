import { axiosInstance } from './base'

export const fetchFile = async (id: string) => {
    return await axiosInstance.get(`file/${id}`, {
        responseType: 'blob'
    })
}