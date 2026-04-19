import { getProjectRoot } from "../utils/path-api";
import type { NodeBackendAPI, UserInput } from "../../types/index";
import { createProcess } from "./process-api";
import { join, resourceDir } from "@tauri-apps/api/path";
const PROCESS_NAME = "node-worker";
let nodeWorkerInstance: NodeBackendAPI | null = null;

export async function getNodeProcess(): Promise<NodeBackendAPI> {
    if (nodeWorkerInstance) {
        console.log("Node worker instance already exists, returning it.");
        return nodeWorkerInstance;
    }

    console.log("Node worker instance is null");

    const projectRoot = await getProjectRoot();
    const scriptPath_dev = await join(
        projectRoot,
        "node-backend/dist/node-worker.js", //"/src/node-backend/node-worker.ts",
    );
    const resourcePath = await resourceDir();
    // const scriptPath_build_t = await join(
    //     projectRoot,
    //     "src",
    //     "node-backend-dist",
    //     "node-worker.cjs",
    // );
    const scriptPath_build = await join(
        resourcePath,
        "_up_", // Tauri's wrapper folder for ../ resources
        //  "src", // The actual source folder,
        "node-backend",
        "node-worker.ts", //"node-worker.cjs",
    );
    const scriptPath = import.meta.env.DEV ? scriptPath_dev : scriptPath_build;

    //Turn env to record
    const envRecord = {
        ...Object.fromEntries(
            Object.entries(import.meta.env).filter(([key]) =>
                key.startsWith("VITE_"),
            ),
        ),
        PROJECT_ROOT: projectRoot, // Pass the path
    };

    nodeWorkerInstance = await createProcess(PROCESS_NAME, {
        runtime: "node",
        script: scriptPath, //"../src/node-backend/node-worker.ts",
        cwd: ".",
        env: envRecord, // Pass all environment variables to the worker process. We will read the .env file directly in the worker to ensure we get the correct variables, since there are issues with environment variables not being passed correctly when using tauri-plugin-js-api.
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
            throw error;
        }
    },
    async generateText(prompt: string) {
        try {
            const worker = await getNodeProcess();
            return await worker.generateText(prompt);
        } catch (error) {
            console.error("Error generating text: ", error);
            throw error;
        }
    },
    async createFile(fileName: string, data: string) {
        try {
            const worker = await getNodeProcess();
            return await worker.createFile(fileName, data);
        } catch (error) {
            console.error("Error creating file: ", error);
            throw error;
        }
    },
    async analyzeWithGemini(request: UserInput) {
        try {
            const worker = await getNodeProcess();
            return await worker.analyzeWithGemini(request);
        } catch (error) {
            console.error("Error analyzing with Gemini: ", error);
            throw error;
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
            throw error;
        }
    },

    async compressWebPDataUrl(dataUrl: string) {
        try {
            const worker = await getNodeProcess();
            return await worker.compressWebPDataUrl(dataUrl);
        } catch (error) {
            console.error("Error compressing WebP image: ", error);
            throw error;
        }
    },
};

export default node_api;
