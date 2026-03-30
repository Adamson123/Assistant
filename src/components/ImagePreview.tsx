const ImagePreview = ({
  previewedImg,
  setPreviewedImg,
}: {
  previewedImg: string;
  setPreviewedImg: React.Dispatch<React.SetStateAction<string>>;
}) => {
  return (
    <div
      className="rounded-[20px] fixed inset-0 bg-primary-color/80 flex 
    items-center justify-center flex-col gap-3"
    >
      <button
        onClick={() => setPreviewedImg("")}
        className="py-2 px-4 rounded-md bg-third-color/50"
      >
        Close
      </button>
      <img
        src={previewedImg}
        alt="Previewed Image"
        className="max-w-[90%] rounded-md"
      />
    </div>
  );
};

export default ImagePreview;
