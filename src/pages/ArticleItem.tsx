import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getView } from "../api";
import { useState } from "react";
import dayjs from "dayjs";
import MyModal from "../Modal";
import { DeletePasswordForm } from "./View";

export function ArticleItem({ id }: { id: number }) {
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const { data } = useQuery(["view", id], () => getView({ id }), {
    suspense: true,
  });
  const article = data!;

  return (
    <div className="p-3">
      <div className="flex flex-col">
        <h2 className="text-xl">{article.title}</h2>
        <div className="flex items-center">
          <div>{article.nickname}</div>
          <div className="w-[1px] h-[12px] bg-gray-400 mx-1" />
          <div>{dayjs(article.updateDate).format("YYYY.MM.DD. HH:mm:ss")}</div>
        </div>
      </div>
      <hr />
      <div className="whitespace-pre py-3">{article.content}</div>
      <div className="space-x-1 flex justify-between items-center">
        <div>
          <button
            onClick={() => {
              setDeleteConfirm(true);
            }}
            className="px-1 text-gray-500 text-sm underline inline-block rounded-xl"
          >
            삭제하기
          </button>
          <Link
            to={{ pathname: "/write", search: `?mode=modify&id=${id}` }}
            className="px-1 text-gray-500 text-sm underline inline-block rounded-xl"
          >
            수정하기
          </Link>
        </div>
        <Link
          to="/"
          className="p-3 underline inline-block bg-slate-100 hover:bg-slate-200 rounded-xl"
        >
          목록으로
        </Link>
      </div>
      <MyModal
        isOpen={deleteConfirm}
        handleClose={() => setDeleteConfirm(false)}
      >
        <DeletePasswordForm handleClose={() => setDeleteConfirm(false)} />
      </MyModal>
    </div>
  );
}
