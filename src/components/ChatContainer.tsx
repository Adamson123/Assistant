import { Dispatch, SetStateAction } from "react";
import { Message } from "../App";
import { Streamdown } from "streamdown";
import { code } from "@streamdown/code";
import { mermaid } from "@streamdown/mermaid";
import { math } from "@streamdown/math";
import "katex/dist/katex.min.css";
import "streamdown/styles.css";

const UserMessageBox = ({ msg }: { msg: Message }) => {
    return (
        <div className="max-w-100 bg-third-color/30 self-end p-3 rounded-tl-xl rounded-bl-xl rounded-tr-xl flex flex-col">
            <p>{msg.message}</p>
            {msg.images?.length ? (
                <div className="flex flex-wrap gap-1.5">
                    {msg.images.map((img, i) => (
                        <img
                            key={i}
                            src={img}
                            alt="User sent image"
                            className="size-7 object-cover rounded-lg mt-2"
                        />
                    ))}
                </div>
            ) : (
                ""
            )}
        </div>
    );
};

const AIMessageBox = ({ msg }: { msg: Message }) => {
    return (
        <div className="w-full bg-transparent self-start p-3">
            <Streamdown
                plugins={{
                    code,
                    mermaid,
                    math,
                }}
            >
                {msg.message}
            </Streamdown>
        </div>
    );
};

const ChatContainer = ({
    messages,
    setMessages,
}: {
    messages: Message[];
    setMessages: Dispatch<SetStateAction<Message[]>>;
}) => {
    return (
        <div
            style={{
                scrollbarColor: "var(--color-primary-color) transparent",
            }}
            className="chat grow overflow-y-auto w-full p-5"
        >
            {messages.length ? (
                <div className="flex flex-col text-sm gap-5">
                    {messages.map((msg, i) => {
                        switch (msg.type) {
                            case "user":
                                return <UserMessageBox key={i} msg={msg} />;
                            case "ai":
                                return <AIMessageBox key={i} msg={msg} />;
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
        </div>
    );
};

export default ChatContainer;
