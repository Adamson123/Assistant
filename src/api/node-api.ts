import type { NodeBackendAPI, UserInput } from "./../types/index";
import { createProcess } from "./process-api";

const PROCESS_NAME = "node-worker";
let nodeWorkerInstance: NodeBackendAPI | null = null;

export async function getNodeProcess(): Promise<NodeBackendAPI> {
    if (nodeWorkerInstance) {
        console.log("Node worker instance already exists, returning it.");
        return nodeWorkerInstance;
    }

    console.log("Node worker instance is null");
    nodeWorkerInstance = await createProcess(PROCESS_NAME, {
        runtime: "node",
        script: "../src/node-backend/node-worker.ts",
        cwd: ".",
    });
    // nodeWorkerInstance = await createProcess(PROCESS_NAME, {
    //     runtime: "node",
    //     args: ["tsx", "../src/node-backend/node-worker.ts"],
    //     cwd: ".",
    // });

    return nodeWorkerInstance as NodeBackendAPI;
}

const node_api: NodeBackendAPI = {
    async analyzeImage(filePath: string) {
        try {
            const worker = await getNodeProcess();
            return await worker.analyzeImage(filePath);
        } catch (error) {
            console.error("Error analyzing image: ", error);
            throw String(error);
        }
    },
    async generateText(prompt: string) {
        try {
            const worker = await getNodeProcess();
            return await worker.generateText(prompt);
        } catch (error) {
            console.error("Error generating text: ", error);
            throw String(error);
        }
    },
    async createFile(fileName: string, data: string) {
        try {
            const worker = await getNodeProcess();
            return await worker.createFile(fileName, data);
        } catch (error) {
            console.error("Error creating file: ", error);
            throw String(error);
        }
    },
    async analyzeWithGemini(request: UserInput) {
        try {
            const worker = await getNodeProcess();
            return await worker.analyzeWithGemini(request);
        } catch (error) {
            console.error("Error analyzing with Gemini: ", error);
            throw String(error);
        }
    },

    async analyzeWithGeminiStream(
        request: UserInput,
        callback: (text: string) => void,
    ) {
        try {
            const worker = await getNodeProcess();
            //  console.log("Sent request to node process for streaming");
            return await worker.analyzeWithGeminiStream(request, callback);
        } catch (error) {
            console.error("Error analyzing with Gemini Stream: ", error);
            throw String(error);
        }
    },

    async compressWebPDataUrl(dataUrl: string) {
        try {
            const worker = await getNodeProcess();
            return await worker.compressWebPDataUrl(dataUrl);
        } catch (error) {
            console.error("Error compressing WebP image: ", error);
            throw String(error);
        }
    },
};

export default node_api;
