"use client";
import { v4 as uuidv4 } from "uuid";
import { useEffect, useRef, useState } from "react";
import { Canvas, FabricObject, Textbox } from "fabric";
import { useCanvasStore } from "@/store/canvasStore";
import Toolbar from "./Toolbar";
import {
  enableFreeDrawing,
  addRectangle,
  addCircle,
  duplicateSelectedObject,
  addText,
  addTriangle,
  addLine,
  disableFreeDrawing,
  safePushState,
  addStar,
} from "@/utils/canvasUtils";
import RightSideBar from "./RightSideBar";
import { LeftSidebar } from "./LeftSideBar";
import { FabricCanvasElement } from "@/types/canvas.types";
import { updateLayers as updateLayersFromUtils } from "@/utils/canvasUtils";
import VideoControls from "./ui/VideoControls";
import CanvasSizeSelector from "@/components/CanvasSizes";
import { updateScale } from "./UpdateScale";

// to actually have the properties added to the serialized object
FabricObject.customProperties = ["name", "id"];

export default function CanvasEditor() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { canvas, setCanvas } = useCanvasStore();
  const canvasWidth = useCanvasStore((state) => state.customWidth);
  const canvasHeight = useCanvasStore((state) => state.customHeight);
  const scale = useCanvasStore((state) => state.scale);

  // change fill Color
  const fillColor = useCanvasStore.getState().fillColor;

  // ====== Canvas Bg Color from Store ====== \\
  const bgColor = useCanvasStore((state) => state.bgColor);
  const setBgColor = useCanvasStore((state) => state.setBgColor);

  // ====== free drawing mode ====== \\
  const [brushWidth] = useState<number>(5);

  // ----------------------------------- useEffects ----------------------------------- \\
  // ====== Create Canvas ====== \\
  useEffect(() => {
    const element = canvasRef.current as FabricCanvasElement;
    if (!element) return;

    // امنع التهيئة المتكررة باستخدام خاصية داخل الـ DOM element
    // Prevent duplicate configuration using a feature inside the
    if (element._fabricCanvasInstance) return;

    const width = element.clientWidth;
    const height = element.clientHeight;

    const fabricCanvas = new Canvas(element, { width, height });
    fabricCanvas.requestRenderAll();

    // Save Canvas in Store
    setCanvas(fabricCanvas);
    updateScale();

    //  Get History From localStorage After Canvas Stored / Saved
    useCanvasStore.getState().restoreCanvasFromStorage();

    //  Apply saved background color after canvas is restored
    useCanvasStore.getState().applySavedBgColor();

    //  سجل الكانفاس على العنصر نفسه عشان نمنع التهيئة المتكررة
    element._fabricCanvasInstance = fabricCanvas;

    // Add the event listener for path creation - add the new path to store
    fabricCanvas.on("path:created", () => {
      const path = fabricCanvas.getObjects().slice(-1)[0];
      const id = uuidv4();
      path.set("id", id);

      const { layers = [], setLayers } = useCanvasStore.getState();
      setLayers?.([
        ...layers,
        {
          id,
          name: `path ${layers.length}`,
          type: "path",
          object: path,
        },
      ]);
    });
  }, [canvas, setCanvas]);

  useEffect(() => {
    if (canvas) {
      console.log("✅ Canvas set:", canvas);
      console.log("📦 lowerCanvasEl:", canvas.lowerCanvasEl); // لازم يكون HTMLCanvasElement
    }
  }, [canvas]);

  // ====== BG Color ====== \\
  // get Background Color from localStorage
  useEffect(() => {
    const savedColor = localStorage.getItem("canvasBgColor");
    if (savedColor) {
      setBgColor(savedColor);

      const interval = setInterval(() => {
        const canvasInstance = useCanvasStore.getState().canvas;
        if (canvasInstance) {
          canvasInstance.backgroundColor = savedColor;
          canvasInstance.requestRenderAll();
          clearInterval(interval); // stop checking
        }
      }, 100);
    }
  }, [setBgColor]);

  // use canvas bg Color which come from Store
  useEffect(() => {
    if (canvas) {
      canvas.backgroundColor = bgColor;
      canvas.requestRenderAll();
    }
  }, [bgColor, canvas]);

  // ِAfter each Add / Delete / Modified > Update Layers list
  // and save new state for canvasHistory in canvasStore -- for Undo / Redo
  useEffect(() => {
    if (!canvas) return;

    let updateTimer: ReturnType<typeof setTimeout>;

    const updateAndPush = () => {
      clearTimeout(updateTimer);
      updateTimer = setTimeout(() => {
        updateLayersFromUtils(canvas);
        safePushState(canvas);
      }, 150);
    };

    const handleModified = () => {
      updateLayersFromUtils(canvas);
      safePushState(canvas);
    };

    canvas.on("object:added", updateAndPush);
    canvas.on("object:removed", updateAndPush);
    canvas.on("object:modified", handleModified);

    return () => {
      clearTimeout(updateTimer);
      canvas.off("object:added", updateAndPush);
      canvas.off("object:removed", updateAndPush);
      canvas.off("object:modified", handleModified);
    };
  }, [canvas]);

  // === tracking Selection & Update Selected Layer ===
  useEffect(() => {
    if (!canvas) return;

    // After Selection Get Selected Layer ID & store the ID in selectedLayerId
    const handleSelection = () => {
      const active = canvas.getActiveObject();
      if (active && "id" in active) {
        const id = (active as FabricObject).id;
        useCanvasStore.getState().setSelectedLayerId(id ?? null);
      } else {
        useCanvasStore.getState().setSelectedLayerId(null);
      }
    };

    canvas.on("selection:created", handleSelection);
    canvas.on("selection:updated", handleSelection);
    canvas.on("selection:cleared", () =>
      useCanvasStore.getState().setSelectedLayerId(null)
    );

    return () => {
      canvas.off("selection:created", handleSelection);
      canvas.off("selection:updated", handleSelection);
      canvas.off("selection:cleared");
    };
  }, [canvas]);

  // === Key Down [ Delete & Ctrl + D / Undo / Redo ] ===
  // Move these hook calls to the top level of the component
  const undo = useCanvasStore((state) => state.undo);
  const redo = useCanvasStore((state) => state.redo);

  useEffect(() => {
    let copiedObject: FabricObject | null = null;

    const handleKeyDown = async (e: KeyboardEvent) => {
      const isTyping =
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA" ||
        (document.activeElement as HTMLElement)?.isContentEditable;

      if (isTyping || !canvas) return;

      const activeObject = canvas.getActiveObject();
      const moveStep = e.shiftKey ? 10 : 2;

      switch (e.code) {
        case "KeyZ":
          if (e.ctrlKey) {
            e.preventDefault();
            if (e.shiftKey) {
              redo(); // Ctrl + Shift + Z
            } else {
              undo(); // Ctrl + Z
            }
          }
          break;

        case "KeyY":
          if (e.ctrlKey) {
            e.preventDefault();
            redo(); // Ctrl + Y
          }
          break;

        case "KeyD":
          if (e.ctrlKey && activeObject) {
            e.preventDefault();
            duplicateSelectedObject(canvas);
            safePushState(canvas);
          }
          break;

        case "Delete":
          if (activeObject) {
            e.preventDefault();
            canvas.remove(activeObject);
            canvas.discardActiveObject();
            canvas.requestRenderAll();
            safePushState(canvas);
          }
          break;

        case "KeyC":
          if (e.ctrlKey && activeObject) {
            e.preventDefault();
            // copiedObject = await activeObject.clone();
            copiedObject = (await activeObject.clone()) as FabricObject;
          }
          break;

        case "KeyV":
          if (e.ctrlKey && copiedObject) {
            e.preventDefault();
            // const cloned = await copiedObject.clone();
            const cloned = (await copiedObject.clone()) as FabricObject;

            cloned.set({
              id: uuidv4(),
              left: (copiedObject.left || 0) + 30,
              top: (copiedObject.top || 0) + 30,
            });

            canvas.add(cloned);
            canvas.setActiveObject(cloned);
            canvas.requestRenderAll();
            safePushState(canvas);
          }
          break;

        case "ArrowLeft":
          if (activeObject) {
            e.preventDefault();
            activeObject.left! -= moveStep;
            safePushState(canvas);
          }
          break;

        case "ArrowRight":
          if (activeObject) {
            e.preventDefault();
            activeObject.left! += moveStep;
            safePushState(canvas);
          }
          break;

        case "ArrowUp":
          if (activeObject) {
            e.preventDefault();
            activeObject.top! -= moveStep;
            safePushState(canvas);
          }
          break;

        case "ArrowDown":
          if (activeObject) {
            e.preventDefault();
            activeObject.top! += moveStep;
            safePushState(canvas);
          }
          break;
      }

      if (activeObject) {
        activeObject.setCoords();
        canvas.requestRenderAll();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [canvas, undo, redo]);

  // Shape Dimentions [ Width - Height ]
  const { getCanvas, setDimensions } = useCanvasStore();
  useEffect(() => {
    const canvas = getCanvas();
    if (!canvas) return;

    const updateDimensions = () => {
      const active = canvas.getActiveObject();
      if (active) {
        const { scaleX, scaleY, width, height } = active;
        setDimensions({
          width: ((width ?? 0) * (scaleX ?? 1)).toFixed(0),
          height: ((height ?? 0) * (scaleY ?? 1)).toFixed(0),
        });
      }
    };

    // ✅ ربط الأحداث
    canvas.on("object:scaling", updateDimensions);
    canvas.on("object:modified", updateDimensions);
    canvas.on("selection:created", updateDimensions);
    canvas.on("selection:updated", updateDimensions);

    return () => {
      // ✅ تنظيف الأحداث
      canvas.off("object:scaling", updateDimensions);
      canvas.off("object:modified", updateDimensions);
      canvas.off("selection:created", updateDimensions);
      canvas.off("selection:updated", updateDimensions);
    };
  }, [canvas, setDimensions, getCanvas]); // ✅ مهم تراقب setDimensions عشان تكون موجودة دايمًا

  // Text
  const setText = useCanvasStore((state) => state.setText);
  useEffect(() => {
    const canvas = getCanvas();
    if (!canvas) return;

    const handleSelection = () => {
      const active = canvas.getActiveObject();
      if (active && active.type === "text") {
        setText((active as Textbox).text || "");
      }
    };

    canvas.on("selection:created", handleSelection);
    canvas.on("selection:updated", handleSelection);
    canvas.on("object:modified", handleSelection);
    canvas.on("selection:cleared", () => setText(""));

    return () => {
      canvas.off("selection:created", handleSelection);
      canvas.off("selection:updated", handleSelection);
      canvas.off("object:modified", handleSelection);
      canvas.off("selection:cleared");
    };
  }, [getCanvas, setText]);

  useEffect(() => {
    const canvas = getCanvas();
    if (!canvas) return;

    const updateTextFromActive = () => {
      const active = canvas.getActiveObject();
      if (active && active.type === "text") {
        setText((active as Textbox).text || ""); // تحديث قيمة النص في store
      }
    };

    // اسمع للأحداث دي
    canvas.on("selection:created", updateTextFromActive);
    canvas.on("selection:updated", updateTextFromActive);

    // تنظيف عند إلغاء المكون أو تغيير canvas
    return () => {
      canvas.off("selection:created", updateTextFromActive);
      canvas.off("selection:updated", updateTextFromActive);
    };
  }, [getCanvas, setText]);

  return (
    <main>
      <Toolbar
        brushWidth={brushWidth}
        onEnableFreeDrawing={enableFreeDrawing}
        onDisableFreeDrawing={disableFreeDrawing}
        onAddText={() => canvas && addText(canvas)}
        onAddRect={() => canvas && addRectangle(canvas, fillColor)}
        onAddCircle={() => canvas && addCircle(canvas, fillColor)}
        onAddTriangle={() => canvas && addTriangle(canvas, fillColor)}
        onAddLine={() => canvas && addLine(canvas, fillColor)}
        onAddStar={() => canvas && addStar(canvas, fillColor)}
      />
      <div className="flex justify-between w-auto">
        <LeftSidebar />

        <div className="flex flex-col mx-auto w-full">
          <div className="flex gap-2 bg-gray-300 rounded-lg p-2 my-2 shadow mx-auto">
            <label className="text-sm font-bold text-center my-auto text-[#4B5563]">
              Canvas Background Color:
            </label>
            <input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className=" p-1 rounded-lg bg-white text-sm shadow "
            />
            <input
              type="text"
              className="rounded-lg px-1 shadow"
              value={bgColor}
              onChange={(e) => {
                const CanvasColor = e.target.value;
                if (setBgColor) {
                  setBgColor(CanvasColor); // Change Color Picker Value
                }
              }}
            />
          </div>

          <CanvasSizeSelector />

          <div
            id="canvas-wrapper"
            className="flex-1 overflow-auto p-4 bg-gray-400"
          >
            <div
              style={{
                width: canvasWidth + "px",
                height: canvasHeight + "px",
                transform: `scale(${scale})`,
                transformOrigin: "top left",
                margin: "0 auto",
              }}
            >
              <canvas
                ref={canvasRef}
                width={canvasWidth}
                height={canvasHeight}
                className="mx-auto my-0"
              />
            </div>
          </div>
          {/* <div
            id="canvas-wrapper"
            className="bg-gray-600 overflow-auto max-h-[80vh] rounded-lg p-2"
          >
            <div
              style={{
                width: `${canvasWidth}px`,
                height: `${canvasHeight}px`,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
            >
              <canvas
                ref={canvasRef}
                width={canvasWidth}
                height={canvasHeight}
                style={{ display: "block" }}
              />
            </div>
          </div> */}

          {/* <div className="bg-gray-400 w-full h-[80vh]">
            <canvas ref={canvasRef} className="rounded-0" />
          </div> */}
          <VideoControls />
        </div>

        <RightSideBar />
      </div>
    </main>
  );
}
