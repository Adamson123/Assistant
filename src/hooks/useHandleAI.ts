import { RefObject, useEffect, useState } from "react";
import node_api from "../api/node-api";
import type { GeminiContent, Message, UserInput } from "../types";

const removeResponseTitleFromText = (text: string) => {
    return text.replace(/\?\?.*?\?\?/, "").trim();
};

const extractResponseTitleFromText = (text: string) => {
    const title = text.match(/\?\?(.*?)\?\?/);
    const result = title ? title[1] : "";
    return result;
};

const geminiRequest = async (request: UserInput) => {
    try {
        const response = await node_api.analyzeWithGemini(request);
        return {
            type: "gemini",
            text: removeResponseTitleFromText(response),
            error: "",
        };
    } catch (error) {
        return { type: "gemini", text: "", error: String(error) };
    }
};

const geminiRequestStream = async (
    request: UserInput,
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
    scrollToBottom: () => void = () => {},
) => {
    try {
        let accumulatedText = "";
        setMessages((msgs) =>
            msgs.length
                ? [...msgs, { message: accumulatedText, type: "model" }]
                : [{ message: accumulatedText, type: "model" }],
        );
        const callback = (text: string) => {
            accumulatedText += text;
            accumulatedText = removeResponseTitleFromText(accumulatedText);
            setMessages((msgs) => {
                const lastMessage = msgs[msgs.length - 1];
                if (lastMessage && lastMessage.type === "model") {
                    return [
                        ...msgs.slice(0, -1),
                        { message: accumulatedText, type: "model" },
                    ];
                }
                return [...msgs, { message: accumulatedText, type: "model" }];
            });
            scrollToBottom();
            //   console.log(text);
        };

        console.log("Sent request in client");
        const response = await node_api.analyzeWithGeminiStream(
            request,
            callback,
        );

        return { type: "gemini", text: response, error: "" };
    } catch (error) {
        console.log(error, "Error in client");

        return {
            type: "gemini",
            text: "",
            error:
                JSON.parse((error as Error).message)?.error?.message ||
                (error as Error).message ||
                "Something went wrong",
        };
    }
};

export default function useHandleAiQuery(
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
    messages: Message[],
    chatContainerRef: RefObject<HTMLDivElement>,
) {
    const [error, setError] = useState("");
    const [isAIResponsePending, setIsAIResponsePending] = useState(false);
    const [responseTitle, setResponseTitle] = useState("");

    const updateResponseTitle = (text: string) => {
        const title = extractResponseTitleFromText(text);
        setResponseTitle(title);
    };

    //TODO: Auto scroll to bottom when new message arrives, only auto scroll if user is already near the bottom, if user has scrolled up, don't auto scroll until they scroll back down to the bottom 20% of the chat

    const scrollToBottom = () => {};

    useEffect(() => {
        const container = chatContainerRef.current;
        // const isNearBottom =
        //     container &&
        //     container.scrollHeight -
        //         container.scrollTop -
        //         container.clientHeight <
        //         600; // 200px threshold

        if (container) {
            container.scrollTo({
                top: container.scrollHeight,
                behavior: "smooth",
            });
            console.log("Scrolling to bottom");
        }
    }, [messages]);

    const getHistory = () => {
        const history: GeminiContent[] = messages.length
            ? messages
                  .slice(Math.max(0, messages.length - 4), -1)
                  .map((msg) => {
                      return {
                          role: msg.type,
                          parts: [
                              {
                                  text: msg.message,
                              },
                          ],
                      };
                  })
            : [];

        return history;
    };

    const sendAiRequest = async (prompt: string, images: string[]) => {
        setError("");
        setIsAIResponsePending(true);

        const history = getHistory();

        const request = {
            prompt,
            screenshots: images,
            history,
        };

        const res = await geminiRequestStream(
            request,
            setMessages,
            scrollToBottom,
        );
        setIsAIResponsePending(false);

        if (res.error) {
            setError(res.error);
            //Remove the pending message if there's an error
            setMessages((msgs) => {
                const lastMessage = msgs[msgs.length - 1];
                if (
                    lastMessage &&
                    lastMessage.type === "model" &&
                    lastMessage.message === ""
                ) {
                    return msgs.slice(0, -1);
                }
                return msgs;
            });
            return;
        }

        updateResponseTitle(res.text);
        // removeTitleFromLastResponse();

        const aiMessage: Message = {
            message: res.text,
            type: "model",
        };

        return aiMessage;
    };

    return {
        sendAiRequest,
        error,
        isAIResponsePending,
        responseTitle,
    };
}
