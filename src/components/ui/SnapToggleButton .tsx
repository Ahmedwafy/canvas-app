// components/Toolbar.tsx (أو جوه CanvasEditor نفسه)

import { useCanvasStore } from "@/store/canvasStore";
import { Magnet } from "lucide-react";

export const SnapToggleButton = () => {
  const snapEnabled = useCanvasStore((state) => state.snapEnabled);
  const toggleSnap = useCanvasStore((state) => state.toggleSnap);

  return (
    <button
      onClick={toggleSnap}
      className={`flex gap-1 font-bold text-sm shadow p-1 bg-gray-200 text-[#4B5563] rounded hover:scale-105 hover:bg-gray-100 ${
        snapEnabled ? "bg-blue-600 text-white" : "bg-gray-200 text-[#4B5563]"
      }`}
    >
      {snapEnabled ? "Snap: On" : "Snap: Off"} <Magnet />
    </button>
  );
};
