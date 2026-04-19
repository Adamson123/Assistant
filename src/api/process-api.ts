import {
    createChannel,
    getStatus,
    killAll,
    spawn,
    SpawnConfig,
    onStderr,
    //  onStdout,
} from "tauri-plugin-js-api";
import type { NodeBackendAPI } from "../../types";
//import { sleep } from "../utils";

let allProcessesKilled = false;
let killProcessePromise: Promise<void> | null = null;

window.addEventListener("load", () => {
    killProcessePromise = killAll()
        .then(() => {
            // await sleep(5000);
            allProcessesKilled = true;
            console.log("Killed all processes on load");
        })
        .catch((error) => {
            console.error("Error killing processes on load: ", error);
            allProcessesKilled = true;
        });
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
    if (!allProcessesKilled && killProcessePromise) {
        // await sleep(5000);
        console.log("Waiting for active processes to be killed...");
        await killProcessePromise;
    }

    const nodeProcessRunning = await IsProcessRunning(processName);

    if (nodeProcessRunning) {
        console.log("Getting active process...");
        //await kill(WORKER_NAME);
        const { api } = await createChannel<
            Record<string, never>,
            NodeBackendAPI
        >(processName);
        return api;
    }

    console.log("Creating new process...");
    try {
        // onStdout(processName, (data) => {
        //     console.log("Process output: ", data);
        // });

        onStderr(processName, (data) => {
            console.log("Process error: ", data);
        });

        await spawn(processName, spawnConfig);

        const { api } = await createChannel<
            Record<string, never>,
            NodeBackendAPI
        >(processName);
        console.log("Process created");

        return api;
    } catch (error) {
        throw error;
    }
}
