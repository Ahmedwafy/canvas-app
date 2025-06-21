import { useCanvasStore } from "@/store/canvasStore";
import { exportDesign } from "@/utils/canvasUtils";
// import { Download } from "lucide-react";

const btnStyle2 =
  "bg-[#4B5563] md:h-32 lg:h-8 min-w-[99%] mx-auto rounded-lg flex items-center justify-center text-[#E5E7EB] shadow hover:scale-105 transition-transform duration-200 ease-out";

const DownloadMenu = () => {
  const canvas = useCanvasStore.getState().getCanvas();
  if (!canvas) return null;

  return (
    <div className="flex flex-col gap-2 mt-2">
      <button onClick={() => exportDesign(canvas, "png")} className={btnStyle2}>
        PNG
      </button>
      <button
        onClick={() => exportDesign(canvas, "jpeg")}
        className={btnStyle2}
      >
        JPEG
      </button>
      <button onClick={() => exportDesign(canvas, "pdf")} className={btnStyle2}>
        PDF
      </button>
      <button onClick={() => exportDesign(canvas, "svg")} className={btnStyle2}>
        SVG
      </button>
    </div>
  );
};

export default DownloadMenu;
