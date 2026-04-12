import { GoogleGenAI } from "@google/genai";
import type { NodeBackendAPI, UserInput } from "../types/index.ts";
import { getEnvInRoot, structureForGemini } from "./node-utils.ts";

const env = await getEnvInRoot();
//const genAI = new GoogleGenerativeAI(env.VITE_GEMINI_API_KEY);
//const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
const ai = new GoogleGenAI({ apiKey: env.VITE_GEMINI_API_KEY_2 });

const ai_api: Pick<
    NodeBackendAPI,
    "analyzeWithGemini" | "analyzeWithGeminiStream"
> = {
    analyzeWithGemini: async (request: UserInput) => {
        try {
            //const result = await genAI.generateContent(request);
            const parts = structureForGemini(request);

            const result = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: [{ role: "user", parts }],
            });

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
                model: "gemini-2.5-flash",
                contents: [...request.history, { role: "user", parts }],
            });

            console.log("Stream started");
            let accumulatedText = "";
            for await (const part of result) {
                if (part.text) {
                    accumulatedText += part.text;
                    // console.log("Recieved Part: ", part.text);
                    // await fs.writeFile(
                    //     path.join(projectRoot, "streams/stream_output.txt"),
                    //     accumulatedText,
                    // );
                    callback(part.text);
                }
            }

            return accumulatedText;
        } catch (error) {
            throw String(error);
        }
    },
};

export default ai_api;
