"use client";
import { useEffect, useState } from "react";
import { Rect } from "fabric";
import { useCanvasStore } from "@/store/canvasStore";

const RadiusSlider = () => {
  const canvas = useCanvasStore((state) => state.canvas);
  const [radius, setRadius] = useState(0);
  const [maxRadius, setMaxRadius] = useState(100);
  const [visible, setVisible] = useState(false); // إظهار السلايدر فقط لو العنصر Rect

  useEffect(() => {
    if (!canvas) return;

    const updateRadius = () => {
      const active = canvas.getActiveObject();
      if (active && active.type === "rect") {
        const rect = active as Rect;
        const width = rect.width! * rect.scaleX!;
        const height = rect.height! * rect.scaleY!;
        const maxRadius = Math.min(width, height) / 2;

        setMaxRadius(maxRadius);
        setRadius(rect.rx ?? 0);
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    updateRadius(); // نحدث الحالة مباشرة لو المستخدم اختار مستطيل

    canvas.on("selection:created", updateRadius);
    canvas.on("selection:updated", updateRadius);
    canvas.on("object:modified", updateRadius);
    canvas.on("selection:cleared", () => setVisible(false));

    return () => {
      canvas.off("selection:created", updateRadius);
      canvas.off("selection:updated", updateRadius);
      canvas.off("object:modified", updateRadius);
      canvas.off("selection:cleared", () => setVisible(false));
    };
  }, [canvas]);

  const handleChange = (value: number) => {
    if (!canvas) return;

    const active = canvas.getActiveObject();
    if (active && active.type === "rect") {
      const rect = active as Rect;

      const width = rect.width! * rect.scaleX!;
      const height = rect.height! * rect.scaleY!;

      // احسب rx و ry كنسبة مئوية من الحجم (زي CSS border-radius)
      const rx = height * (value / 100);
      const ry = width * (value / 100);

      rect.set({ rx, ry });
      rect.setCoords();
      canvas.requestRenderAll();
      setRadius(value); // خزّن النسبة مش القيمة الفعلية
    }
  };

  if (!visible) return null;

  return (
    <div>
      <label className="text-sm font-medium text-gray-700">
        <span>Radius:</span>
        <span> {Math.round(radius)}</span>
      </label>
      <input
        type="range"
        min={0}
        max={Math.floor(maxRadius)}
        value={radius}
        step={1}
        onChange={(e) => handleChange(Number(e.target.value))}
        className="w-full"
      />
    </div>
  );
};

export default RadiusSlider;
