"use client";
import { useCanvasStore } from "@/store/canvasStore";
import { zoomIn, zoomOut } from "@/utils/canvasUtils";
import { ZoomIn, ZoomOut } from "lucide-react";

const ZoomControls = () => {
  const canvas = useCanvasStore((state) => state.canvas);

  return (
    <div className="flex gap-2 text-[#4B5563]">
      <button
        onClick={() => zoomIn(canvas!)}
        className="bg-gray-200 px-2 py-1 rounded rounded-lg"
      >
        <ZoomIn />
      </button>
      <button
        onClick={() => zoomOut(canvas!)}
        className="bg-gray-200 px-2 py-1 rounded rounded-lg"
      >
        <ZoomOut />
      </button>
    </div>
  );
};

export default ZoomControls;
