import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  DetailArticle,
  getView,
  modifyArticle,
  postArticle,
  postImage,
} from "../api";
import dayjs from "dayjs";

export default function Write() {
  const [sp] = useSearchParams();
  const isModify = sp.get("mode") === "modify";
  const targetId = Number(sp.get("id"));

  // modify 전용
  const { data } = useQuery(
    ["view", targetId],
    () => getView({ id: targetId }),
    { enabled: isModify, suspense: true }
  );

  const nicknameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  const [content, setContent] = useState("");

  useEffect(() => {
    if (!data) return;
    if (nicknameRef.current) nicknameRef.current.value = data.nickname;
    if (titleRef.current) titleRef.current.value = data.title;
    setContent(data.content);
  }, [data]);

  const modifyMutation = useMutation(["modify"], modifyArticle);
  const writeMutation = useMutation(["write"], postArticle);
  const imageMutation = useMutation(["file"], postImage);
  const writeIsLoading = writeMutation.isLoading;
  const modifyIsLoading = modifyMutation.isLoading;
  const imageIsLoading = imageMutation.isLoading;

  const isLoading = writeIsLoading || modifyIsLoading || imageIsLoading;

  const navigate = useNavigate();

  const handleModify = async () => {
    try {
      await modifyMutation.mutateAsync({
        id: targetId,
        content: content.slice(0, 1000),
        title: titleRef.current?.value || "",
        password: passwordRef.current?.value || "",
      });
      navigate(`/view/${targetId}`, { replace: true });
    } catch (e) {
      alert("수정 실패!! 비밀번호가 틀렸을 수 있습니다.");
    }
  };
  const queryClient = useQueryClient();

  const handleWrite = async () => {
    try {
      const data = {
        title: titleRef.current?.value || "",
        content: content.slice(0, 1000),
        nickname: nicknameRef.current?.value || "ㅇㅇ",
        password: passwordRef.current?.value || "",
      };
      const result = await writeMutation.mutateAsync(data);
      // set query (cache)
      queryClient.setQueryData<DetailArticle>(["view", result.data.id], () => ({
        content: data.content,
        nickname: data.nickname,
        title: data.title,
        updateDate: dayjs().toISOString(), // 로컬 시간으로 캐-싱 ㅇㅅㅇ
      }));
      navigate(`/view/${result.data.id}`, {
        replace: true,
      });
    } catch (e) {
      alert("등록 실패!!");
    }
  };

  const inputFileRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(
    (file: File) => {
      imageMutation.mutateAsync({ file }).then((result) => {
        const insertStr = `<${result.imageUrl}>`;
        setContent((c) => c + "\n" + insertStr);
      });
    },
    [imageMutation]
  );

  useEffect(() => {
    const inputFile = inputFileRef.current!;
    const handler = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      // handle upload file
      handleUpload(file);
    };
    inputFile.addEventListener("input", handler);

    return () => {
      inputFile.removeEventListener("input", handler);
    };
  }, [handleUpload]);

  return (
    <div>
      <h1 className="text-2xl">게시글 {isModify ? "수정" : "쓰기"}</h1>
      <div className="flex flex-col p-3 w-[800px] space-y-1">
        <legend className="flex items-center">
          <span className="mr-3 w-[100px]">닉네임</span>
          <input
            ref={nicknameRef}
            type="text"
            className="p-[1px] border w-[300px]"
            placeholder="닉네임"
            defaultValue="ㅇㅇ"
            disabled={isModify}
          />
        </legend>
        <legend className="flex items-center">
          <span className="mr-3 w-[100px]">비밀번호</span>
          <input
            ref={passwordRef}
            type="password"
            className="p-[1px] border w-[300px]"
            placeholder="비밀번호"
          />
        </legend>
        <legend className="flex items-center">
          <span className="mr-3 w-[100px]">제목</span>
          <input
            ref={titleRef}
            type="text"
            className="p-[1px] border flex-1"
            placeholder="제목"
          />
        </legend>
        <legend className="flex items-center">
          <span className="mr-3 w-[100px] self-start">내용</span>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 border h-[600px]"
            placeholder="내용을 입력하세요."
            maxLength={1000}
          />
        </legend>
        <div className="w-full text-right text-gray-500 text-xs">
          ({content.length.toLocaleString("ko-KR")}/1,000)
        </div>
        <legend className="flex items-center">
          <span className="mr-3 w-[100px] self-start">이미지 첨부</span>
          <input type="file" ref={inputFileRef} />
        </legend>
        <div className="flex justify-start flex-row-reverse">
          <button
            className="w-[200px] mt-4 p-3 inline-block bg-blue-400 hover:bg-blue-500 rounded-xl ml-2 disabled:bg-slate-600 disabled:text-white"
            onClick={isModify ? handleModify : handleWrite}
            disabled={isLoading}
          >
            {isModify ? "수정" : "등록"}하기 {isLoading && "(진행 중)"}
          </button>
          <Link
            to="/"
            className="mt-4 p-3  inline-block bg-slate-100 hover:bg-slate-200 rounded-xl hover:underline"
          >
            목록으로
          </Link>
        </div>
      </div>
    </div>
  );
}
