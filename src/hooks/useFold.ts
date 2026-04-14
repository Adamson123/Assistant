import { getCurrentWindow, LogicalSize } from "@tauri-apps/api/window";
import { useEffect, useState } from "react";

export default function useFold() {
    const [fold, setFold] = useState(false);

    const foldWindow = async () => {
        // if (fold) return;
        const window = getCurrentWindow();
        const size = await window.innerSize();

        const headerHeight = (
            document.querySelector(".mainHeader") as HTMLDivElement
        ).getBoundingClientRect().height;
        const inputHeight = (
            document.querySelector(".promptInput") as HTMLDivElement
        ).getBoundingClientRect().height;

        const height = headerHeight + inputHeight;

        // console.log({ height, inputHeight }, "FOLDED");

        await window.setSize(new LogicalSize(size.width, height || 300));
        setFold(true);
    };

    const unFoldWindow = async () => {
        setFold(false);
        const window = getCurrentWindow();
        const size = await window.innerSize();
        await window.setSize(new LogicalSize(size.width, size.width - 100));
    };

    const toggleFold = async () => {
        if (!fold) {
            // console.log("Resizing");
            await foldWindow();
        } else {
            await unFoldWindow();
        }
    };

    useEffect(() => {
        const observer = new ResizeObserver((_) => {
            // const entry = entries[0];
            // const height = entry.contentRect.height;
            if (fold) foldWindow();
            // console.log("Input Height ooo:", height);
        });

        const promptInput = document.querySelector(
            ".promptInput",
        ) as HTMLDivElement;
        observer.observe(promptInput);

        return () => observer.disconnect();
    }, [fold]);

    return { fold, toggleFold, unFoldWindow };
}
