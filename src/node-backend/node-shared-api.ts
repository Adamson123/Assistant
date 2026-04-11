export interface NodeBackendAPI {
    analyzeImage(filePath: string): Promise<string>;
    generateText(prompt: string): Promise<string>;
    createFile(fileName: string, data: string): Promise<string>;
    analyzeWithGemini(request: string): Promise<string>;
    // transcribeAudio(filePath: string): Promise<string>;
}
