/// <reference types="node" />

import type { NodeBackendAPI } from "./../types/index.ts";
import { RPCChannel, NodeIo } from "kkrpc";
import fs from "fs/promises";
import path from "path";
//@ts-expect-error
import { parse } from "envfile";
import { projectRoot } from "./node-utils.ts";
import ai_api from "./node-ai-api.ts";
import sharp from "sharp";

console.log("Node worker started, waiting for RPC calls...");

const api: NodeBackendAPI = {
    analyzeImage: async (filePath: string) => {
        // Placeholder implementation
        return `Analysis of image at ${filePath}`;
    },
    generateText: async (prompt: string) => {
        // Placeholder implementation
        return `Generated text for prompt: ${prompt}`;
    },
    createFile: async (fileName: string, data: string) => {
        try {
            await fs.writeFile(path.join(projectRoot, fileName), data);

            return "File created successfully";
        } catch (error) {
            throw String(error);
        }
    },
    compressWebPDataUrl: async (dataUrl: string) => {
        try {
            // 1. Extract the Base64 part (removes "data:image/webp;base64,")
            const base64Data = dataUrl.replace(/^data:image\/webp;base64,/, "");

            // 2. Convert Base64 to Buffer
            const imgBuffer = Buffer.from(base64Data, "base64");

            // 3. Process with Sharp

            const compressedBuffer = await sharp(imgBuffer)
                .resize(1536, null, { withoutEnlargement: true }) // Reduce width to 800px
                .webp({ quality: 75 }) // Re-encode as WebP with lower quality
                .toBuffer();

            // 4. Convert back to Data URL (optional)
            const compressedDataUrl = `data:image/webp;base64,${compressedBuffer.toString("base64")}`;

            console.log("Image compressed");

            return compressedDataUrl as string; // Or return compressedBuffer for file saving
        } catch (error) {
            throw String(error);
        }
    },
    ...ai_api,
};

// enum Test {
//     hello = "ff",
// }

const io = new NodeIo(process.stdin, process.stdout);
new RPCChannel(io, { expose: api });
