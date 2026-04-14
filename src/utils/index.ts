export const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

export const extractError = (err: any) => {
    try {
        const raw = err?.message;

        // Try parsing directly
        const parsed = JSON.parse(raw);

        return parsed?.error?.message || raw;
    } catch {
        return err?.message || "Something went wrong";
    }
};
