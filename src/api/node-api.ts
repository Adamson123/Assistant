import type { NodeBackendAPI } from "../node-backend/node-shared-api";
import { createProcess } from "./process-api";

const PROCESS_NAME = "node-worker";
let nodeWorkerInstance: NodeBackendAPI | null = null;

export async function getNodeProcess() {
    if (nodeWorkerInstance) {
        return nodeWorkerInstance;
    }

    nodeWorkerInstance = await createProcess(PROCESS_NAME, {
        runtime: "node",
        script: "../src/node-backend/node-worker.ts",
        cwd: ".",
    });

    return nodeWorkerInstance;
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
    async analyzeWithGemini(request: string) {
        try {
            const worker = await getNodeProcess();
            return await worker.analyzeWithGemini(request);
        } catch (error) {
            console.error("Error analyzing with Gemini: ", error);
            throw String(error);
        }
    },
};

export default node_api;
