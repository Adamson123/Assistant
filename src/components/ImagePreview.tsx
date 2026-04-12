const ImagePreview = ({
    previewedImg,
    setPreviewedImg,
}: {
    previewedImg: string;
    setPreviewedImg: React.Dispatch<React.SetStateAction<string>>;
}) => {
    const copyImage = async () => {
        // Step 1: load image
        const img = new Image();
        img.src = previewedImg;

        img.onload = async () => {
            // Step 2: draw to canvas
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;

            const ctx = canvas.getContext("2d")!;
            ctx.drawImage(img, 0, 0);

            // Step 3: convert to PNG blob
            canvas.toBlob(async (blob) => {
                await navigator.clipboard.write([
                    new ClipboardItem({
                        "image/png": blob as Blob,
                    }),
                ]);

                console.log("Copied as PNG 😏🔥");
            }, "image/png");
        };
        alert("Image copied");
    };

    const saveImage = () => {
        const a = document.createElement("a");
        a.href = previewedImg;
        a.download = "screenshot_" + crypto.randomUUID();
        a.click();
        alert(`image saved as ${a.download} in Downloads`);
    };

    return (
        <div
            className="rounded-[20px] fixed inset-0 bg-primary-color/80 flex 
    items-center justify-center flex-col gap-3"
        >
            <div className="flex gap-3">
                <button
                    onClick={copyImage}
                    className="py-2 px-4 rounded-md bg-third-color/50"
                >
                    Copy Image
                </button>
                <button
                    onClick={saveImage}
                    className="py-2 px-4 rounded-md bg-third-color/50"
                >
                    Save Image
                </button>
            </div>
            <img
                src={previewedImg}
                alt="Previewed Image"
                className="max-w-[90%] rounded-md"
            />
            <button
                onClick={() => setPreviewedImg("")}
                className="py-2 px-4 rounded-md bg-third-color/50"
            >
                Close
            </button>
        </div>
    );
};

export default ImagePreview;
