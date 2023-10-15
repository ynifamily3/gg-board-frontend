import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  deleteArticle,
  deleteReply,
  getReplyList,
  getView,
  postReply,
} from "../api";
import { Fragment, Suspense, useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
import MyModal from "../Modal";
import { S3_URL } from "../const";
import classNames from "classnames";
import { ReplyWriteForm } from "./ReplyWriteForm";

export function DeletePasswordForm({
  handleClose,
}: {
  handleClose: () => void;
}) {
  const deleteMutation = useMutation(["delete"], deleteArticle);
  const isLoading = deleteMutation.isLoading;

  const { id } = useParams();
  const navigate = useNavigate();
  const passwordRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <h1 className="text-xl">경고</h1>
      <div className="">정말로 삭제하시려면 비밀번호를 입력해 주세요</div>
      <input
        type="password"
        className="border w-full"
        ref={passwordRef}
        autoFocus
      />
      <div className="flex flex-row-reverse mt-1">
        <button
          disabled={isLoading}
          className="ml-1 p-1 border bg-red-50 disabled:bg-gray-500 disabled:text-white"
          onClick={async () => {
            try {
              await deleteMutation.mutateAsync({
                id: Number(id),
                password: passwordRef.current?.value || "",
              });
              handleClose();
              navigate("/", { replace: true });
            } catch (e) {
              alert("패스워드를 확인해주세요.");
            }
          }}
        >
          {isLoading ? "삭제 중..." : "확인"}
        </button>
        <button className="p-1 border rounded" onClick={handleClose}>
          취소
        </button>
      </div>
    </>
  );
}

function ArticleItem({ id }: { id: number }) {
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const { data } = useQuery(["view", id], () => getView({ id }), {
    suspense: true,
  });
  const article = data!;

  const pattern = /<[^>]+>/g;
  const result = article.content.split(pattern);
  const images = [...article.content.matchAll(pattern)].flat();
  const zipped = useMemo(() => {
    const jsxs: JSX.Element[] = [];
    let keyCnt = 0;
    if (result[0] === "") {
      // img first
      images.forEach((image, i) => {
        const raw = image.replace(/[<>]/g, "");
        // str += image + result[i + 1];
        jsxs.push(<img key={keyCnt++} src={S3_URL + "/" + raw} alt="이미지" />);
        jsxs.push(<Fragment key={keyCnt++}>{result[i + 1]}</Fragment>);
      });
    } else {
      // content first
      result.forEach((content, i) => {
        // str += content + result[i];
        const raw = images[i] ? images[i].replace(/[<>]/g, "") : "";
        jsxs.push(<Fragment key={keyCnt++}>{content}</Fragment>);
        raw &&
          jsxs.push(
            <img key={keyCnt++} src={S3_URL + "/" + raw} alt="이미지" />
          );
      });
    }
    return jsxs;
  }, [images, result]);

  const { data: replyData, refetch: replyRefetch } = useQuery(
    ["reply", id],
    () => getReplyList({ postId: id }),
    {
      keepPreviousData: true,
    }
  );

  const nicknameInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const contentInputRef = useRef<HTMLInputElement>(null);
  const writeReplyMutation = useMutation(["writeReply"], postReply);
  const deleteReplyMutation = useMutation(["deleteReply"], deleteReply);

  const handleRegisterReply = () => {
    const data = {
      parentId: null,
      content: (contentInputRef.current?.value ?? "").trim(),
      nickname: (nicknameInputRef.current?.value ?? "").trim(),
      password: passwordInputRef.current?.value ?? "",
      postId: id,
    };
    writeReplyMutation
      .mutateAsync(data)
      .then(() => {
        replyRefetch();
      })
      .catch(() => {
        alert("댓글 달기 오류!!");
      });
  };

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
      <div className="whitespace-pre py-3">{zipped}</div>
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
      <div>
        <div>댓글: {replyData?.length}개</div>
        <ul>
          {replyData?.map((reply) => (
            <li
              className={classNames(
                "flex even:bg-gray-100 p-4",
                reply.parentTrueFalse === false && "pl-5" // 답글인 경우 들여쓰기
              )}
              key={reply.replyId + "-" + reply.parentId}
            >
              {reply.parentTrueFalse === false && (
                <span aria-label="답글">↳</span>
              )}
              <span>{reply.nickname}:&nbsp;</span>
              <span className="flex-1">{reply.content}</span>
              <button
                onClick={async () => {
                  const result = window.prompt(
                    `댓글 [${reply.content.slice(
                      0,
                      30
                    )}...]을/를 \n삭제하려면 비밀번호 입력: `
                  );
                  if (result === null) return;
                  deleteReplyMutation
                    .mutateAsync({
                      parentId: reply.parentId,
                      password: result,
                      postId: reply.postId,
                      replyId: reply.replyId,
                    })
                    .then(() => {
                      replyRefetch();
                    })
                    .catch(() => alert("삭제실패! 비밀번호를 확인해주세요."));
                }}
                title="삭제"
                className="px-3 hover:bg-blue-50 "
              >
                &times;
              </button>
              <pre>{dayjs(reply.updateDate).format("MM/DD HH:mm")}</pre>
            </li>
          ))}
        </ul>
        <hr className="my-4" />
        <ReplyWriteForm
          NicknameInput={
            <input
              type="text"
              className="border"
              placeholder="닉네임"
              defaultValue="ㅇㅇ"
              ref={nicknameInputRef}
            />
          }
          PasswordInput={
            <input
              type="password"
              className="border"
              placeholder="패스워드"
              defaultValue="dd"
              ref={passwordInputRef}
            />
          }
          ContentInput={
            <input
              type="text"
              className="flex-1 border p-4"
              ref={contentInputRef}
            />
          }
          handleRegisterReply={handleRegisterReply}
        />
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

export default function View() {
  const { id } = useParams();
  const realId = Number(id);

  return (
    <div>
      <h1 className="text-4xl">게시판 글 보기</h1>
      <Suspense fallback={<div>로딩중...</div>}>
        <ArticleItem id={realId} />
      </Suspense>
    </div>
  );
}
