import { DetailPageType } from "@/utils/use-detail-type";
import { useSearchParams } from "react-router-dom";

export const DETAIL_TYPE_KEY = "nc-modal";

export const DETAIL_ID_KEY = "nc-id";

export const useNotificationChannelDetailAction = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const onAdd = () => {
    searchParams.set(DETAIL_TYPE_KEY, DetailPageType.Add);
    setSearchParams(searchParams, { replace: true });
  };

  const onEdit = (id: string) => {
    searchParams.set(DETAIL_TYPE_KEY, DetailPageType.Edit);
    searchParams.set(DETAIL_ID_KEY, id);
    setSearchParams(searchParams, { replace: true });
  };

  return {
    onAdd,
    onEdit,
  };
};
