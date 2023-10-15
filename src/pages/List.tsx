import { ArticleListItem } from "../api";
import { Suspense } from "react";
import dayjs from "dayjs";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useListQuery } from "../query/list";
import classNames from "classnames";

const useListCntPage = () => {
  // 10개 20개 30개
  const { search } = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(search);
  const listCnt = Number(searchParams.get("listCnt")) || 10;
  const page = Number(searchParams.get("page")) || 1;
  const setListCnt = (listCnt: number) => {
    searchParams.set("listCnt", String(listCnt));
    navigate({ search: "?" + searchParams.toString() });
  };
  const getPageHref = (page: number) => {
    const copied = new URLSearchParams("?" + searchParams.toString());
    copied.set("page", String(page));
    return "?" + copied.toString();
  };
  return {
    listCnt: listCnt > 30 ? 30 : listCnt,
    setListCnt,
    page,
    getPageHref,
  };
};

const Items = () => {
  const { listCnt, page } = useListCntPage();
  const { data } = useListQuery({ listCnt, page });

  const totalBoardCount = data?.totalBoardCount ?? 0;
  const items = data?.boardInfo as ArticleListItem[];

  return (
    <>
      <div>총 {totalBoardCount.toLocaleString("ko-KR")}개의 게시글</div>
      <table className="w-full">
        {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
        {/* @ts-ignore */}
        <thead className="" align="center">
          <tr>
            <th>아이디</th>
            <th>제목</th>
            <th>작성자</th>
            <th>최근 업데이트</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border [&>td]:p-3">
              <td>{item.id}</td>
              <td className="min-w-[600px]">
                <Link
                  to={`/view/${item.id}`}
                  className="no-underline hover:text-blue-400 flex items-center w-full"
                >
                  <span className="underline">{item.title}</span>
                  <span className="text-orange-400 text-sm">
                    &nbsp;[{item.replyCount.toLocaleString("ko-KR")}]
                  </span>
                </Link>
              </td>
              <td>{item.nickname}</td>
              <td className="text-right">
                {dayjs(item.updateDate).format("YYYY-MM-DD HH:mm:ss")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default function List() {
  const { listCnt, setListCnt, page, getPageHref } = useListCntPage();
  const { data } = useListQuery({ listCnt, page });
  const totalBoardCount = data?.totalBoardCount ?? 0;
  const totalPages = Math.ceil(totalBoardCount / listCnt);

  return (
    <div>
      <h1 className="text-4xl p-3">게시판</h1>
      <select
        value={String(listCnt)}
        onChange={(e) => {
          setListCnt(+e.target.value);
        }}
      >
        <option value="10">10개 보기</option>
        <option value="20">20개 보기</option>
        <option value="30">30개 보기</option>
      </select>
      <Suspense fallback={<div>로딩중</div>}>
        <Items />
      </Suspense>
      <div className="flex mr-2 justify-end">
        <Link
          to="/write"
          className="p-3 underline inline-block bg-slate-100 hover:bg-slate-200 rounded-xl mt-4"
        >
          글쓰기
        </Link>
      </div>
      <div className="mt-4 flex items-center space-x-3 justify-center">
        {1 !== page && (
          <Link
            to={`${getPageHref(Math.max(1, page - 1))}`}
            className="p-3 underline inline-block bg-slate-100 hover:bg-slate-200 rounded-xl"
          >
            〈 이전
          </Link>
        )}
        {/* <div>{page}</div> */}
        {Array.from({ length: totalPages }).map((_, i) => (
          <Link
            key={i}
            to={`${getPageHref(i + 1)}`}
            className={classNames(
              "p-3 underline inline-block bg-slate-100 hover:bg-slate-200 rounded-xl",
              page === i + 1 && "cursor-default !bg-blue-400"
            )}
          >
            {i + 1}
          </Link>
        ))}
        {totalPages !== page && (
          <Link
            to={`${getPageHref(page + 1)}`}
            className="p-3 underline inline-block bg-slate-100 hover:bg-slate-200 rounded-xl"
          >
            다음 〉
          </Link>
        )}
      </div>
    </div>
  );
}
