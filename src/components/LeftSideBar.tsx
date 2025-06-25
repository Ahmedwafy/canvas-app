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
  const renameLayer = useCanvasStore((state) => state.renameLayer);
  const selectedLayerId = useCanvasStore((state) => state.selectedLayerId);
  const setSelectedLayerId = useCanvasStore(
    (state) => state.setSelectedLayerId
  );
  const [list, setList] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");

  const handleClick = (layer: Layer) => {
    if (!canvas) return;
    setSelectedLayerId?.(layer.id ?? null);

    if (!layer.id) return;
    const realObject = getObjectById(canvas, layer.id);
    if (!realObject) return;

    canvas.discardActiveObject();
    canvas.setActiveObject(realObject);
    canvas.requestRenderAll();
  };

  return (
    <div
      className={`${
        list ? "h-auto" : "h-10"
      } flex flex-col absolute text-[#4B5563] w-[250px] shadow px-2 py-2 bg-gray-300 rounded-lg mt-2 z-50 overflow-y-auto max-sm:hidden`}
    >
      <div
        className="flex justify-center gap-3 cursor-pointer"
        onClick={() => setList(!list)}
      >
        <FiLayers size={22} className="my-auto" />
        <button className="rounded font-bold">Layers</button>
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
            <div className="flex justify-between items-center cursor-pointer">
              {editingId === layer.id ? (
                <input
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onBlur={() => {
                    renameLayer(layer.id!, newName.trim() || layer.name);
                    setEditingId(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      renameLayer(layer.id!, newName.trim() || layer.name);
                      setEditingId(null);
                    } else if (e.key === "Escape") {
                      setEditingId(null);
                    }
                  }}
                  className="w-full rounded px-1 py-0.5 text-sm bg-white text-black"
                />
              ) : (
                <span
                  onClick={() => {
                    setEditingId(layer.id!);
                    setNewName(layer.name);
                  }}
                  onDoubleClick={() => handleClick(layer)}
                  className="truncate w-full hover:underline"
                >
                  {layer.name}
                </span>
              )}

              <div className="flex gap-1 ml-2">
                {object && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // prevent event to go to parent div
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

                {object && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLock(object, canvas!);
                      updateLayers(canvas!);
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
