import { getCurrentWindow } from "@tauri-apps/api/window";
import { ChevronDown, Minus, X } from "lucide-react";

const Header = ({
    toggleFold,
    fold,
}: {
    toggleFold: () => void;
    fold: boolean;
}) => {
    const collapse = async () => {
        const window = getCurrentWindow();
        await window
            .minimize()
            .then(() => console.log("minimized"))
            .catch((e) => alert("Error minimizing window: " + e));
    };

    const close = async () => {
        const window = getCurrentWindow();
        await window
            .close()
            .then(() => console.log("minimized"))
            .catch((e) => alert("Error closing window: " + e));
    };

    return (
        <div className="header  mainHeader flex justify-between bg-primary-color w-full px-3">
            {/* <div>
        <Menu className="size-5" />
      </div> */}
            {/* <h1 className="py-2.5 text-fourth-color font-semibold">AI Assistant</h1> */}
            <img src="/logo.png" className="size-10 object-cover" />
            {/* Window states */}
            <div
                className="flex [&>button]:px-3 [&>button]:hover:bg-third-color/20
       [&>button]:transition-all [&>button]:duration-400"
            >
                <button onClick={collapse}>
                    <Minus className="size-4" />
                </button>
                <button onClick={close}>
                    <X className="size-4" />
                </button>
                <button onClick={toggleFold}>
                    <ChevronDown
                        className={`size-4 stroke-3 stroke-fourth-color ${fold && "rotate-180"}`}
                    />
                </button>
            </div>
        </div>
    );
};

export default Header;
