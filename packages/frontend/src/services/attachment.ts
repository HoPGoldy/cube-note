import { requestPost } from "./base";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useGetFileInfo = (fileId: string) => {
  return useQuery({
    queryKey: ["attachments/info", fileId],
    enabled: !!fileId,
    queryFn: () => requestPost("attachments/info", { id: fileId }),
  });
};

export const useUploadFile = () => {
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return requestPost("attachments/upload", formData);
    },
  });
};

/**
 * 主动获取文件访问链接
 * 用在下载场景
 */
export const useRequestFileUrl = () => {
  return useMutation({
    mutationFn: (fileId: string) => {
      return requestPost("attachments/request", { id: fileId });
    },
  });
};

/**
 * 响应式获取文件访问链接
 * 用在预览场景
 */
export const useGetFileUrl = (fileId: string) => {
  return useQuery({
    queryKey: ["attachments/content", fileId],
    enabled: !!fileId,
    queryFn: () => requestPost("attachments/request", { id: fileId }),
  });
};
