import axios from "axios";

const BASE_URL = "https://ahcxrtniyz.us18.qoddiapp.com/board";
// const BASE_URL = "/board";
axios.defaults.baseURL = BASE_URL;

export type ArticleListItem = {
  nickname: string;
  id: number;
  title: string;
  updateDate: string;
  replyCount: number;
};

type Article = {
  totalBoardCount: number;
  boardInfo: Array<ArticleListItem>;
};

export type ArticleReq =
  | {
      page?: number;
      listCnt?: number;
    }
  | undefined;

export type DetailArticle = {
  nickname: string;
  title: string;
  content: string;
  updateDate: string;
};

type PostArticleReq = {
  nickname: string;
  password: string;
  title: string;
  content: string;
};

type PostArticle = {
  id: number;
};

type PutArticleReq = {
  id: number;
  password: string;
  title: string;
  content: string;
};

type DeleteArticleReq = {
  id: number;
  password: string;
};

type PostImageReq = {
  file: File;
};

type PostImage = {
  imageUrl: string;
};

export type Reply = {
  postId: number;
  replyId: number;
  parentId: number;
  parentTrueFalse: boolean;
  content: string;
  nickname: string;
  updateDate: string; // iso8601
};

export type ReplyListReq = {
  postId: number;
};

export type PostReplyReq = {
  postId: number;
  parentId: number | null; // null이면 새 댓글 달기
  content: string;
  nickname: string;
  password: string;
};

export type PostReply = {
  //
};

export type DeleteReplyReq = {
  replyId: number;
  postId: number;
  password: string;
  parentId: number;
};

export type DeleteReply = {
  //
};

export type ReplyList = Array<Reply>;

export const getReplyList = async (params: ReplyListReq) => {
  return (await axios.get<ReplyList>("/reply", { params })).data;
};

export const getList = async (params?: ArticleReq) => {
  return (await axios.get<Article>("/list", { params })).data;
};

export const getView = async (params: { id: ArticleListItem["id"] }) => {
  return (
    await axios.get<DetailArticle>("/view", {
      params,
    })
  ).data;
};

export const postArticle = async (body: PostArticleReq) => {
  return await axios.post<PostArticle>("", body);
};

export const postReply = async (body: PostReplyReq) => {
  return await axios.post<PostReply>("/reply", body);
};

export const modifyArticle = async (body: PutArticleReq) => {
  return await axios.put("", body);
};

export const deleteArticle = async (params: DeleteArticleReq) => {
  return await axios.delete("", {
    params,
  });
};

export const deleteReply = async (params: DeleteReplyReq) => {
  return await axios.delete("/reply", {
    params,
  });
};

export const postImage = async (body: PostImageReq) => {
  const formData = new FormData();
  formData.set("file", body.file);
  const result = await axios.post<PostImage>("../image", formData, {
    headers: {
      // "Content-Type": "multipart/form-data",
    },
  });
  return result.data;
};
