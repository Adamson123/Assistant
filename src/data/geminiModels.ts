const beforeNow = new Date();
beforeNow.setHours(beforeNow.getHours() - 1);

const GEMINI_KEYS = [
    import.meta.env.VITE_GEMINI_API_KEY,
    import.meta.env.VITE_GEMINI_API_KEY_2,
];

export const GEMINI_MODELS: { [modelName: string]: string } = {
    Gemini2_5Flash: "gemini-2.5-flash",
    Gemini2_5FlashLite: "gemini-2.5-flash-lite",
    Gemini2_5Pro: "gemini-2.5-pro",
    Gemini3FlashPreview: "gemini-3-flash-preview",
    Gemini3_1FlashLitePreview: "gemini-3.1-flash-lite-preview",
    WRONG_MODEL: "wrong-model",
};

// export const gemini_models = {
//     Gemini2_5_flash: {
//         name: "Gemini 2.5 flash",
//         apiKeys: GEMINI_KEYS,
//         delayDuration: beforeNow,
//     },
//     Gemini2_5_pro: {
//         name: "Gemini 2.5 pro",
//         apiKeys: GEMINI_KEYS,
//         delayDuration: beforeNow,
//     },
//     Gemini2_5: {
//         name: "Gemini 2.5",
//         apiKeys: GEMINI_KEYS,
//         delayDuration: oneHourBack,
//     },
// };

const gemini_models = Object.keys(GEMINI_MODELS).map((key, _) => ({
    name: GEMINI_MODELS[key],
    apiKeys: GEMINI_KEYS,
    delayDuration: beforeNow,
}));

export default gemini_models;
