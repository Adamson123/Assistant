import { GenerateContentResponse, GoogleGenAI } from "@google/genai";
import type { NodeBackendAPI, UserInput } from "../types/index.ts";
import { getEnvInRoot, structureForGemini } from "./node-utils.ts";

const env = await getEnvInRoot();
//const genAI = new GoogleGenerativeAI(env.VITE_GEMINI_API_KEY);
//const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
const ai = new GoogleGenAI({ apiKey: env.VITE_GEMINI_API_KEY_2 });

const MODEL_LIMITS = {
    "gemini-2.5-flash": 1048576, // ~1M (correct)
    "gemini-1.5-pro": 2097152, // up to ~2M (Vertex AI full spec)
    "gemini-1.5-flash": 1048576, // ~1M
    "gemini-2.0-flash": 1048576, // optimistic max, may be lower in some APIs
};
const CURRENT_MODEL = "gemini-2.5-flash";

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
                contents: [{ role: "user", parts }],
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

            const result = await ai.models.generateContentStream({
                model: CURRENT_MODEL,
                contents: [...request.history, { role: "user", parts }],
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
