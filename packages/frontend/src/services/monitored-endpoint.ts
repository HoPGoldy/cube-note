import { CommonListQueryDto } from "@/types/global";
import { queryClient, requestPost } from "./base";
import { useMutation, useQuery } from "@tanstack/react-query";

export interface EndpointListQueryDto extends CommonListQueryDto {
  hostId?: string;
}

export const useGetEndpointList = (query?: EndpointListQueryDto) => {
  return useQuery({
    queryKey: ["endpoint/list", query],
    queryFn: () => requestPost("endpoint/list", query || {}),
  });
};

export const useGetEndpointDetail = (id: string) => {
  return useQuery({
    queryKey: ["endpoint/detail", id],
    enabled: !!id,
    queryFn: () => requestPost("endpoint/get", { id }),
  });
};

export interface EndpointCreateDto {
  hostId: string;
  name: string;
  url?: string;
  method?: string;
  headers?: any;
  intervalTime?: number;
  enabled?: boolean;
  timeout?: number;
  bodyContentType?: "json" | "x-www-form-urlencoded" | "xml";
  bodyContent?: string;
}

export const useCreateEndpoint = () => {
  return useMutation({
    mutationFn: (data: EndpointCreateDto) =>
      requestPost("endpoint/create", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["endpoint/list"] });
    },
  });
};

export interface EndpointUpdateDto extends Partial<EndpointCreateDto> {
  id: string;
}

export const useUpdateEndpoint = () => {
  return useMutation({
    mutationFn: (data: EndpointUpdateDto) =>
      requestPost("endpoint/update", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["endpoint/list"] });
      queryClient.invalidateQueries({ queryKey: ["endpoint/detail"] });
    },
  });
};

export const useDeleteEndpoint = () => {
  return useMutation({
    mutationFn: (id: string) => requestPost("endpoint/delete", { id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["endpoint/list"] });
    },
  });
};

export const useCopyEndpoint = () => {
  return useMutation({
    mutationFn: (id: string) => requestPost("endpoint/copy", { id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["endpoint/list"] });
    },
  });
};
