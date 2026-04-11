/// <reference types="node" />

import type { Env } from "./../types/index";
import { RPCChannel, NodeIo } from "kkrpc";
import type { NodeBackendAPI } from "./node-shared-api";
import fs from "fs/promises";
import path from "path";
//@ts-expect-error
import { parse } from "envfile";
import { GoogleGenAI } from "@google/genai";

const srcTauri = process.cwd();
const projectRoot = path.dirname(srcTauri);

const getEnvInRoot = async (): Promise<Env> => {
    const envDir = path.join(projectRoot, ".env");
    const content = await fs.readFile(envDir);
    const parsed = parse(content);
    return parsed;
};

const env = await getEnvInRoot();
//const genAI = new GoogleGenerativeAI(env.VITE_GEMINI_API_KEY);
//const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
const ai = new GoogleGenAI({ apiKey: env.VITE_GEMINI_API_KEY });

const logDebug = (message: string, details?: unknown) => {
    if (details === undefined) {
        console.error(`[node-worker] ${message}`);
        return;
    }

    console.error(`[node-worker] ${message}`, details);
};

const parseDataUrl = (dataUrl: string) => {
    const matched = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!matched) return null;

    return {
        mimeType: matched[1],
        data: matched[2],
    };
};

const api: NodeBackendAPI = {
    analyzeImage: async (filePath: string) => {
        // Placeholder implementation
        return `Analysis of image at ${filePath}`;
    },
    generateText: async (prompt: string) => {
        // Placeholder implementation
        return `Generated text for prompt: ${prompt}`;
    },
    // transcribeAudio: async (filePath: string) => {
    //     // Placeholder implementation
    //     return `Transcription of audio at ${filePath}`;
    // },
    createFile: async (fileName: string, data: string) => {
        try {
            await fs.writeFile(path.join(projectRoot, fileName), data);

            return JSON.stringify(env);
        } catch (error) {
            throw String(error);
        }
    },

    analyzeWithGemini: async (request) => {
        //const result = await genAI.generateContent(request);
        const requestObj: {
            prompt: string;
            screenshots: string[];
        } = JSON.parse(request);

        const screenshots = Array.isArray(requestObj.screenshots)
            ? requestObj.screenshots
            : [];

        // Gemini expects images as separate "parts" in the content array, with the image data included as base64 inline data. We need to parse the data URLs and construct the appropriate content structure for the API.
        const imageParts = screenshots
            .map((shot) => parseDataUrl(shot))
            .filter(
                (part): part is { mimeType: string; data: string } => !!part,
            )
            .map((part) => ({
                inlineData: {
                    mimeType: part.mimeType,
                    data: part.data,
                },
            }));

        logDebug("analyzeWithGemini payload", {
            promptLength: requestObj.prompt.length,
            screenshotsCount: screenshots.length,
            validImageParts: imageParts.length,
        });

        const parts = [{ text: requestObj.prompt }, ...imageParts];

        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ role: "user", parts }],
        });
        //return result.response.text();

        return result.text as string;
    },
};

const io = new NodeIo(process.stdin, process.stdout);
new RPCChannel(io, { expose: api });

console.error("Node worker started, waiting for RPC calls...");
