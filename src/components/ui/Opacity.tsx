import { useCanvasStore } from "@/store/canvasStore";
import { changeOpacity } from "@/utils/canvasUtils";
import React from "react";

const Opacity = () => {
  const opacity = useCanvasStore((state) => state.opacity);
  const setOpacity = useCanvasStore((state) => state.setOpacity);
  const canvas = useCanvasStore((state) => state.canvas);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newOpacity = parseFloat(e.target.value);
    setOpacity(newOpacity); // خزنه في Zustand
    if (canvas) {
      changeOpacity(canvas, newOpacity); // طبّقه على العنصر المحدد
    }
  };

  return (
    <div>
      <label
        htmlFor="opacity"
        className="flex text-sm font-medium gap-1 text-gray-700"
      >
        <span>Opacity:</span>
        <span>{Math.round(opacity * 100)}%</span>
      </label>
      <input
        id="opacity"
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={opacity}
        onChange={handleChange}
        // className="border py-1 px-0 rounded-md bg-white text-sm"
        className="w-full"
      />
    </div>
  );
};

export default Opacity;
