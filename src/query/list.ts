import { useQuery } from "@tanstack/react-query";
import { ArticleReq, getList } from "../api";

export const useListQuery = (params: ArticleReq) => {
  return useQuery(["list", params], () => getList(params), {
    suspense: true,
  });
};
