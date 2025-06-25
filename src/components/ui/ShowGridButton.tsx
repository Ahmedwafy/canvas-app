import { useCanvasStore } from "@/store/canvasStore";
import React from "react";

const ShowGridButton = () => {
  const gridEnabled = useCanvasStore((state) => state.gridEnabled);
  const toggleGrid = useCanvasStore((state) => state.toggleGrid);
  console.log("Grid is", gridEnabled ? "ON" : "OFF");

  return (
    <button
      onClick={toggleGrid}
      className={`flex gap-1 font-bold text-sm shadow p-1 bg-gray-200 text-[#4B5563] rounded hover:scale-105 hover:bg-gray-100 ${
        gridEnabled ? "bg-blue-600 text-white" : "bg-gray-200 text-[#4B5563]"
      }`}
    >
      {gridEnabled ? "Grid: ON" : "Grid: OFF"}
    </button>
  );
};

export default ShowGridButton;
