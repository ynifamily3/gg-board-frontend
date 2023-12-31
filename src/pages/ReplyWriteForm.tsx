import type { ReactNode } from "react";

export const ReplyWriteForm = (props: {
  NicknameInput: ReactNode;
  PasswordInput: ReactNode;
  ContentInput: ReactNode;
  title: string;
  handleRegisterReply: () => void;
}) => {
  const {
    NicknameInput,
    PasswordInput,
    ContentInput,
    handleRegisterReply,
    title,
  } = props;
  return (
    <div className="">
      <div>{title}</div>
      <div className="flex space-x-2">
        {NicknameInput}
        {PasswordInput}
      </div>
      <div className="mt-2 flex space-x-2 items-center mb-10">
        {ContentInput}
        <button
          onClick={() => handleRegisterReply()}
          className="p-4 border bg-gray-100"
        >
          등록
        </button>
      </div>
    </div>
  );
};
