import { RefObject, useEffect, useRef, useState } from "react";
import "./index.css";
import Header from "./components/Header";
import PromptInput from "./components/PromptInput";
import ChatContainer from "./components/ChatContainer";
import { MessageCirclePlus, PanelLeft } from "lucide-react";
import ChatHistory from "./components/ChatHistory";
import { Message } from "../types";
import useHandleAiQuery from "./hooks/useHandleAI";
import messagesMock from "./data/messagesMock";
import useFold from "./hooks/useFold";
//import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
//import { invoke } from "@tauri-apps/api/core";

// window.addEventListener("keydown", async (e) => {
//     if (e.ctrlKey && e.shiftKey && e.key === "O") {
//         //const currentWindow = getCurrentWebviewWindow();
//         //WebviewWindow.getCurrent();
//         // currentWindow.openDevTools();
//         await invoke("plugin:window|open_devtools");
//     }
// });

function App() {
    const [showAssistant, setShowAssistant] = useState(false);
    const [messages, setMessages] = useState<Message[]>(messagesMock);
    //TODO:Remove
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const { error, sendAiRequest, isAIResponsePending, responseTitle } =
        useHandleAiQuery(setMessages, messages);
    const [chatTitle, setChatTitle] = useState("");
    const { fold, toggleFold, unFoldWindow } = useFold();
    // console.log({ api_key: import.meta.env.VITE_GEMINI_API_KEY });

    useEffect(() => {
        if (!chatTitle) setChatTitle(responseTitle);
    }, [responseTitle]);

    return (
        <main className="h-screen items-center justify-center mainContainer w-full flex flex-col bg-primary-color">
            <Header toggleFold={toggleFold} fold={fold} />

            <div className="flex flex-col w-full max-w-4xl h-[calc(100vh-38px)]">
                {/* Chat history and New chat, Title */}
                {!fold && (
                    <>
                        {/*  */}
                        <ChatHistory
                            showAssistant={showAssistant}
                            setShowAssistant={setShowAssistant}
                        />

                        {/*  */}
                        <div className="flex p-3 items-center chatHead">
                            {/* Chat history and New chat */}
                            <div
                                className="py-2 px-3 rounded-full 
                border border-third-color/30 flex gap-3 shadow-md"
                            >
                                <button onClick={() => setShowAssistant(true)}>
                                    <PanelLeft className="size-5 stroke-1" />
                                </button>
                                <button>
                                    <MessageCirclePlus className="size-5 stroke-1" />
                                </button>
                            </div>
                            {/* Title */}
                            <h2 className="mx-auto text-center truncate max-w-[350px]">
                                {chatTitle || "New Chat"}
                            </h2>
                        </div>

                        {/*  */}
                        <ChatContainer
                            messages={messages}
                            setMessages={setMessages}
                            isAIResponsePending={isAIResponsePending}
                            error={error}
                            chatContainerRef={
                                chatContainerRef as RefObject<HTMLDivElement>
                            }
                        />
                    </>
                )}

                <PromptInput
                    unFoldWindow={unFoldWindow}
                    setMessages={setMessages}
                    isAIResponsePending={isAIResponsePending}
                    sendAiRequest={sendAiRequest}
                />
            </div>
        </main>
    );
}

export default App;
