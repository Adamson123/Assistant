const beforeNow = new Date();
beforeNow.setHours(beforeNow.getHours() - 1);

interface ApiKey {
    key: string;
    delayDuration: Date;
}

const GEMINI_KEYS: ApiKey[] = [
    import.meta.env.VITE_GEMINI_API_KEY,
    import.meta.env.VITE_GEMINI_API_KEY_2,
].map((key) => ({ key, delayDuration: beforeNow }));

export const GEMINI_MODELS: { [modelName: string]: string } = {
    Gemini2_5Flash: "gemini-2.5-flash",
    Gemini2_5FlashLite: "gemini-2.5-flash-lite",
    Gemini2_5Pro: "gemini-2.5-pro",
    Gemini3FlashPreview: "gemini-3-flash-preview",
    Gemini3_1FlashLitePreview: "gemini-3.1-flash-lite-preview",
    WRONG_MODEL: "wrong-model",
};

const gemini_models = Object.keys(GEMINI_MODELS).map((key, _) => ({
    name: GEMINI_MODELS[key],
    apiKeys: GEMINI_KEYS,
}));

export class GeminiKeysManager {
    static models = gemini_models;
    static currentModelIndex = 0;
    static currentModel = gemini_models[0];
    static currentApiKey = GeminiKeysManager.currentModel.apiKeys[0];
    //in minutes
    static codesAndDelays: { [code: string]: number } = {
        "429": 5,
        "500": 3,
    };

    static randomizeApiKey() {
        let nonDelayedKeys = GeminiKeysManager.currentModel.apiKeys.filter(
            (keyObj) => !GeminiKeysManager.isKeyDelayed(keyObj),
        );

        if (nonDelayedKeys.length === 0) {
            console.log(
                "All keys for current model are delayed, searching for another model with non-delayed keys...",
            );
            const modelWithNonDelayedKey =
                GeminiKeysManager.findModelWithNotDelayedKey();

            if (modelWithNonDelayedKey) {
                GeminiKeysManager.currentModel = modelWithNonDelayedKey;
                nonDelayedKeys = modelWithNonDelayedKey.apiKeys.filter(
                    (keyObj) => !GeminiKeysManager.isKeyDelayed(keyObj),
                );
            } else {
                console.log(
                    "All keys in models are delayed, setting model with the smallest delay...",
                );
                GeminiKeysManager.setModelWithTheMostSmallestDelay();
                return;
            }
        }

        const randomIndex = Math.floor(
            Math.random() * GeminiKeysManager.currentModel.apiKeys.length,
        );
        GeminiKeysManager.currentApiKey =
            GeminiKeysManager.currentModel.apiKeys[randomIndex];
    }

    static delayKey(code: number) {
        const currentKeyObj = GeminiKeysManager.currentModel.apiKeys.find(
            (keyObj) => keyObj.key === GeminiKeysManager.currentApiKey.key,
        );
        const delayDuration = GeminiKeysManager.codesAndDelays[code.toString()];

        if (currentKeyObj && delayDuration) {
            const now = new Date();
            currentKeyObj.delayDuration.setMinutes(
                now.getMinutes() + delayDuration,
            );
        }
        console.log(
            "Delayed current key in model: ",
            GeminiKeysManager.currentModel.name,
        );

        return delayDuration;
    }

    static isKeyDelayed(apiKey: ApiKey) {
        const now = new Date();
        return apiKey.delayDuration > now;
    }

    static findModelWithNotDelayedKey() {
        //Start searching from the next model to ensure we cycle through all models before repeating any model
        for (let i = 1; i <= gemini_models.length; i++) {
            const modelIndex =
                (GeminiKeysManager.currentModelIndex + i) %
                gemini_models.length;
            const model = gemini_models[modelIndex];
            const hasNonDelayedKey = model.apiKeys.some(
                (keyObj) => !GeminiKeysManager.isKeyDelayed(keyObj),
            );
            if (hasNonDelayedKey) {
                GeminiKeysManager.currentModelIndex = modelIndex;
                return model;
            }
        }
        return null;
    }

    static setModelWithTheMostSmallestDelay() {
        let modelWithSmallestDelay: (typeof gemini_models)[0] | null = null;
        let apiKeyWithSmallestDelay: ApiKey | null = null;
        let smallestDelay = Infinity;
        const now = new Date();

        for (const model of gemini_models) {
            for (const keyObj of model.apiKeys) {
                const delay = keyObj.delayDuration.getTime() - now.getTime();
                if (delay < smallestDelay) {
                    smallestDelay = delay;
                    modelWithSmallestDelay = model;
                    apiKeyWithSmallestDelay = keyObj;
                }
            }
        }
        if (modelWithSmallestDelay && apiKeyWithSmallestDelay) {
            GeminiKeysManager.currentModel = modelWithSmallestDelay;
            GeminiKeysManager.currentApiKey = apiKeyWithSmallestDelay;
        }
    }
}

export default gemini_models;
