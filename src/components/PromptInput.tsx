import { ArrowUp, Plus, ScreenShare, X } from "lucide-react";

// const PromptInput = () => {
//   return (
//     <div className="fixed bottom-0 p-5 w-full">
//       <div
//         className="border-third-color border
//        rounded-2xl bg-secondary-color w-full p-5 flex flex-col"
//       >
//         <textarea
//           style={{
//             scrollbarWidth: "none",
//           }}
//           placeholder="Enter prompt"
//           className="w-full resize-none outline-none min-h-10 max-h-40"
//         />
//         <div className="flex gap-6 self-end">
//           <PlusCircleIcon />
//           <ScreenShare />
//         </div>
//       </div>
//     </div>
//   );
// };

import { invoke } from "@tauri-apps/api/core";
import { useState } from "react";
import ImagePreview from "./ImagePreview";

export async function capture() {
  const html = document.querySelector("html")!;
  html.style.opacity = "0";
  const base64 = await invoke<string>("take_screenshot");
  html.style.opacity = "1";
  return `data:image/png;base64,${base64}`;
}

const PromptInput = ({
  unFoldWindow,
  foldWindow,
  fold,
}: {
  unFoldWindow: () => void;
  foldWindow: () => void;
  fold: boolean;
}) => {
  const [imgs, setImgs] = useState<string[]>([]);
  const [previewedImg, setPreviewedImg] = useState("");

  const handleScreenShot = async () => {
    const result = await capture();
    console.log({ result });
    setImgs((imgs) => (imgs.length ? [...imgs, result] : [result]));
    //if (fold) foldWindow();
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

  return (
    <div className="bottom-0 w-full promptInput border-t border-third-color/30">
      <form className="px-3 py-3.5 w-full flex flex-col gap-3">
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
          <button className="size-10 min-w-10 items-center flex justify-center rounded-full bg-third-color/10">
            <Plus className="size-5" />
          </button>
          {/* Input */}
          {/* max-w-md */}
          <div
            data-placeholder="Enter Prompt"
            contentEditable="true"
            className="w-full outline-none overflow-hidden max-h-25 text-sm bg-third-color/10 rounded-3xl py-2.5 px-3 editable"
          ></div>

          {/* Send */}
          <button className="size-10 min-w-10 items-center flex justify-center rounded-full bg-white">
            <ArrowUp className="size-5 stroke-primary-color stroke-3" />
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
