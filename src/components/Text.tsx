"use client";
import { useCanvasStore } from "@/store/canvasStore";
import { useEffect } from "react";
import { FabricText } from "fabric";
import type {
  FontWeightType,
  FontStyleType,
  TextAlignType,
} from "@/types/canvas.types";

type TextProps = {
  updateActiveObject: (props: Partial<FabricText>) => void;
};

const Text = ({ updateActiveObject }: TextProps) => {
  // ✅ فصل كل قيمة أو دالة عشان نحسن الأداء ونمنع الـ loop
  const text = useCanvasStore((state) => state.text);
  const setText = useCanvasStore((state) => state.setText);

  const fontSize = useCanvasStore((state) => state.fontSize);
  const setFontSize = useCanvasStore((state) => state.setFontSize);

  const fontFamily = useCanvasStore((state) => state.fontFamily);
  const setFontFamily = useCanvasStore((state) => state.setFontFamily);

  const fontWeight = useCanvasStore((state) => state.fontWeight);
  const setFontWeight = useCanvasStore((state) => state.setFontWeight);

  const fontStyle = useCanvasStore((state) => state.fontStyle);
  const setFontStyle = useCanvasStore((state) => state.setFontStyle);

  const textAlign = useCanvasStore((state) => state.textAlign);
  const setTextAlign = useCanvasStore((state) => state.setTextAlign);

  const underline = useCanvasStore((state) => state.underline);
  const setUnderline = useCanvasStore((state) => state.setUnderline);

  const linethrough = useCanvasStore((state) => state.linethrough);
  const setLinethrough = useCanvasStore((state) => state.setLinethrough);

  const getCanvas = useCanvasStore((state) => state.getCanvas);

  useEffect(() => {
    const canvas = getCanvas();

    // take properties from selected object & update Zustand store state
    // Sync (State or Store) with Selected Object on Canvas
    const updateTextSettings = () => {
      const active = canvas?.getActiveObject();
      console.log("active type is:", active?.type);

      // if (
      //   active &&
      //   ["text", "i-text", "textbox"].includes(active.type)
      // ) {
      // or
      if (
        active &&
        (active.type === "text" ||
          active.type === "i-text" ||
          active.type === "textbox")
      ) {
        console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
        const textObj = active as FabricText;
        setText(textObj.text ?? "");
        setFontSize(textObj.fontSize ?? 24);
        setFontFamily(textObj.fontFamily ?? "Inter");
        setFontWeight(
          (textObj.fontWeight?.toString() ?? "normal") as FontWeightType
        );
        setFontStyle((textObj.fontStyle ?? "normal") as FontStyleType);
        setTextAlign((textObj.textAlign ?? "left") as TextAlignType);
        setUnderline(textObj.underline ?? false);
        setLinethrough(textObj.linethrough ?? false);
      }
    };

    const handleSelectionCleared = () => {
      setText("");
      setFontSize(16);
      setFontFamily("Inter");
      setFontWeight("normal");
      setFontStyle("normal");
      setTextAlign("left");
      setUnderline(false);
      setLinethrough(false);
    };

    if (canvas) {
      canvas.on("selection:created", updateTextSettings);
      canvas.on("selection:updated", updateTextSettings);
      canvas.on("selection:cleared", handleSelectionCleared);
    }

    return () => {
      if (canvas) {
        canvas.off("selection:created", updateTextSettings);
        canvas.off("selection:updated", updateTextSettings);
        canvas.off("selection:cleared", handleSelectionCleared);
      }
    };
  }, [
    getCanvas,
    setText,
    setFontSize,
    setFontFamily,
    setFontWeight,
    setFontStyle,
    setTextAlign,
    setUnderline,
    setLinethrough,
  ]);

  const decoration = underline
    ? "underline"
    : linethrough
    ? "line-through"
    : "none";

  return (
    <div className="flex flex-wrap bg-gray-300 rounded-lg gap-2 border-t p-2 mt-2">
      <input
        className="border px-2 py-1 rounded text-sm shadow w-24"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          updateActiveObject({ text: e.target.value });
        }}
        placeholder="Edit text"
      />

      <input
        className="border px-2 py-1 rounded text-sm shadow w-24"
        type="number"
        value={typeof fontSize === "number" && !isNaN(fontSize) ? fontSize : ""}
        onChange={(e) => {
          const value = parseFloat(e.target.value);
          setFontSize(isNaN(value) ? 0 : value);
          updateActiveObject({ fontSize: value }); // ✅ ضفنا دي
        }}
      />

      <select
        className="border px-2 py-1 rounded text-sm shadow w-24"
        value={textAlign}
        onChange={(e) => {
          const value = e.target.value;
          setTextAlign(value as TextAlignType);
          updateActiveObject({ textAlign: value });
        }}
      >
        <option value="left">Left</option>
        <option value="center">Center</option>
        <option value="right">Right</option>
        <option value="justify">Justify</option>
      </select>

      <select
        className="border px-2 py-1 rounded text-sm shadow w-24"
        value={fontFamily}
        onChange={(e) => {
          const value = e.target.value;
          setFontFamily(value);
          updateActiveObject({ fontFamily: value });
        }}
      >
        <option value="Inter">Inter</option>
        <option value="Roboto">Roboto</option>
        <option value="Georgia">Georgia</option>
        <option value="Courier Prime">Courier Prime</option>
      </select>

      <select
        className="border px-2 py-1 rounded text-sm shadow w-24"
        value={fontWeight}
        onChange={(e) => {
          const value = e.target.value as FontWeightType;
          setFontWeight(value);
          updateActiveObject({ fontWeight: value });
        }}
      >
        <option value="normal">Normal</option>
        <option value="bold">Bold</option>
        <option value="lighter">Light</option>
      </select>

      <select
        className="border px-2 py-1 rounded text-sm shadow w-24"
        value={decoration}
        onChange={(e) => {
          const value = e.target.value;
          setUnderline(value === "underline");
          setLinethrough(value === "line-through");
          updateActiveObject({
            underline: value === "underline",
            linethrough: value === "line-through",
          });
        }}
      >
        <option value="none">None</option>
        <option value="underline">Underline</option>
        <option value="line-through">Line Through</option>
      </select>

      <select
        className="border px-2 py-1 rounded text-sm shadow w-24"
        value={fontStyle}
        onChange={(e) => {
          const value = e.target.value;
          setFontStyle(value as FontStyleType);
          updateActiveObject({ fontStyle: value });
        }}
      >
        <option value="normal">Normal</option>
        <option value="italic">Italic</option>
      </select>
    </div>
  );
};

export default Text;
