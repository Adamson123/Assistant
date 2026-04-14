import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import type { NodeBackendAPI, UserInput } from "../types/index.ts";
import {
    getEnvInRoot,
    structureFilesForGemini,
    structureScreenshotsForGemini,
} from "./node-utils.ts";
import { extractError } from "../utils/index.ts";

const env = await getEnvInRoot();
//const genAI = new GoogleGenerativeAI(env.VITE_GEMINI_API_KEY);
//const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
const ai = new GoogleGenAI({ apiKey: env.VITE_GEMINI_API_KEY });

const MODEL_LIMITS: { [modelName: string]: number } = {
    // Current Stable Free Tier Models
    "gemini-2.5-flash": 1048576, // ~1M
    "gemini-2.5-flash-lite": 1048576, // ~1M
    "gemini-2.5-pro": 2097152, // ~2M (Vertex AI / High-tier limit)

    // Current Preview Free Tier Models
    "gemini-3-flash-preview": 1048576, // ~1M
    "gemini-3.1-flash-lite-preview": 1048576, // ~1M

    "wrong-model": 0, // For testing error handling
};

const MODELS = {
    Gemini2_5Flash: "gemini-2.5-flash",
    Gemini2_5FlashLite: "gemini-2.5-flash-lite",
    Gemini2_5Pro: "gemini-2.5-pro",
    Gemini3FlashPreview: "gemini-3-flash-preview",
    Gemini3_1FlashLitePreview: "gemini-3.1-flash-lite-preview",
    WRONG_MODEL: "wrong-model",
};
const CURRENT_MODEL = MODELS.Gemini2_5FlashLite;

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
            const parts = structureScreenshotsForGemini(request);

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

            const screenshotParts = structureScreenshotsForGemini(request);
            const fileParts = await structureFilesForGemini(request);

            console.log("fileParts", JSON.stringify(fileParts));

            const result = await ai.models.generateContentStream({
                model: CURRENT_MODEL,
                contents: [
                    {
                        role: "user",
                        parts: [
                            {
                                text: "History starts.",
                            },
                        ],
                    },
                    ...request.history,
                    {
                        role: "user",
                        parts: [
                            {
                                text: "History ends here. New prompt starts below.",
                            },
                        ],
                    },
                    {
                        role: "user",
                        parts: [
                            {
                                text: "Suggest a chat title based on the user's question. If you choose to suggest one, it must appear at the very beginning of your response, surrounded by double question marks like ??Chat Title??, followed by a line break, then continue with your answer. If you do not suggest a title, just answer the question normally. Always answer the question based on your understanding and knowledge. You may use the chat history only if it is relevant and necessary. Now here is the user question: ",
                            },
                        ],
                    },
                    { role: "user", parts: screenshotParts },
                    { role: "user", parts: fileParts },
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
            // error = (error as string).replace("ApiError: ", "");
            const errorMessage = extractError(error);
            // console.log("Error log backend: ", errorMessage);

            throw errorMessage;
        }
    },
};

export default ai_api;
