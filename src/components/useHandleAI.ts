import { useState } from "react";
import { Message } from "../App";
import node_api from "../api/node-api";
import type { UserInput } from "../types";

const geminiRequest = async (request: UserInput) => {
    try {
        const response = await node_api.analyzeWithGemini(request);
        return { type: "gemini", text: response, error: "" };
    } catch (error) {
        return { type: "gemini", text: "", error: String(error) };
    }
};

const geminiRequestStream = async (
    request: UserInput,
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
) => {
    try {
        let accumulatedText = "";
        setMessages((msgs) =>
            msgs.length
                ? [...msgs, { message: accumulatedText, type: "ai" }]
                : [{ message: accumulatedText, type: "ai" }],
        );
        const callback = (text: string) => {
            accumulatedText += text;
            setMessages((msgs) => {
                const lastMessage = msgs[msgs.length - 1];
                if (lastMessage && lastMessage.type === "ai") {
                    return [
                        ...msgs.slice(0, -1),
                        { message: accumulatedText, type: "ai" },
                    ];
                }
                return [...msgs, { message: accumulatedText, type: "ai" }];
            });

            console.log(text);
        };

        console.log("Sent request in client");
        const response = await node_api.analyzeWithGeminiStream(request);

        return { type: "gemini", text: response, error: "" };
    } catch (error) {
        return { type: "gemini", text: "", error: String(error) };
    }
};

const mistraRequest = async (request: {
    prompt: string;
    screenshots: string[];
}) => {
    const apiKey = import.meta.env.VITE_MISTRA_API_KEY;
    const url = "https://api.mistral.ai/v1/chat/completions";
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: "mistral-small-latest",
            messages: [{ role: "user", content: JSON.stringify(request) }],
        }),
    });

    return { response, type: "mistra" };
};

const groqRequest = async (request: {
    prompt: string;
    screenshots: string[];
}) => {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    const url = "https://api.groq.com/openai/v1/chat/completions";
    const response = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`, // don't hardcode 😤
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "openai/gpt-oss-120b",
            messages: [
                {
                    role: "user",
                    content: JSON.stringify(request),
                },
            ],
        }),
    });

    return { response, type: "groq" };
};

export default function useHandleAiQuery(
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
) {
    const [error, setError] = useState("");
    const [isAIResponsePending, setIsAIResponsePending] = useState(false);

    //  const [response, setResponse] = useState("");
    const sendAiRequest = async (prompt: string, images: string[]) => {
        setError("");
        setIsAIResponsePending(true);

        const request = {
            prompt,
            screenshots: images,
        };

        const res = await geminiRequestStream(request, setMessages);
        setIsAIResponsePending(false);

        if (res.error) {
            setError(res.error);
            return;
        }

        const aiMessage: Message = {
            message: res.text,
            type: "ai",
        };
        setMessages((msgs) =>
            msgs.length ? [...msgs, aiMessage] : [aiMessage],
        );

        return res.error;
    };

    return {
        sendAiRequest,
        error,
        isAIResponsePending,
    };
}
