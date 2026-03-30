import { useState } from "react";

export type Message = {
  message: string;
  type: "user" | "ai";
};

const UserMessageBox = ({ msg }: { msg: Message }) => {
  return (
    <div className="max-w-[400px] bg-third-color/30 self-end p-3 rounded-tl-xl rounded-bl-xl rounded-tr-xl">
      {msg.message}
    </div>
  );
};

const AIMessageBox = ({ msg }: { msg: Message }) => {
  return (
    <div className="max-w-[400px] bg-transparent self-start p-3">
      {msg.message}
    </div>
  );
};

const ChatContainer = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      message:
        "Hello AI Assistant, How are you doing my guy oooooooo hahahahhahahhahahhahahah?",
      type: "user",
    },
    {
      message:
        "Hello AI AssSAIK SPKSPstant, How are you doing my guy oooooooo sekwqeowkpokwepsok?",
      type: "ai",
    },

    {
      message:
        "Hello AI Assistant, How are you doing my guy oooooooo hahahahhahahhahahhahahah?",
      type: "user",
    },
    {
      message:
        "Hello AI AssSAIK SPKSPstant, How are you doing my guy oooooooo sekwqeowkpokwepsok?",
      type: "ai",
    },

    {
      message:
        "Hello AI Assistant, How are you doing my guy oooooooo hahahahhahahhahahhahahah?",
      type: "user",
    },

    {
      message:
        "Hello AI AssSAIK SPKSPstant, How are you doing my guy oooooooo sekwqeowkpokwepsok?",
      type: "ai",
    },
  ]);

  return (
    <div
      style={{
        scrollbarColor: "var(--color-primary-color) transparent",
      }}
      className="chat grow overflow-y-auto w-full p-5"
    >
      <div className="flex flex-col text-sm gap-5">
        {messages.map((msg, i) => {
          switch (msg.type) {
            case "user":
              return <UserMessageBox key={i} msg={msg} />;
              break;
            case "ai":
              return <AIMessageBox key={i} msg={msg} />;
              break;
            default:
              return <UserMessageBox key={i} msg={msg} />;
              break;
          }
        })}
      </div>
    </div>
  );
};

export default ChatContainer;
