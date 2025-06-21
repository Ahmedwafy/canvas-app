"use client";
import { useCanvasStore } from "@/store/canvasStore";
import { ToolbarProps } from "@/types/canvas.types";
import Text from "@/components/Text";
import {
  Square,
  Circle,
  Triangle,
  Brush,
  MousePointer2,
  Type,
  Slash,
  Undo,
  Redo,
  Star,
  AlignHorizontalJustifyCenter,
  BrushCleaning,
} from "lucide-react";
import { useState } from "react";
import { FabricText } from "fabric";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Alignment from "./Alignment";
import { addEmptyShape, updateLayers } from "@/utils/canvasUtils";
import GroupControls from "./GroupControls";

export default function Toolbar({
  brushWidth,
  onEnableFreeDrawing,
  onAddRect,
  onAddCircle,
  onAddText,
  onAddTriangle,
  onAddLine,
  onAddStar,
  onDisableFreeDrawing,
}: ToolbarProps) {
  const [textTools, setTextTools] = useState(false);
  const undo = useCanvasStore((state) => state.undo);
  const redo = useCanvasStore((state) => state.redo);
  const canvas = useCanvasStore((state) => state.canvas);

  const fillColor = useCanvasStore.getState().fillColor;

  // Take properties from Store and update Shape on Canvas
  const updateActiveObject = (props: Partial<FabricText>) => {
    const canvas = useCanvasStore.getState().getCanvas();
    const active = canvas?.getActiveObject();
    if (
      active &&
      (active.type === "text" ||
        active.type === "i-text" ||
        active.type === "textbox" ||
        active.get("customType") === "star")
    ) {
      active.set(props);
      canvas?.requestRenderAll();

      // save the current state to the history stack
      const pushState = useCanvasStore.getState().pushState;
      pushState();
    }
  };

  const handleClearCanvas = () => {
    const canvas = useCanvasStore.getState().getCanvas();
    const { pushState } = useCanvasStore.getState();
    if (!canvas) return;

    // Push current state before clearing
    pushState(); // Save State Before Delete

    // Remove all objects except the background image
    canvas.getObjects().forEach((obj) => {
      if (obj !== canvas.backgroundImage) {
        canvas.remove(obj);
      }
    });

    canvas.discardActiveObject();
    canvas.requestRenderAll();

    updateLayers(canvas); // Update Layers After Delete

    // do not delete history to can use Undo
  };

  const style =
    " my-auto text-gray-600 hover:scale-105 cursor-pointer transition-transform duration-200 ease-out";

  const style2 =
    "flex gap-1 shadow my-auto bg-gray-200 p-1 rounded text-gray-600 hover:scale-105 hover:bg-gray-100 cursor-pointer transition-transform duration-200 ease-out";

  return (
    <>
      <section className="flex gap-2 p-2 bg-gray-300 rounded-lg shadow">
        {/* Shapes */}
        <div className="flex gap-2">
          {/* filled Shapes */}
          <Square
            className={style}
            onClick={onAddRect}
            fill="#4B5563"
            stroke="#4B5563"
          />
          <Circle
            onClick={onAddCircle}
            className={style}
            fill="#4B5563"
            stroke="#4B5563"
          />
          <Triangle
            onClick={onAddTriangle}
            className={style}
            fill="#4B5563"
            stroke="#4B5563"
          />
          <Star
            onClick={onAddStar}
            className={style}
            fill="#4B5563"
            stroke="#4B5563"
          />

          {/* Stroke Shapes */}
          <Square
            onClick={() => {
              if (canvas) addEmptyShape(canvas, "rect");
            }}
            className={style}
          />
          <Circle
            onClick={() => {
              if (canvas) addEmptyShape(canvas, "circle");
            }}
            className={style}
          />
          <Triangle
            onClick={() => {
              if (canvas) addEmptyShape(canvas, "triangle");
            }}
            className={style}
          />
          <Star
            onClick={() => {
              if (canvas) addEmptyShape(canvas, "star");
            }}
            className={style}
          />

          <Slash onClick={onAddLine} className={style} />
          <Type
            onClick={() => {
              onAddText();
              setTextTools(!textTools);
            }}
            className={style}
          />
        </div>

        {/* Free Draw */}
        <div className="flex gap-2">
          <Brush
            onClick={() =>
              canvas && onEnableFreeDrawing(canvas, fillColor, brushWidth)
            }
            // disabled={!canvas}
            className={style}
          />

          <MousePointer2
            className={style}
            onClick={() => canvas && onDisableFreeDrawing(canvas)}
          />
        </div>

        <div className="flex gap-2 ">
          <Undo onClick={undo} className={style} />
          <Redo onClick={redo} className={style} />
        </div>

        <button
          onClick={handleClearCanvas}
          className="flex shadow gap-1 p-1 bg-gray-200 text-[#4B5563] rounded hover:scale-105 hover:bg-gray-100"
        >
          <span className="text-sm align-middle my-auto font-bold">Clear</span>
          <BrushCleaning />
        </button>

        <Popover>
          <PopoverTrigger className={style2}>
            <div className="text-sm align-middle my-auto font-bold">
              <span>Alignment</span>
            </div>
            <AlignHorizontalJustifyCenter />
          </PopoverTrigger>
          <PopoverContent className={style}>
            <Alignment />
          </PopoverContent>
        </Popover>

        <GroupControls />
      </section>

      {/* Text Settings */}
      {textTools && <Text updateActiveObject={updateActiveObject} />}
    </>
  );
}
