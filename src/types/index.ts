export interface Env {
    VITE_GEMINI_API_KEY: string;
    VITE_MISTRA_API_KEY: string;
    VITE_GROQ_API_KEY: string;
}

export interface Message {
    message: string;
    type: "user" | "model";
    images?: string[];
}

export interface GeminiContent {
    role: string;
    parts: [{ text: string }];
}

export interface UserInput {
    prompt: string;
    screenshots: string[];
    history: GeminiContent[];
}

export interface AIResponse {
    text: string;
    error?: string;
}

export interface NodeBackendAPI {
    analyzeImage(filePath: string): Promise<string>;
    generateText(prompt: string): Promise<string>;
    createFile(fileName: string, data: string): Promise<string>;
    analyzeWithGemini(request: UserInput): Promise<string>;
    analyzeWithGeminiStream(
        request: UserInput,
        callback: (text: string) => void,
    ): Promise<string>;
}
