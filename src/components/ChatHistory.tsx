import { PanelLeft } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";

type Chat = {
  id: string;
  title: string;
  chatsID: string;
};

const ChatHistory = ({
  showAssistant,
  setShowAssistant,
}: {
  showAssistant: boolean;
  setShowAssistant: Dispatch<SetStateAction<boolean>>;
}) => {
  const [chats, setChats] = useState<Chat[]>([
    {
      id: "wekfoerkoerkgrptoglepor",
      title: "Sloan Digital Sky Survey Explained",
      chatsID: "wkowekepowpod",
    },
    {
      id: "wekfoerkoerkgrptoglepor",
      title: "Sloan Digital Sky Survey",
      chatsID: "wkowekepowpod",
    },
    {
      id: "wekfoerkoerkgrptoglepor",
      title: "Sloan Digital splepffo sdlwef Explained",
      chatsID: "wkowekepowpod",
    },
    {
      id: "wekfoerkoerkgrptoglepor",
      title: "Sloan sffolrl fokfpodp owewer Digital splepffo sdlwef Explained",
      chatsID: "wkowekepowpod",
    },
  ]);

  return (
    <div
      className={`fixed z-10 inset-y-0 border-third-color/30 rounded-l-[20px] bg-primary-color
     left-0 chatHistory transition-[width] duration-300 ${showAssistant ? "w-1/2 p-5 pt-3 border-r" : "w-0"}`}
    >
      {showAssistant && (
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            {/* Name */}
            <div className="flex gap-1 items-center">
              <img src="/logo.png" className="size-8 scale-130" />
              <h2
                className="text-[26px] font-medium text-fourth-color
           translate-y-0.5 font-orbitron"
              >
                Assistant
              </h2>
            </div>
            {/* Close */}
            <button onClick={() => setShowAssistant(false)}>
              <PanelLeft className="stroke-1 size-5" />
            </button>
          </div>

          {/* Chats */}
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-third-color">
              Your chats
            </h3>
            {chats.length ? (
              <div className="flex flex-col text-sm">
                {chats.map((chat, i) => (
                  <div
                    className="p-2 rounded-md truncate hover:bg-third-color/30
                cursor-pointer"
                    key={i}
                  >
                    {chat.title}
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="flex justify-center gap-3 text-2xl font-semibold
           text-third-color/50"
              >
                <h3>No Chats</h3>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatHistory;
