"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useCanvasStore } from "@/store/canvasStore";
import { updateScale } from "./UpdateScale";

const canvasSizes = [
  { name: "Default", width: 1000, height: 700 },
  { name: "Auto (Screen Size)", width: "auto", height: "auto" },
  { name: "A4", width: 2480, height: 3508 },
  { name: "Instagram Post", width: 1080, height: 1080 },
  { name: "Instagram Story", width: 1080, height: 1920 },
  { name: "Facebook Cover", width: 820, height: 312 },
  { name: "YouTube Thumbnail", width: 1280, height: 720 },
  { name: "Twitter Post", width: 1024, height: 512 },
  { name: "Poster", width: 2550, height: 3300 },
];

const CanvasSizeSelector = () => {
  const canvas = useCanvasStore((state) => state.canvas);
  const scale = useCanvasStore((state) => state.scale);
  const setScale = useCanvasStore((state) => state.setScale);
  const zoomIn = useCanvasStore((state) => state.zoomIn);
  const zoomOut = useCanvasStore((state) => state.zoomOut);
  const resetScale = useCanvasStore((state) => state.resetScale);

  const handleSizeChange = (
    width: number | string | "auto",
    height: number | string | "auto"
  ) => {
    const canvas = useCanvasStore.getState().canvas;
    const setCustomSize = useCanvasStore.getState().setCustomSize;
    const setScale = useCanvasStore.getState().setScale;

    if (!canvas || !canvas.lowerCanvasEl) {
      console.warn("Canvas DOM is not ready yet.");
      return;
    }

    let newWidth = width;
    let newHeight = height;

    // 🖥️ لو Auto، احسب الأبعاد حسب الشاشة
    if (width === "auto" || height === "auto") {
      newWidth = window.innerWidth - 100;
      newHeight = window.innerHeight - 200;
    }

    // ✅ استخدم الطريقة الحديثة لتعديل الأبعاد
    canvas.setDimensions({
      width: newWidth as number,
      height: newHeight as number,
    });

    // ✅ خزّن الأبعاد الجديدة في Zustand
    setCustomSize(newWidth as number, newHeight as number);

    requestAnimationFrame(() => {
      updateScale();
    });

    // 📏 هل نعمل Fit to screen؟
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    const shouldFitToScreen =
      (newWidth as number) > screenW * 0.9 ||
      (newHeight as number) > screenH * 0.9;

    if (shouldFitToScreen) {
      updateScale(); // 📐 Fit to screen
    } else {
      setScale(1); // 🟢 رجّعه لحجمه الطبيعي
    }

    // 🔁 تحديث عرض الكانفاس
    canvas.renderAll();
    canvas.requestRenderAll();
  };

  return (
    <div className="flex gap-3 items-center flex-wrap mx-auto bg-gray-300 p-1 rounded-lg">
      {/* ===== Canvas Size Dropdown ===== */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="shadow hover:scale-105 hover:bg-gray-100 transition-transform duration-200 ease-out"
          >
            Canvas Size
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          {canvasSizes.map((size) => (
            <DropdownMenuItem
              key={size.name}
              onClick={() => handleSizeChange(size.width, size.height)}
              disabled={!canvas}
            >
              {size.name === "Default"
                ? "🟦 Default (1000x700)"
                : size.name === "Auto (Screen Size)"
                ? "🖥️ Auto (Fit Screen)"
                : `${size.name} - ${size.width}×${size.height}`}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* ===== Zoom Controls ===== */}
      <Button onClick={zoomOut}>➖</Button>
      <span>{(scale * 100).toFixed(0)}%</span>
      <Button onClick={zoomIn}>➕</Button>
      <Button onClick={() => setScale(1)}>100%</Button>
      <Button onClick={updateScale}>📐 Fit</Button>
      <Button onClick={resetScale} title="Reset Zoom">
        🔁 Reset
      </Button>
      {/* <div className="flex items-center gap-2">
        <Button onClick={zoomOut} title="Zoom Out">
          ➖
        </Button>
        <span className="w-12 text-center">{(scale * 100).toFixed(0)}%</span>
        <Button onClick={zoomIn} title="Zoom In">
          ➕
        </Button>
        <Button onClick={resetScale} title="Reset Zoom">
          🔁
        </Button>
        <Button onClick={updateScale} title="Fit to Screen">
          📐 Fit
        </Button>
        <Button onClick={() => setScale(1)} title="Actual Size">
          100%
        </Button>
      </div> */}
    </div>
  );
};

export default CanvasSizeSelector;
