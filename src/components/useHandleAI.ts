import { useState } from "react";
import { Message } from "../App";

const geminiRequest = async (request: {
    prompt: string;
    screenshots: string[];
}) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            contents: [
                {
                    role: "user",
                    parts: [{ text: JSON.stringify(request) }],
                },
            ],
        }),
    });

    return { response, type: "gemini" };
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

        const res = await groqRequest(request);
        setIsAIResponsePending(false);

        if (!res.response.ok) {
            const errorData = await res.response.json();
            let errorMsg = "";
            if (res.type === "gemini") {
                errorMsg = errorData.error.message;
            } else if (res.type === "mistra") {
                errorMsg = "Mistra error: " + res.response.status;
            } else if (res.type === "groq") {
                errorMsg = "Groq error: " + res.response.status;
            }

            setError(
                errorMsg || "An error occurred while processing your request.",
            );
            return;
        }

        const AIResponse = await res.response.json();

        let aiText = "";
        if (res.type === "gemini") {
            aiText = AIResponse.candidates[0].content.parts[0].text;
        } else if (res.type === "mistra" || res.type === "groq") {
            console.log({ AIResponse });
            aiText = AIResponse.choices[0].message.content;
        }

        const aiMessage: Message = {
            message: aiText,
            type: "ai",
        };
        setMessages((msgs) =>
            msgs.length ? [...msgs, aiMessage] : [aiMessage],
        );

        return aiText;
    };

    return {
        sendAiRequest,
        error,
        isAIResponsePending,
    };
}
