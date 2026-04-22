export interface Env {
    VITE_GEMINI_API_KEY: string;
    VITE_GEMINI_API_KEY_2: string;
    //  VITE_GEMINI_API_KEY_3: string;
    VITE_MISTRA_API_KEY: string;
    VITE_GROQ_API_KEY: string;
}

export interface Message {
    message: string;
    type: "user" | "model";
    images?: string[];
    files?: File[];
}

export interface GeminiContent {
    role: string;
    parts: [{ text: string }];
}

export interface SerializableFile {
    name: string;
    type: string;
    size: number;
    data: string; // base64 encoded file data
}

export interface UserInput {
    prompt: string;
    screenshots: string[];
    files: SerializableFile[];
    history: GeminiContent[];
}

export interface ApiKey {
    key: string;
    delayDuration: Date;
}

export interface Model {
    name: string;
    apiKeys: ApiKey[];
}

export interface AIResponse {
    text: string;
    error?: string;
}

export interface NodeBackendAPI {
    getAvailableModels(): Promise<{ models: string[]; currentModel: string }>;
    compressWebPDataUrl(dataUrl: string): Promise<string>;
    analyzeWithGemini(request: UserInput): Promise<string>;
    analyzeWithGeminiStream(
        request: UserInput,
        model: string,
        callback: (text: string) => void,
    ): Promise<string>;
}
