import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import type { NodeBackendAPI, UserInput } from "../types/index.ts";
import { getEnvInRoot, logDebug, structureForGemini } from "./node-utils.ts";

const env = await getEnvInRoot();
//const genAI = new GoogleGenerativeAI(env.VITE_GEMINI_API_KEY);
//const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
const ai = new GoogleGenAI({ apiKey: env.VITE_GEMINI_API_KEY_2 });

const MODEL_LIMITS: { [modelName: string]: number } = {
    // Current Stable Free Tier Models
    "gemini-2.5-flash": 1048576, // ~1M
    "gemini-2.5-flash-lite": 1048576, // ~1M
    "gemini-2.5-pro": 2097152, // ~2M (Vertex AI / High-tier limit)

    // Current Preview Free Tier Models
    "gemini-3-flash-preview": 1048576, // ~1M
    "gemini-3.1-flash-lite-preview": 1048576, // ~1M
};

const MODELS = {
    Gemini2_5Flash: "gemini-2.5-flash",
    Gemini2_5FlashLite: "gemini-2.5-flash-lite",
    Gemini2_5Pro: "gemini-2.5-pro",
    Gemini3FlashPreview: "gemini-3-flash-preview",
    Gemini3_1FlashLitePreview: "gemini-3.1-flash-lite-preview",
};
const CURRENT_MODEL = MODELS.Gemini3_1FlashLitePreview;

const logTokensLeft = (response: GenerateContentResponse) => {
    if (!response) return;
    const tokensUsed = response.usageMetadata?.totalTokenCount || 0;
    const tokensLeft = MODEL_LIMITS[CURRENT_MODEL] - tokensUsed;
    console.log(`Tokens used: ${tokensUsed}, Tokens left: ${tokensLeft}`);
};

const ai_api: Pick<
    NodeBackendAPI,
    "analyzeWithGemini" | "analyzeWithGeminiStream"
> = {
    analyzeWithGemini: async (request: UserInput) => {
        try {
            //const result = await genAI.generateContent(request);
            const parts = structureForGemini(request);

            const result = await ai.models.generateContent({
                model: CURRENT_MODEL,
                contents: [...request.history, { role: "user", parts }],
            });

            logTokensLeft(result);

            return result.text || "";
        } catch (error) {
            throw String(error);
        }
    },

    analyzeWithGeminiStream: async (
        request: UserInput,
        callback: (text: string) => void,
    ) => {
        try {
            //const result = await genAI.generateContent(request);
            console.log("Recieved request for analytics");

            const parts = structureForGemini(request);

            logDebug("History: ", JSON.stringify(request.history));

            const result = await ai.models.generateContentStream({
                model: CURRENT_MODEL,
                contents: [
                    {
                        role: "user",
                        parts: [
                            {
                                text: "History starts",
                            },
                        ],
                    },
                    ...request.history,
                    {
                        role: "user",
                        parts: [
                            {
                                text: "History ends here and new prompt starts here.",
                            },
                        ],
                    },
                    {
                        role: "user",
                        parts: [
                            {
                                text: "answer the question based on the history only if needed or relevant. If the question can be answered without the history, you can ignore the history. Always answer the question based on your understanding and knowledge. If chat history is empty, suggest a suitable chat title based  on the question and surround it with double angle brackets like this <<chat title>> for easy extraction and make sure it appears first.  Now here is the user question: ",
                            },
                        ],
                    },
                    { role: "user", parts },
                ],
            });

            console.log("Stream started");
            let accumulatedText = "";
            let lastChunk: GenerateContentResponse | null = null;
            for await (const part of result) {
                if (part.text) {
                    accumulatedText += part.text;
                    // console.log("Recieved Part: ", part.text);
                    // await fs.writeFile(
                    //     path.join(projectRoot, "streams/stream_output.txt"),
                    //     accumulatedText,
                    // );
                    lastChunk = part;
                    callback(part.text);
                }
            }

            logTokensLeft(lastChunk!);

            return accumulatedText;
        } catch (error) {
            throw String(error);
        }
    },
};

export default ai_api;
