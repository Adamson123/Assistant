import type { Env, UserInput } from "./../types/index.ts";
import fs from "fs/promises";
import path from "path";
//@ts-expect-error
import { parse } from "envfile";

export const srcTauri = process.cwd();
export const projectRoot = path.dirname(srcTauri);

export const getEnvInRoot = async (): Promise<Env> => {
    try {
        const envDir = path.join(projectRoot, ".env");
        const content = await fs.readFile(envDir);
        const parsed = parse(content);
        return parsed;
    } catch (error) {
        console.log("Error passing env");
        return {
            VITE_GEMINI_API_KEY: "",
            VITE_GEMINI_API_KEY_2: "",
            VITE_GEMINI_API_KEY_3: "",
            VITE_MISTRA_API_KEY: "",
            VITE_GROQ_API_KEY: "",
        };
    }
};

export const logDebug = (message: string, details?: unknown) => {
    if (details === undefined) {
        console.log(`[node-worker] ${message}`);
        return;
    }

    console.log(`[node-worker] ${message}`, details);
};

export const parseDataUrl = (dataUrl: string) => {
    const matched = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!matched) return null;

    return {
        mimeType: matched[1],
        data: matched[2],
    };
};

export const structureForGemini = (request: UserInput) => {
    const screenshots = Array.isArray(request.screenshots)
        ? request.screenshots
        : [];

    // Gemini expects images as separate "parts" in the content array, with the image data included as base64 inline data. We need to parse the data URLs and construct the appropriate content structure for the API.
    const imageParts = screenshots
        .map((shot) => parseDataUrl(shot))
        .filter((part): part is { mimeType: string; data: string } => !!part)
        .map((part) => ({
            inlineData: {
                mimeType: part.mimeType,
                data: part.data,
            },
        }));

    const parts = [{ text: request.prompt }, ...imageParts];

    return parts;
};
