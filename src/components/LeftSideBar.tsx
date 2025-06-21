"use client";
import { useCanvasStore } from "@/store/canvasStore";
import { Layer } from "@/types/canvas.types";
import {
  getObjectById,
  toggleLock,
  toggleVisibility,
  updateLayers,
} from "@/utils/canvasUtils";
import { Eye, EyeOff, Lock, Unlock } from "lucide-react";
import { useState } from "react";
import { FiLayers } from "react-icons/fi";

export const LeftSidebar = () => {
  const canvas = useCanvasStore((state) => state.canvas);
  const layers = useCanvasStore((state) => state.layers);
  const selectedLayerId = useCanvasStore((state) => state.selectedLayerId);
  const setSelectedLayerId = useCanvasStore(
    (state) => state.setSelectedLayerId
  );
  const [list, setList] = useState(false);

  const handleClick = (layer: Layer) => {
    if (!canvas) return;
    setSelectedLayerId?.(layer.id ?? null);

    // Get the real object from the canvas by id
    // This is important because the objects in the canvas may differ from those in the layers
    if (!layer.id) return;
    const realObject = getObjectById(canvas, layer.id);

    // or if will not use const getObjectById :
    // const realObject = canvas.getObjects().find((obj) => obj.id === layer.id);
    if (!realObject) return;

    canvas.discardActiveObject();
    canvas.setActiveObject(realObject);
    canvas.requestRenderAll();
  };

  return (
    <div
      className={`${list ? "h-auto" : "h-10"}
        flex flex-col absolute text-[#4B5563] w-[250px] shadow w-30 px-2 py-2 bg-gray-300 rounded-lg mt-2 z-50 overflow-y-auto max-sm:hidden`}
    >
      <div
        className="flex justify-center space-around gap-3 cursor-pointer"
        onClick={() => setList(!list)}
      >
        <FiLayers size={22} className="my-auto" />
        <button className="rounded font-bold ">Layers</button>
      </div>

      {layers.map((layer: Layer) => {
        const object =
          canvas && layer.id ? getObjectById(canvas, layer.id) : null;

        return (
          <div
            key={layer.id}
            className={`p-1 mb-1 rounded ${
              selectedLayerId === layer.id ? "bg-blue-300 font-bold" : ""
            }`}
          >
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => handleClick(layer)}
            >
              <span className="truncate">{layer.name}</span>
              <div className="flex gap-1 ml-2">
                {/* Show/Hide */}
                {object && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleVisibility(object, canvas!);
                    }}
                    title="Show / Hide"
                  >
                    {object.visible ? (
                      <Eye className="w-4 h-4 text-gray-700" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                )}

                {/* Lock/Unlock */}
                {object && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // يمنع التحديد الغير مقصود عند الضغط على الزر
                      toggleLock(object, canvas!); // نفذ الدالة
                      updateLayers(canvas!); // حدّث اللستة في الـ sidebar
                    }}
                    title="Lock / Unlock"
                  >
                    {object.selectable ? (
                      <Unlock className="w-4 h-4 text-gray-700" />
                    ) : (
                      <Lock className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
