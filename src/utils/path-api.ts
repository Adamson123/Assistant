import { desktopDir } from "@tauri-apps/api/path";
import { join } from "@tauri-apps/api/path";

export const getProjectRoot = async () => {
    const deskDir = await desktopDir();
    const rootPath = await join(deskDir, "Assistant");
    return rootPath;
};
