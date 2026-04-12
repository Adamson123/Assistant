import { ArrowUp, Loader2, Plus, ScreenShare, X } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import React, { Dispatch, SetStateAction, useState } from "react";
import ImagePreview from "./ImagePreview";
import node_api from "../api/node-api";
import { Message } from "../types";

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
    sendAiRequest: (prompt: string, images: string[]) => void;
}) => {
    const [imgs, setImgs] = useState<string[]>([]);
    const [previewedImg, setPreviewedImg] = useState("");
    const [prompt, setPrompt] = useState("");

    const handleScreenShot = async () => {
        const result = await capture();
        //  const img = await reduceImgSize(result);
        const img = await node_api.compressWebPDataUrl(result);
        console.log({
            original: result.length,
            compressed: img.length,
            diff: result.length - img.length,
        });

        setImgs((imgs) => (imgs.length ? [...imgs, img] : [img]));
    };

    const deleteImg = (index: number) => {
        console.log({ index });
        setImgs((imgs) => imgs.filter((_, i) => i !== index));
        // if (fold) foldWindow();
    };

    const previewImg = (img: string) => {
        unFoldWindow();
        setPreviewedImg(img);
    };

    const onSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();

        const userMessage: Message = {
            message: prompt,
            images: imgs,
            type: "user",
        };

        setMessages((msgs) =>
            msgs.length ? [...msgs, userMessage] : [userMessage],
        );

        sendAiRequest(prompt, imgs);
        // setPrompt("");
        // setImgs([]);
    };

    return (
        <div className="bottom-0 w-full promptInput border-t border-third-color/30">
            <form
                onSubmit={onSubmit}
                className="px-3 py-3.5 w-full flex flex-col gap-3"
            >
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
                  rounded-lg opacity-[0.8] border-2"
                                />
                                <button
                                    type="button"
                                    onClick={() => deleteImg(i)}
                                    className="absolute size-5 bg-red-500 flex
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
                        className="size-10 min-w-10 items-center flex justify-center rounded-full bg-third-color/10"
                    >
                        <Plus className="size-5" />
                    </button>
                    {/* Input */}
                    {/* max-w-md */}
                    <div
                        onInput={(e) => setPrompt(e.currentTarget.textContent)}
                        data-placeholder="Enter Prompt"
                        contentEditable="true"
                        className="w-full outline-none overflow-hidden max-h-30 text-sm bg-third-color/10 rounded-3xl py-2.5 px-3 editable"
                    ></div>

                    {/* Send */}
                    <button
                        disabled={isAIResponsePending}
                        type="submit"
                        className="size-10 min-w-10 items-center flex justify-center rounded-full bg-white"
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
