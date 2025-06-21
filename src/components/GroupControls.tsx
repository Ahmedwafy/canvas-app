// components/GroupControls.tsx
"use client";

import { useEffect } from "react";
import {
  groupSelectedObjects,
  ungroupSelectedObject,
} from "@/utils/canvasUtils";
import { useCanvasStore } from "@/store/canvasStore";
import { Group, Ungroup } from "lucide-react";

const GroupControls = () => {
  const canvas = useCanvasStore((state) => state.canvas);

  const handleGroup = () => {
    if (canvas) groupSelectedObjects(canvas);
  };

  const handleUngroup = () => {
    if (canvas) ungroupSelectedObject(canvas);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!canvas) return;

      if (e.ctrlKey && e.code === "KeyG") {
        e.preventDefault();
        if (e.shiftKey) {
          handleUngroup(); // Ctrl + Shift + G
        } else {
          handleGroup(); // Ctrl + G
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canvas]);

  return (
    <div className="flex gap-2 ">
      <button
        onClick={handleGroup}
        className="flex gap-1 shadow p-1 bg-gray-200 text-[#4B5563] rounded hover:scale-105 hover:bg-gray-100"
      >
        <span className="text-sm align-middle my-auto font-bold">Group</span>
        <Group />
      </button>
      <button
        onClick={handleUngroup}
        className="flex gap-1 p-1 shadow bg-gray-200 text-[#4B5563] rounded hover:scale-105 hover:bg-gray-100"
      >
        <span className="text-sm align-middle my-auto font-bold">Ungroup</span>
        <Ungroup />
      </button>
    </div>
  );
};

export default GroupControls;
