import { ArrowUp, File, Loader2, Plus, ScreenShare, X } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import React, { Dispatch, SetStateAction, useState } from "react";
import ImagePreview from "./ImagePreview";
import node_api from "../api/node-api";
import { Message, SerializableFile } from "../types";

const FILE_SIZE_MULTIPLIER = 1024 * 1024; // Convert bytes to megabytes
const MAX_FILE_SIZE = 5 * FILE_SIZE_MULTIPLIER; // 5MB

export async function capture() {
    const html = document.querySelector("html")!;
    html.style.opacity = "0";
    const base64 = await invoke<string>("take_screenshot");
    html.style.opacity = "1";
    return `data:image/webp;base64,${base64}`;
}

const PromptInput = ({
    unFoldWindow,
    setMessages,
    isAIResponsePending,
    sendAiRequest,
}: {
    unFoldWindow: () => void;
    // messages: Message[];
    setMessages: Dispatch<SetStateAction<Message[]>>;
    isAIResponsePending: boolean;
    sendAiRequest: (
        prompt: string,
        images: string[],
        files: SerializableFile[],
    ) => void;
}) => {
    const [imgs, setImgs] = useState<string[]>([]);
    const [previewedImg, setPreviewedImg] = useState("");
    const [prompt, setPrompt] = useState("");
    const [files, setFiles] = useState<File[]>([]);
    // const filesInputRef = useRef<HTMLInputElement>(null);

    const handleScreenShot = async () => {
        const result = await capture();
        const img = await node_api.compressWebPDataUrl(result);

        console.log({
            original: result.length,
            compressed: img.length,
            diff: result.length - img.length,
        });

        setImgs((imgs) => (imgs.length ? [...imgs, img] : [img]));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFiles((files) => (files.length ? [...files, file] : [file]));

        // Reset the input value to allow uploading the same file again if needed
        e.target.value = "";
    };

    const deleteImg = (index: number) => {
        setImgs((imgs) => imgs.filter((_, i) => i !== index));
    };

    const deleteFile = (index: number) => {
        setFiles((files) => files.filter((_, i) => i !== index));
    };

    const previewImg = (img: string) => {
        unFoldWindow();
        setPreviewedImg(img);
    };

    const onSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        unFoldWindow();

        const userMessage: Message = {
            message: prompt,
            images: imgs,
            files: files,
            type: "user",
        };

        setMessages((msgs) =>
            msgs.length ? [...msgs, userMessage] : [userMessage],
        );

        //ERROR: The File object is being serialized to an empty object {} when sent from the frontend to the backend. This is because File objects cannot be directly serialized to JSON, which is likely how the data is being sent. To fix this, we need to convert the File objects into a format that can be serialized (like base64 strings) before sending them, and then reconstruct the File objects on the backend if necessary.

        const serializableFiles = await Promise.all(
            files.map(async (file) => {
                const arrayBuffer = await file.arrayBuffer();
                const base64Data = btoa(
                    new Uint8Array(arrayBuffer).reduce(
                        (data, byte) => data + String.fromCharCode(byte),
                        "",
                    ),
                );
                return {
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    data: base64Data,
                };
            }),
        );

        sendAiRequest(prompt, imgs, serializableFiles);
        // setPrompt("");
        // setImgs([]);
    };

    const getCurrentAttachmentsSize = () => {
        const imagesSize = imgs.reduce((total, img) => {
            // Calculate the size of the base64 string in bytes
            return total + Math.ceil((img.length * 3) / 4); // Base64 encoding increases size by ~33%
        }, 0);

        const filesSize = files.reduce((total, file) => {
            return total + file.size;
        }, 0);

        // const sizeMB = (imagesSize + filesSize) / FILE_SIZE_MULTIPLIER; // Convert to MB
        const originalSize = imagesSize + filesSize;
        let size = originalSize; // Size in bytes
        let unit = "b";

        if (size >= 1024 * 1024) {
            unit = "mb";
            size = size / FILE_SIZE_MULTIPLIER; // Convert to MB
        } else if (size >= 1024) {
            unit = "kb";
            size = size / 1024; // Convert to KB
        }

        // if (size >= 1) {
        //     unit = "mb";

        // } else if (size >= 0.001) {
        //     unit = "kb";

        // }

        return {
            size: size.toFixed(2),
            originalSize,
            unit,
        };
    };

    const attachmentsSize = getCurrentAttachmentsSize();

    return (
        <div className="bottom-0 w-full promptInput border-t border-third-color/30">
            <form
                onSubmit={onSubmit}
                className="px-3 py-3.5 w-full flex flex-col gap-3"
            >
                <p className="text-right text-sm text-third-color">
                    {attachmentsSize.size + attachmentsSize.unit} /
                    {MAX_FILE_SIZE / FILE_SIZE_MULTIPLIER}mb
                </p>
                {/* Attachments */}
                <>
                    {/* Images */}
                    {imgs.length ? (
                        <div className="flex gap-3 flex-wrap">
                            {imgs.map((img, i) => (
                                <div key={i} className="relative">
                                    <img
                                        onClick={() => previewImg(img)}
                                        src={img}
                                        alt="My image"
                                        className="size-15 object-cover cursor-pointer 
                  rounded-lg opacity-[0.8] border-2 border-third-color hover:opacity-100 transition-opacity"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => deleteImg(i)}
                                        className="absolute size-5 bg-fourth-color flex
                 items-center justify-center rounded-full top-0 right-0
                  translate-x-1/2 -translate-y-1/2"
                                    >
                                        <X className="size-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        ""
                    )}
                    {/* Files */}
                    {files.length ? (
                        <div className="flex flex-wrap gap-2">
                            {files.map((file, i) => (
                                <div
                                    key={i}
                                    className="flex  items-center gap-2 bg-third-color/30 rounded-lg p-2"
                                >
                                    <File className="size-5 stroke-third-color" />
                                    <span className="text-sm">{file.name}</span>
                                    <button
                                        type="button"
                                        onClick={() => deleteFile(i)}
                                        className="size-5 bg-fourth-color flex
                 items-center justify-center rounded-full"
                                    >
                                        <X className="size-4" />
                                    </button>
                                </div>
                            )) || ""}
                        </div>
                    ) : (
                        ""
                    )}
                </>
                {/* In */}
                <div className="w-full flex items-end gap-3 justify-center">
                    <button
                        type="button"
                        onClick={handleScreenShot}
                        className="size-10 min-w-10 items-center flex justify-center rounded-full bg-fourth-color"
                    >
                        <ScreenShare className="size-5" />
                    </button>
                    <button
                        type="button"
                        className="size-10 min-w-10 items-center flex justify-center 
                        rounded-full bg-third-color/10 overflow-hidden relative"
                    >
                        <Plus className="size-5" />
                        <input
                            onChange={handleFileUpload}
                            type="file"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                    </button>
                    {/* Input */}
                    {/* max-w-md */}
                    <div
                        onInput={(e) => {
                            setPrompt(e.currentTarget.textContent);
                        }}
                        data-placeholder={"Enter Prompt"}
                        data-empty={prompt}
                        contentEditable="true"
                        className="w-full outline-none overflow-hidden max-h-30 text-sm bg-third-color/10 rounded-3xl py-2.5 px-3 editable"
                    ></div>

                    {/* Send */}
                    <button
                        disabled={
                            isAIResponsePending || (!prompt && !imgs.length)
                        }
                        type="submit"
                        className={`size-10 min-w-10 items-center flex justify-center rounded-full bg-white ${
                            !prompt &&
                            !imgs.length &&
                            "cursor-not-allowed! opacity-50"
                        }`}
                    >
                        {isAIResponsePending ? (
                            <Loader2 className="animate-spin stroke-primary-color size-5 stroke-3" />
                        ) : (
                            <ArrowUp className="size-5 stroke-primary-color stroke-3" />
                        )}
                    </button>
                </div>
            </form>
            {previewedImg && (
                <ImagePreview
                    previewedImg={previewedImg}
                    setPreviewedImg={setPreviewedImg}
                />
            )}
        </div>
    );
};

export default PromptInput;
