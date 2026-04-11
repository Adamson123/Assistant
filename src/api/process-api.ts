import {
    createChannel,
    getStatus,
    killAll,
    spawn,
    SpawnConfig,
} from "tauri-plugin-js-api";
import type { NodeBackendAPI } from "../types";

let allProcessesKilled = false;
window.addEventListener("load", () => {
    killAll()
        .then(() => {
            allProcessesKilled = true;
            console.log("Killed all processes on load");
        })
        .catch((error) => {
            console.error("Error killing processes on load: ", error);
            allProcessesKilled = true;
        });

    //To avoid hanging if killAll fails, we set a timeout to proceed anyway
    setTimeout(() => {
        if (!allProcessesKilled) {
            allProcessesKilled = true;
            console.warn(
                "Proceeding without confirming all processes were killed",
            );
        }
    }, 7000);
});

export const IsProcessRunning = async (processName: string) => {
    try {
        const nodeProcessRunning = await getStatus(processName);
        return nodeProcessRunning.running;
    } catch (error) {
        console.log("Process not running");
        return false;
    }
};

export async function createProcess(
    processName: string,
    spawnConfig: SpawnConfig,
) {
    while (!allProcessesKilled) {
        console.log("Waiting for processes to be killed...");
    }

    const nodeProcessRunning = await IsProcessRunning(processName);

    if (nodeProcessRunning) {
        console.log("Getting running process...");
        //await kill(WORKER_NAME);
        const { api } = await createChannel<
            Record<string, never>,
            NodeBackendAPI
        >(processName);
        return api;
    }

    console.log("Creating new process...");
    try {
        await spawn(processName, spawnConfig);

        const { api } = await createChannel<
            Record<string, never>,
            NodeBackendAPI
        >(processName);

        return api;
    } catch (error) {
        throw error;
    }
}
