import { useEffect, useState } from "react";
import "./index.css";
import Header from "./components/Header";
import PromptInput from "./components/PromptInput";
import ChatContainer from "./components/ChatContainer";
import { getCurrentWindow, LogicalSize } from "@tauri-apps/api/window";
import { MessageCirclePlus, PanelLeft } from "lucide-react";
import ChatHistory from "./components/ChatHistory";
import { messagesTemp } from "./data/messagesTemp";
import { Message } from "./types";

function App() {
    const [fold, setFold] = useState(false);
    const [showAssistant, setShowAssistant] = useState(false);
    const [messages, setMessages] = useState<Message[]>(messagesTemp);

    const foldWindow = async () => {
        // if (fold) return;

        const window = getCurrentWindow();
        const size = await window.innerSize();

        const headerHeight = (
            document.querySelector(".mainHeader") as HTMLDivElement
        ).getBoundingClientRect().height;
        const inputHeight = (
            document.querySelector(".promptInput") as HTMLDivElement
        ).getBoundingClientRect().height;

        const height = headerHeight + inputHeight;

        // console.log({ height, inputHeight }, "FOLDED");

        await window.setSize(new LogicalSize(size.width, height || 300));
        setFold(true);
    };

    const unFoldWindow = async () => {
        setFold(false);
        const window = getCurrentWindow();
        const size = await window.innerSize();
        await window.setSize(new LogicalSize(size.width, size.width - 100));
    };

    const toggleFold = async () => {
        if (!fold) {
            // console.log("Resizing");
            await foldWindow();
        } else {
            await unFoldWindow();
        }
    };

    useEffect(() => {
        const observer = new ResizeObserver((_) => {
            // const entry = entries[0];
            // const height = entry.contentRect.height;
            if (fold) foldWindow();
            // console.log("Input Height ooo:", height);
        });

        const promptInput = document.querySelector(
            ".promptInput",
        ) as HTMLDivElement;
        observer.observe(promptInput);

        return () => observer.disconnect();
    }, [fold]);

    return (
        <main className="h-screen items-center justify-center mainContainer w-full flex flex-col bg-primary-color">
            <Header toggleFold={toggleFold} />

            <div className="flex flex-col w-full max-w-4xl h-[calc(100vh-38px)]">
                {/* Chat history and New chat, Title */}
                {!fold && (
                    <>
                        <ChatHistory
                            showAssistant={showAssistant}
                            setShowAssistant={setShowAssistant}
                        />

                        <div className="flex p-3 w-full items-center chatHead">
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
                            <h2 className="justify-self-center -translate-x-[120%] ml-[50%]">
                                Godot Problem
                            </h2>
                        </div>

                        {/* Placeholder
            <div className="h-[47px]" /> */}
                        <ChatContainer
                            messages={messages}
                            setMessages={setMessages}
                        />
                    </>
                )}

                <PromptInput
                    unFoldWindow={unFoldWindow}
                    messages={messages}
                    setMessages={setMessages}
                />
            </div>
        </main>
    );
}

export default App;
