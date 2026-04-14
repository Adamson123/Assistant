import { Dispatch, RefObject, SetStateAction, useRef } from "react";
import { Streamdown } from "streamdown";
import { code } from "@streamdown/code";
import { mermaid } from "@streamdown/mermaid";
import { math } from "@streamdown/math";
import "katex/dist/katex.min.css";
import "streamdown/styles.css";
import { Message } from "../types";
import {
    Circle,
    CircleX,
    Copy,
    Edit2,
    RefreshCcw,
    Volume2,
} from "lucide-react";

const UserMessageBox = ({ msg }: { msg: Message }) => {
    return (
        <div className="max-w-100 self-end flex flex-col gap-1 group">
            <div className="bg-third-color/30  p-3 rounded-tl-xl rounded-bl-xl rounded-tr-xl flex flex-col">
                <p>{msg.message}</p>
                {msg.images?.length ? (
                    <div className="flex flex-wrap gap-1.5">
                        {msg.images.map((img, i) => (
                            <img
                                key={i}
                                src={img}
                                alt="User sent image"
                                className="size-7 object-cover rounded-lg mt-2not-last:"
                            />
                        ))}
                    </div>
                ) : (
                    ""
                )}
            </div>
            <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button className="cursor-pointer size-9 hover:bg-secondary-color flex items-center justify-center rounded">
                    <Copy className="size-5 stroke-third-color" />
                </button>
                <button className="cursor-pointer size-9 hover:bg-secondary-color flex items-center justify-center rounded">
                    <RefreshCcw className="size-5 stroke-third-color" />
                </button>
                <button className="cursor-pointer size-9 hover:bg-secondary-color flex items-center justify-center rounded">
                    <Edit2 className="size-5 stroke-third-color" />
                </button>
            </div>
        </div>
    );
};

const AIMessageBox = ({
    msg,
    isAIResponsePending,
    showBlinkingCircle,
}: {
    msg: Message;
    isAIResponsePending: boolean;
    showBlinkingCircle: boolean;
}) => {
    const circleRef = useRef<SVGSVGElement>(null);

    return (
        <div className="w-full bg-transparent self-start p-3 group">
            <Streamdown
                isAnimating={isAIResponsePending}
                //animated
                plugins={{
                    code,
                    mermaid,
                    math,
                }}
                allowedTags={{
                    circle: [],
                }}
                components={{
                    circle: () => (
                        <Circle
                            ref={circleRef as any}
                            className="fill-white size-3.5 animate-pulse circle inline"
                        />
                    ),
                }}
            >
                {msg.message + (showBlinkingCircle ? " <circle/>" : "")}
            </Streamdown>
            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button className="cursor-pointer size-9 hover:bg-secondary-color flex items-center justify-center rounded">
                    <Copy className="size-5 stroke-third-color" />
                </button>
                <button className="cursor-pointer size-9 hover:bg-secondary-color flex items-center justify-center rounded">
                    <Volume2 className="size-5 stroke-third-color" />
                </button>
            </div>
        </div>
    );
};

const ErrorMessage = ({ error }: { error: string }) => {
    return (
        <div className="px-3 text-red-500  font-semibold gap-1 text-sm mt-5">
            <p className="inline">{error}</p>{" "}
            <CircleX className="size-5 stroke-primary-color fill-red-500 inline" />
        </div>
    );
};

const ChatContainer = ({
    messages,

    isAIResponsePending,
    error,
    chatContainerRef,
}: {
    messages: Message[];
    setMessages: Dispatch<SetStateAction<Message[]>>;
    isAIResponsePending: boolean;
    error: string;
    chatContainerRef: RefObject<HTMLDivElement>;
}) => {
    return (
        <div
            style={{
                scrollbarColor: "var(--color-primary-color) transparent",
            }}
            ref={chatContainerRef}
            className="chat grow overflow-y-auto p-5 pb-50"
        >
            {messages.length ? (
                <div className="flex flex-col text-sm gap-3">
                    {messages.map((msg, i) => {
                        switch (msg.type) {
                            case "user":
                                return <UserMessageBox key={i} msg={msg} />;
                            case "model":
                                return (
                                    <AIMessageBox
                                        key={i}
                                        msg={msg}
                                        isAIResponsePending={
                                            isAIResponsePending
                                        }
                                        showBlinkingCircle={
                                            isAIResponsePending &&
                                            i === messages.length - 1
                                        }
                                    />
                                );
                            default:
                                return <UserMessageBox key={i} msg={msg} />;
                        }
                    })}
                </div>
            ) : (
                <div className="flex items-center justify-center h-full">
                    <h2 className="text-2xl font-semibold text-third-color/50">
                        How can I assist you today?
                    </h2>
                </div>
            )}
            {error && <ErrorMessage error={error} />}
        </div>
    );
};

export default ChatContainer;
