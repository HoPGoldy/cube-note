import { queryClient, requestPost } from "./base";
import { useMutation, useQuery } from "@tanstack/react-query";

export interface AppConfig {
  WEB_AUTHN_RP_NAME?: string;
  WEB_AUTHN_RP_ID?: string;
  WEB_AUTHN_ORIGIN?: string;
  REGISTRATION_MODE_ENABLED?: "true" | "false";
}

export const useGetAppConfig = () => {
  const result = useQuery({
    queryKey: ["app-config/all"],
    queryFn: () => requestPost<AppConfig>("config"),
  });

  return { ...result, appConfig: result.data?.data || {} };
};

export const useUpdateAppConfig = () => {
  return useMutation({
    mutationFn: (data: AppConfig) => requestPost("config/update", data),
    onSuccess: () => {
      // 作废所有缓存重新查询
      queryClient.invalidateQueries();
    },
  });
};
