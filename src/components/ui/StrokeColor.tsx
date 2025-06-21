import { useCanvasStore } from "@/store/canvasStore";
import { changeStrokeColor } from "@/utils/canvasUtils";

const StrokeColor = () => {
  const strokeColor = useCanvasStore.getState().strokeColor;
  const setStrokeColor = useCanvasStore.getState().setStrokeColor;
  const canvas = useCanvasStore.getState().getCanvas();

  const handleStrokeColorChange = (color: string) => {
    if (!canvas) return;
    setStrokeColor?.(color);
    changeStrokeColor(canvas, color);
  };

  return (
    <div>
      <span className="text-sm font-medium text-gray-700">Stroke</span>
      <div className="flex pt-2 pb-4 border-b-4 border-grey-800 gap-2">
        <input
          type="color"
          title="Change Stroke Color"
          onChange={(e) => {
            handleStrokeColorChange(e.target.value);
          }}
          className=" p-1 rounded-lg bg-white text-sm shadow "
          value={strokeColor}
        />
        <input
          type="text"
          className=" p-1 rounded-lg bg-white text-sm shadow "
          value={strokeColor}
          onChange={(e) => handleStrokeColorChange(e.target.value)}
        />
      </div>
    </div>
  );
};

export default StrokeColor;
