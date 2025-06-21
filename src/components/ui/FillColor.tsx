import { useCanvasStore } from "@/store/canvasStore";
import { changeFillColor } from "@/utils/canvasUtils";

const FillColor = () => {
  const fillColor = useCanvasStore.getState().fillColor;
  const setFillColor = useCanvasStore.getState().setFillColor;
  const canvas = useCanvasStore.getState().getCanvas();
  // const canvas = useCanvasStore((state) => state.canvas);

  const handleColorChange = (color: string) => {
    if (!canvas) return;
    setFillColor?.(color);
    changeFillColor(canvas, color);
  };
  return (
    <div>
      <span className="text-sm font-medium text-gray-700">Fill</span>
      <div className="flex pt-2 pb-4 border-b-4 border-grey-800 gap-2">
        <input
          type="color"
          title="Change Fill Color"
          onChange={(e) => handleColorChange(e.target.value)}
          className="p-1 rounded-lg bg-white text-sm shadow"
          value={fillColor}
        />
        <input
          type="text"
          className="p-1 rounded-lg bg-white text-sm shadow"
          value={fillColor}
          onChange={(e) => handleColorChange(e.target.value)}
        />
      </div>
    </div>
  );
};

export default FillColor;
