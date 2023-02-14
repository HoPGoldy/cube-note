import { useUploadMutation } from '@/client/services/file'
import { STATUS_CODE } from '@/config'

/**
 * 文件上传 hook
 */
export const useUpload = function () {
    const [uploadFile] = useUploadMutation()

    const upload = async (files: File[]) => {
        const formData = new FormData()
        files.forEach(file => formData.append('file', file))
        const resp = await uploadFile(formData).unwrap()
        if (resp.code !== STATUS_CODE.SUCCESS) return

        return resp.data
    }

    return { upload }
}