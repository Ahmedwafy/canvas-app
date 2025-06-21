"use client";
import { useCanvasStore } from "@/store/canvasStore";

const Dimentions = () => {
  const { dimensions, setDimensions, getCanvas } = useCanvasStore();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDimensions({ ...dimensions, [name]: value });

    const canvas = getCanvas(); // Get Canvas from Store
    const active = canvas?.getActiveObject();

    if (active && !isNaN(Number(value))) {
      if (name === "width") {
        active.set({
          scaleX: Number(value) / (active.width ?? 1),
        });
      } else if (name === "height") {
        active.set({
          scaleY: Number(value) / (active.height ?? 1),
        });
      }
      active.setCoords();
      canvas?.requestRenderAll();
    }
  };

  return (
    <div className="flex flex-col gap-2 mt-2 border-b-4 border-grey-800 py-3">
      {/* Width & Height */}
      <label className="flex gap-1 justify-around">
        <p className="text-sm font-medium text-gray-700">Width :</p>
        <input
          type="text"
          name="width"
          value={dimensions.width}
          onChange={handleInputChange}
          className="rounded-lg p-1 w-2/3 shadow"
        />
      </label>

      <label className="flex gap-1 justify-around">
        <p className="text-sm font-medium text-gray-700">Height :</p>
        <input
          type="text"
          name="height"
          value={dimensions.height}
          onChange={handleInputChange}
          className="rounded-lg p-1 w-2/3 shadow"
        />
      </label>
    </div>
  );
};

export default Dimentions;
