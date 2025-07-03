// utils/canvasUtils.ts
import { FabricVideo } from "@/customs/CustomFabricVideo";
import { getVideoBlobURL } from "./indexedDB";
import { useCanvasStore } from "@/store/canvasStore";
import { Layer } from "@/types/canvas.types";
import { v4 as uuidv4 } from "uuid";
import {
  Rect,
  Circle,
  Line,
  Triangle,
  PencilBrush,
  FabricObject,
  Canvas,
  Textbox,
  Polygon,
  Group,
  Point,
} from "fabric";
import jsPDF from "jspdf";
import * as fabric from "fabric";

// Monkey Patching for toObject in fabricJS
// Add id / type for all fabric object when :
//  const json = canvas.toJSON();
// or object.toObject();
// مرتبط جدًا ومهم جدًا بموضوع قفل/فك العناصر، وحفظ الحالة واسترجاعها بعد الرفرش.
FabricObject.prototype.toObject = (function (toObject) {
  return function (this: FabricObject, ...args: any[]) {
    return {
      ...toObject.apply(this, args[0]),
      id: this.id,
      name: this.name,
      type: this.type,
      selectable: this.selectable,
      evented: this.evented,
      lockMovementX: this.lockMovementX,
      lockMovementY: this.lockMovementY,
      hasControls: this.hasControls,
      hasBorders: this.hasBorders,
      visible: this.visible,
    };
  };
})(FabricObject.prototype.toObject);

// to save canvas state after evry important change
export const safePushState = (canvas: Canvas) => {
  const { isRestoring, pushState } = useCanvasStore.getState();

  // ✅ فقط لما ما نكونش بنعمل undo/redo
  if (!isRestoring && canvas) {
    pushState();
  }
};

export const getObjectById = (canvas: Canvas, id: string) => {
  return canvas.getObjects().find((obj) => (obj as FabricObject).id === id);
};

// utils/updateLayers.ts
type FabricObjectWithId = FabricObject & {
  id?: string;
  name?: string;
};

// Update the layers List based on the Fabric objects in the Canvas
export const updateLayers = (canvas: Canvas) => {
  const setLayers = useCanvasStore.getState().setLayers;

  // ✅ فلترة خطوط الشبكة
  const objects = canvas.getObjects().filter((obj) => !(obj as any).isGridLine); // ← دي أهم سطر

  const newLayers: Layer[] = objects.map((obj, index) => {
    const o = obj as FabricObjectWithId;

    return {
      id: o.id ?? `no-id-${index}`,
      name: o.name ?? `${o.type} ${index}`,
      type: o.type,
      visible: o.visible,
    };
  });

  setLayers(newLayers);
};

//  ================================ Filled Shapes ================================ \\
// ========== Add Rect ========== \\
export const addRectangle = (canvas: Canvas, color: string) => {
  const id = uuidv4();

  const width = 100;
  const height = 100;

  const rect = new Rect({
    left: 100,
    top: 100,
    fill: color,
    width,
    height,
    rx: width * 0.1,
    ry: height * 0.1,
    selectable: true,
    objectCaching: false,
  });

  rect.set({ id });

  canvas.add(rect);
  canvas.setActiveObject(rect);
  canvas.requestRenderAll();
};

// ========== Add Star ==========
export const addStar = (canvas: Canvas, color: string) => {
  const id = uuidv4();

  const centerX = 100;
  const centerY = 100;
  const spikes = 5;
  const outerRadius = 50;
  const innerRadius = 20;

  const starPoints = generateStarPoints(
    centerX,
    centerY,
    spikes,
    outerRadius,
    innerRadius
  );

  const star = new Polygon(starPoints, {
    left: centerX,
    top: centerY,
    fill: color,
    opacity: 1,
    angle: 0,
  });

  star.set("id", id);
  star.set("customType", "star"); // ⬅️ علشان تقدر تميّزها في layers
  canvas.add(star);
  canvas.setActiveObject(star);
  canvas.renderAll();

  updateLayers(canvas);
};

// calculate points for a star shape
const generateStarPoints = (
  cx: number,
  cy: number,
  spikes: number,
  outerRadius: number,
  innerRadius: number
): { x: number; y: number }[] => {
  const step = Math.PI / spikes;
  const points = [];

  for (let i = 0; i < 2 * spikes; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = cx + Math.cos(i * step) * radius;
    const y = cy + Math.sin(i * step) * radius;
    points.push({ x, y });
  }

  return points;
};

// ========== Add Circle ==========
export const addCircle = (canvas: Canvas, color: string) => {
  const id = uuidv4();
  const circle = new Circle({
    left: 150,
    top: 150,
    fill: color,
    radius: 50,
    opacity: 1,
  });

  circle.set("id", id);
  canvas.add(circle);
  canvas.setActiveObject(circle);
  canvas.renderAll();

  updateLayers(canvas); // ✅ ابني الـ layers من canvas مباشرة
};

// ========== Add Line ==========
export const addLine = (canvas: Canvas, color: string) => {
  const id = uuidv4();
  const line = new Line([50, 100, 200, 100], {
    left: 100,
    top: 100,
    stroke: color,
    strokeWidth: 2,
  });

  line.set("id", id);
  canvas.add(line);
  canvas.setActiveObject(line);
  canvas.renderAll();

  updateLayers(canvas); // ✅ ابني الـ layers من canvas مباشرة
};

// ========== Add Triangle ==========
export const addTriangle = (canvas: Canvas, color: string) => {
  const id = uuidv4();
  const triangle = new Triangle({
    left: 120,
    top: 120,
    width: 100,
    height: 100,
    fill: color,
    opacity: 1,
  });

  triangle.set("id", id);
  canvas.add(triangle);
  canvas.setActiveObject(triangle);
  canvas.renderAll();

  updateLayers(canvas); // ✅ ابني الـ layers من canvas مباشرة
};

// ========== Add Free Drawing ==========
export const enableFreeDrawing = (
  canvas: Canvas,
  color: string,
  width: number
) => {
  canvas.isDrawingMode = true;

  // Define Brush
  if (!canvas.freeDrawingBrush) {
    canvas.freeDrawingBrush = new PencilBrush(canvas);
  }

  canvas.freeDrawingBrush.color = color;
  canvas.freeDrawingBrush.width = width;
};

// ========== Disable Free Drawing ==========
export const disableFreeDrawing = (canvas: Canvas) => {
  canvas.isDrawingMode = false;
};

// ========== Delete Selected (Single or Multiple) ==========
export const deleteSelected = (canvas: Canvas) => {
  const activeObjects = canvas.getActiveObjects();

  if (activeObjects.length > 0) {
    activeObjects.forEach((obj) => {
      canvas.remove(obj);
    });

    canvas.discardActiveObject();
    canvas.requestRenderAll();
    updateLayers(canvas); // ✅ حدث قائمة الطبقات بعد الحذف
  }
};

// ========== Change Fill Color ==========
export const changeFillColor = (canvas: Canvas, color: string) => {
  const { selectedLayerId } = useCanvasStore.getState(); // ✅ خد القيمة الأحدث مباشرة

  if (!selectedLayerId) return;

  const object = canvas.getObjects().find((obj) => obj.id === selectedLayerId);
  if (!object) return;

  if (object.type === "textbox") {
    object.set("fill", color);
  } else {
    if ("fill" in object) object.set("fill", color);
    if ("stroke" in object) object.set("stroke", color);
  }

  canvas.requestRenderAll();
};

// ========== Change Stroke Color ==========
export const changeStrokeColor = (canvas: Canvas, color: string) => {
  const { selectedLayerId } = useCanvasStore.getState();
  if (!selectedLayerId) return;

  const object = canvas.getObjects().find((obj) => obj.id === selectedLayerId);
  if (!object) return;

  if (object.type === "textbox") {
    object.set("fill", color);
  } else {
    if ("stroke" in object) object.set("stroke", color);
  }
  canvas.requestRenderAll();
};

// ========== Change Opacity ==========
export const changeOpacity = (canvas: Canvas, opacity: number) => {
  const { selectedLayerId } = useCanvasStore.getState(); // ✅ خد القيمة الأحدث مباشرة
  if (!selectedLayerId) return;
  const activeObject = canvas
    .getObjects()
    .find((obj) => obj.id === selectedLayerId);
  if (!activeObject) return;
  // Ensure opacity is between 0 and 1
  opacity = Math.max(0, Math.min(1, opacity));

  // Set the opacity of the active object
  // and request a re-render of the canvas
  if (activeObject.type === "textbox") {
    activeObject.set("opacity", opacity);
  } else {
    if ("opacity" in activeObject) activeObject.set("opacity", opacity);
  }

  // Update the canvas to reflect the changes
  canvas.requestRenderAll();

  // Update the layers after changing opacity
  updateLayers(canvas); // ✅ حدث قائمة الطبقات بعد تغيير الشفافية

  // Optionally, you can also update the opacity of the active object directly
  // const activeObject = canvas.getActiveObject();
  if (activeObject) {
    activeObject.set("opacity", opacity);
    canvas.requestRenderAll();
  }
  // Update the layers after changing opacity
  updateLayers(canvas); // ✅ حدث قائمة الطبقات بعد تغيير الشفافية
};

// ========== Save As Image ==========
export const exportDesign = (
  canvas: Canvas,
  format: "png" | "jpeg" | "pdf" | "svg" | "psd"
) => {
  if (!canvas) return;

  const multiplier = 2;
  const width = canvas.getWidth() * multiplier;
  const height = canvas.getHeight() * multiplier;

  if (format === "svg") {
    const svgData = canvas.toSVG();
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "design.svg";
    link.click();
    URL.revokeObjectURL(url);
    return;
  }

  const dataURL = canvas.toDataURL({
    format: format === "jpeg" ? "jpeg" : "png", // fabric only supports png/jpeg
    multiplier,
    quality: 1,
  });

  if (format === "pdf") {
    const pdf = new jsPDF("landscape", "pt", [width, height]);
    pdf.addImage(dataURL, "PNG", 0, 0, width, height);
    pdf.save("design.pdf");
  } else if (format === "psd") {
    // ✳️ مافيش دعم مباشر لـ PSD، لكن ممكن تحفظ كصورة PNG داخل ملف .psd وهمي
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = `design.png`; // لازم يتحول لاحقًا عبر أدوات خارجية
    link.click();

    alert(
      "لا يمكن تصدير PSD مباشرة، لكن تم حفظ التصميم كصورة PNG ويمكن تحويلها لاحقًا من Photoshop."
    );
  } else {
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = `design.${format}`;
    link.click();
  }
};

// ========== Export as JSON ==========
export const exportAsJSON = (canvas: Canvas) => {
  const json = canvas.toJSON();
  const blob = new Blob([JSON.stringify(json)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "design.json";
  link.click();

  URL.revokeObjectURL(url);
};

// ========== bring object one step front ==========
export const moveObjectUp = (canvas: Canvas, objectId: string) => {
  const objects = canvas.getObjects();
  const object = objects.find((obj: FabricObject) => obj.id === objectId);
  if (!object) return;
  if (!canvas) return;

  const index = objects.indexOf(object);
  if (index < objects.length - 1) {
    [objects[index], objects[index + 1]] = [objects[index + 1], objects[index]];
    redrawCanvas(canvas, objects, object);
  }
};

// ====== Move one step down ======
export const moveObjectDown = (canvas: Canvas, objectId: string) => {
  const objects = canvas.getObjects();
  const object = objects.find((obj: FabricObject) => obj.id === objectId);
  if (!object) return;
  if (!canvas) return;

  const index = objects.indexOf(object);
  if (index > 0) {
    [objects[index], objects[index - 1]] = [objects[index - 1], objects[index]];
    redrawCanvas(canvas, objects, object);
  }
};

// ====== Bring to front (top of stack) ======
export const moveObjectToFront = (canvas: Canvas, objectId: string) => {
  const objects = canvas.getObjects();
  const object = objects.find((obj: FabricObject) => obj.id === objectId);
  if (!object) return;
  if (!canvas) return;

  const index = objects.indexOf(object);
  if (index !== -1) {
    objects.splice(index, 1);
    objects.push(object);
    redrawCanvas(canvas, objects, object);
  }
};

// ====== Send to back (bottom of stack) ======
export const moveObjectToBack = (canvas: Canvas, objectId: string) => {
  const objects = canvas.getObjects();
  const object = objects.find((obj: FabricObject) => obj.id === objectId);
  if (!object) return;
  if (!canvas) return;
  const index = objects.indexOf(object);
  if (index !== -1) {
    objects.splice(index, 1);
    objects.unshift(object);
    redrawCanvas(canvas, objects, object);
  }
};

// re-order
// ====== Helper to clear and redraw ======
const redrawCanvas = (
  canvas: Canvas,
  objects: FabricObject[],
  activeObject: FabricObject
) => {
  const bg = canvas.backgroundColor;
  canvas.clear();
  canvas.backgroundColor = bg || "#AEC8A4";
  objects.forEach((obj) => canvas.add(obj));
  canvas.setActiveObject(activeObject);
  canvas.requestRenderAll();
};

// ====== Duplicate Shape Ctr + d ======
export const duplicateSelectedObject = async (canvas: Canvas) => {
  const activeObject = canvas.getActiveObject();
  if (!canvas) return;

  if (activeObject && typeof activeObject.clone === "function") {
    try {
      const cloned = await activeObject.clone();

      // توليد ID جديد وتعيينه
      cloned.set({
        id: uuidv4(),
        left: (activeObject.left || 0) + 20,
        top: (activeObject.top || 0) + 20,
      });

      canvas.add(cloned);
      canvas.setActiveObject(cloned);
      canvas.requestRenderAll();
    } catch (error) {
      console.error("Error duplicating object:", error);
    }
  }
};

//  ================================ Text ================================

// ====== Add Text ======
export const addText = (canvas: Canvas, text = "New Text", fontSize = 24) => {
  const textbox = new Textbox(text, {
    left: 100,
    top: 100,
    fontSize,
    fill: "#000",
    editable: true,
    id: uuidv4(),
    // width: 300,
  });

  textbox.on("editing:entered", () => {
    if (textbox.text === "New Text") {
      textbox.text = "";
      canvas.renderAll();
    }
  });

  canvas.add(textbox);
  canvas.setActiveObject(textbox);
  canvas.requestRenderAll();
};

// ====== Change Font Family ======
export const changeFontFamily = (canvas: Canvas, fontFamily: string) => {
  const activeObject = canvas.getActiveObject();

  if (activeObject && activeObject.type === "textbox") {
    activeObject.set("fontFamily", fontFamily);
    canvas.requestRenderAll();
  }
};

// ====== Update Font Weight ======
export const updateFontWeight = (canvas: Canvas, weight: string) => {
  const active = canvas.getActiveObject();
  if (active && active.type === "textbox") {
    active.set("fontWeight", weight);
    canvas.renderAll();
  }
};

// ====== Update Text Decoration ======
export const updateTextDecoration = (canvas: Canvas, decoration: string) => {
  const activeObject = canvas.getActiveObject();
  if (activeObject && activeObject.type === "textbox") {
    switch (decoration) {
      case "underline":
        (activeObject as Textbox).set({
          underline: true,
          linethrough: false,
        });
        break;
      case "line-through":
        (activeObject as Textbox).set({
          underline: false,
          linethrough: true,
        });
        break;
      case "none":
      default:
        (activeObject as Textbox).set({
          underline: false,
          linethrough: false,
        });
        break;
    }
    canvas.requestRenderAll();
  }
};

// ====== Update Font Style ======
export const updateFontStyle = (canvas: Canvas, style: string) => {
  const active = canvas.getActiveObject();
  if (active && active.type === "textbox") {
    active.set("fontStyle", style);
    canvas.renderAll();
  }
};

// ====== Update Font Size ======
export const handleFontSizeChange = (
  canvas: Canvas,
  selectedText: Textbox | null,
  size: number
) => {
  if (canvas && selectedText) {
    selectedText.set("fontSize", size);
    canvas.requestRenderAll();
  }
};

// ====== Handle Text Change ======
export const handleTextChange = (
  canvas: Canvas,
  selectedText: Textbox | null,
  value: string
) => {
  if (canvas && selectedText) {
    selectedText.set("text", value);
    canvas.requestRenderAll();
  }
};

// ============================== Alignments ==============================

// ====== Align Object Left (ٌLeft = 0)======
export const alignObjectLeft = (canvas: Canvas) => {
  const activeObject = canvas.getActiveObject();
  if (!activeObject) return;

  activeObject.set({ left: 0 });
  activeObject.setCoords(); // مهم جدًا لتحديث البوزيشن الحقيقي
  canvas.requestRenderAll(); // أفضل من renderAll في معظم الحالات
};

// ====== Align Object Right (ٌRight = 0)======
export const alignObjectRight = (canvas: Canvas) => {
  const activeObject = canvas.getActiveObject();
  if (!activeObject) return;

  const newLeft = canvas.getWidth() - activeObject.getScaledWidth();
  activeObject.set({ left: newLeft }); // ✅
  activeObject.setCoords();
  canvas.requestRenderAll();
};

// ====== Align Object Center Horizontal ======
export const alignObjectCenterH = (canvas: Canvas) => {
  const activeObject = canvas.getActiveObject();
  if (!activeObject) return;

  canvas.centerObjectH(activeObject);
  activeObject.setCoords();
  canvas.requestRenderAll();
};

// ====== Align Object Top ======
export const alignObjectTop = (canvas: Canvas) => {
  const activeObject = canvas.getActiveObject();
  if (!activeObject) return;

  activeObject.set({ top: 0 });
  activeObject.setCoords();
  canvas.requestRenderAll();
};

// ====== Align Object Bottom ======
export const alignObjectBottom = (canvas: Canvas) => {
  const activeObject = canvas.getActiveObject();
  if (!activeObject) return;

  const newTop = canvas.getHeight() - activeObject.getScaledHeight();
  activeObject.set({ top: newTop });
  activeObject.setCoords();
  canvas.requestRenderAll();
};

// ====== Align Object Center Vertical ======
export const alignObjectVertical = (canvas: Canvas) => {
  const activeObject = canvas.getActiveObject();
  if (!activeObject) return;

  canvas.centerObjectV(activeObject);
  activeObject.setCoords();
  canvas.requestRenderAll();
};

// --------------------------- Alignments --------------------------- \\
// --------------------------- MORE THAN ONE OBJECT ------------------------- \\
// ====== Align Objects Left (ٌLeft = 0) ======
export const alignObjectsLeft = (canvas: Canvas) => {
  const activeObjects = canvas.getActiveObjects();
  if (activeObjects.length < 2) return;

  // إيجاد أقل قيمة left بين العناصر
  const minLeft = Math.min(...activeObjects.map((obj) => obj.left));
  activeObjects.forEach((obj) => {
    obj.set({ left: minLeft });
    obj.setCoords();
  });
  canvas.requestRenderAll();
};

// ====== Align Objects Left (ٌRight  = 0) ======
export const alignObjectsRight = (canvas: Canvas) => {
  const activeObjects = canvas.getActiveObjects();
  if (activeObjects.length < 2) return;

  // إيجاد أعظم قيمة right بين العناصر
  const maxRight = Math.max(
    ...activeObjects.map((obj) => obj.left + obj.getScaledWidth())
  );
  activeObjects.forEach((obj) => {
    const newLeft = maxRight - obj.getScaledWidth();
    obj.set({ left: newLeft });
    obj.setCoords();
  });
  canvas.requestRenderAll();
};

// ====== Align Objects Top (ٌTop  = 0) ======
export const alignObjectsTop = (canvas: Canvas) => {
  const activeObjects = canvas.getActiveObjects();
  if (activeObjects.length < 2) return;
  const minTop = Math.min(...activeObjects.map((obj) => obj.top));
  activeObjects.forEach((obj) => {
    obj.set({ top: minTop });
    obj.setCoords();
  });
  canvas.requestRenderAll();
};

// ====== Align Objects Bottom (Bottom  = 0) ======
export const alignObjectsBottom = (canvas: Canvas) => {
  const activeObjects = canvas.getActiveObjects();
  if (activeObjects.length < 2) return;
  const maxBottom = Math.max(
    ...activeObjects.map((obj) => obj.top + obj.getScaledHeight())
  );
  activeObjects.forEach((obj) => {
    const newTop = maxBottom - obj.getScaledHeight();
    obj.set({ top: newTop });
    obj.setCoords();
  });
  canvas.requestRenderAll();
};

// ====== Align Objects Center Horizontal ======
export const alignObjectsCenterHorizontal = (canvas: Canvas) => {
  const objs = canvas.getActiveObjects();
  if (objs.length < 2) return;
  // تحديد مركز التحديد الأفقي (محور X)
  const minLeft = Math.min(...objs.map((obj) => obj.left));
  const maxRight = Math.max(
    ...objs.map((obj) => obj.left + obj.getScaledWidth())
  );
  const centerX = (minLeft + maxRight) / 2;
  objs.forEach((obj) => {
    const newLeft = centerX - obj.getScaledWidth() / 2;
    obj.set({ left: newLeft });
    obj.setCoords();
  });
  canvas.requestRenderAll();
};

// ====== Align Objects Center Vertical ======
export const alignObjectsCenterVertical = (canvas: Canvas) => {
  const activeObjects = canvas.getActiveObjects();
  if (activeObjects.length < 2) return;
  // تحديد مركز التحديد العمودي (محور Y)
  const minTop = Math.min(...activeObjects.map((obj) => obj.top));
  const maxBottom = Math.max(
    ...activeObjects.map((obj) => obj.top + obj.getScaledHeight())
  );
  const centerY = (minTop + maxBottom) / 2;
  activeObjects.forEach((obj) => {
    const newTop = centerY - obj.getScaledHeight() / 2;
    obj.set({ top: newTop });
    obj.setCoords();
  });
  canvas.requestRenderAll();
};

// ====================== Distribute Objuects Horizontal ( Space between objects ) ====================== \\
export const distributeObjecsHorizontal = (canvas: Canvas) => {
  const activeObjects = canvas.getActiveObjects();
  if (activeObjects.length < 2) return;

  // use .slice() NOT .splice() to avoid mutating the original array
  // sort objects by their left position
  const sorted = activeObjects.slice().sort((a, b) => a.left - b.left);
  const minLeft = sorted[0].left;

  // the rightmost position of the last object
  const maxRight = sorted.reduce(
    (max, obj) => Math.max(max, obj.left + obj.getScaledWidth()),
    sorted[0].left + sorted[0].getScaledWidth() // this line: initial Value for .reduce()
  );

  // sum of total width of all objects
  // and we use .reduce() to sum up the widths
  // we use getScaledWidth() to account for scaling
  const totalWidth = sorted.reduce((sum, obj) => sum + obj.getScaledWidth(), 0);

  // the spacing needed to distribute them evenly ( Space between objects )
  const spacing = (maxRight - minLeft - totalWidth) / (sorted.length - 1);

  // Distribute objects horizontally
  // we use .forEach() to iterate over the sorted objects
  // currentX starts from minLeft and increases by the width of each object + spacing
  let currentX = minLeft;
  sorted.forEach((obj) => {
    obj.set({ left: currentX });
    obj.setCoords();
    // update currentX for the next object
    // currentX = currentX + obj.getScaledWidth() + spacing;
    currentX += obj.getScaledWidth() + spacing;
  });
  canvas.requestRenderAll();
};

// ====================== Distribute Objuects Vertical( Space between objects ) ====================== \\
export const distributeObjectsVertical = (canvas: Canvas) => {
  const activeObjects = canvas.getActiveObjects();
  if (activeObjects.length < 2) return;
  const sorted = activeObjects.slice().sort((a, b) => a.top - b.top);
  const minTop = sorted[0].top;
  const maxBottom = sorted.reduce(
    (max, obj) => Math.max(max, obj.top + obj.getScaledHeight()),
    sorted[0].top + sorted[0].getScaledHeight()
  );
  const totalHeight = sorted.reduce(
    (sum, obj) => sum + obj.getScaledHeight(),
    0
  );
  const spacing = (maxBottom - minTop - totalHeight) / (sorted.length - 1);
  let currentY = minTop;
  sorted.forEach((obj) => {
    obj.set({ top: currentY });
    obj.setCoords();
    currentY += obj.getScaledHeight() + spacing;
  });
  canvas.requestRenderAll();
};

// -------------------------------- Stroke Shapes -------------------------------- //
export const addEmptyShape = (
  canvas: Canvas,
  type: "rect" | "circle" | "triangle" | "star",
  strokeColor: string = "#2d90f2"
) => {
  const id = uuidv4();

  let shape: FabricObject;

  switch (type) {
    case "rect":
      shape = new Rect({
        left: 100,
        top: 100,
        width: 100,
        height: 100,
        fill: "transparent",
        stroke: strokeColor,
        strokeWidth: 2,
        selectable: true,
      });
      break;

    case "circle":
      shape = new Circle({
        left: 100,
        top: 100,
        radius: 50,
        fill: "transparent",
        stroke: strokeColor,
        strokeWidth: 2,
        selectable: true,
      });
      break;

    case "triangle":
      shape = new Triangle({
        left: 100,
        top: 100,
        width: 100,
        height: 100,
        fill: "transparent",
        stroke: strokeColor,
        strokeWidth: 2,
        selectable: true,
      });
      break;

    case "star":
      const centerX = 100;
      const centerY = 100;
      const outerRadius = 50;
      const innerRadius = 20;
      const points: { x: number; y: number }[] = [];

      for (let i = 0; i < 10; i++) {
        const angle = (i * Math.PI) / 5; // 36 درجة كل نقطة
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        points.push({ x, y });
      }

      shape = new Polygon(points, {
        left: centerX - outerRadius,
        top: centerY - outerRadius,
        fill: "transparent",
        stroke: strokeColor,
        strokeWidth: 2,
        selectable: true,
      });
      break;
    default:
      console.error("Unsupported shape type");
      return;
  }

  shape.set({ id });
  canvas.add(shape);
  canvas.setActiveObject(shape);
  canvas.requestRenderAll();
};

export const getVideoBlobFromIndexedDB = async (
  id: string
): Promise<Blob | null> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("canvasDB", 1);

    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction("videos", "readonly");
      const store = tx.objectStore("videos");
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        resolve(getRequest.result?.blob ?? null);
      };
      getRequest.onerror = () => {
        reject(getRequest.error);
      };
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

export async function replaceVideoPlaceholders(canvas: Canvas) {
  const objects = canvas.getObjects();

  for (const obj of objects) {
    if ((obj as any).type === "video" && (obj as any).id) {
      const id = (obj as any).id;
      const blobURL = await getVideoBlobURL(id);

      if (blobURL) {
        const fabricVideo = new FabricVideo(
          blobURL,
          {
            left: obj.left,
            top: obj.top,
            scaleX: obj.scaleX,
            scaleY: obj.scaleY,
          },
          id
        ); // مرر id هنا كوسيلة تعريف

        canvas.remove(obj);
        canvas.add(fabricVideo);
      }
    }
  }

  canvas.requestRenderAll();
}

// ======================  Group Selection  ====================== //
export const groupSelectedObjects = (canvas: Canvas) => {
  const activeObjects = canvas.getActiveObjects();
  if (!canvas) return;

  if (activeObjects.length > 1) {
    const group = new Group(activeObjects);
    canvas.discardActiveObject(); // Remove Old Selection
    activeObjects.forEach((obj) => canvas.remove(obj));
    canvas.add(group);
    canvas.setActiveObject(group);
    canvas.requestRenderAll();
  }
};
// ======================  Un-Group Selection  ====================== //
export const ungroupSelectedObject = (canvas: Canvas) => {
  const activeObject = canvas.getActiveObject();

  if (!activeObject || activeObject.type !== "group") return;

  const group = activeObject as Group;
  const items = group._objects;

  const groupMatrix = group.calcTransformMatrix(); // مصفوفة تحويل الجروب
  canvas.remove(group);

  items.forEach((item) => {
    const itemMatrix = item.calcTransformMatrix();
    const combinedMatrix = fabric.util.multiplyTransformMatrices(
      groupMatrix,
      itemMatrix
    );

    const newPoint = new Point(0, 0).transform(combinedMatrix);

    item.set({
      left: newPoint.x,
      top: newPoint.y,
      angle: (item.angle ?? 0) + (group.angle ?? 0),
      scaleX: (item.scaleX ?? 1) * (group.scaleX ?? 1),
      scaleY: (item.scaleY ?? 1) * (group.scaleY ?? 1),
      originX: "left",
      originY: "top",
    });

    item.group = undefined;
    item.setCoords();
    canvas.add(item);
  });

  canvas.discardActiveObject();
  canvas.requestRenderAll();
};

// ======================  Hide / View  ====================== //
export const toggleVisibility = (object: FabricObject, canvas: Canvas) => {
  object.visible = !object.visible;
  canvas.requestRenderAll();

  updateLayers(canvas); // Update UI
  safePushState(canvas); // Save Changes in History / localStorage
};

// ======================  Toggle Lock  ====================== //
export const toggleLock = (object: FabricObject, canvas: Canvas) => {
  const shouldLock = object.selectable; // If the object is currently selectable → we should lock it

  // 1. Update lock/unlock properties
  object.selectable = !shouldLock; // Prevent mouse selection
  object.evented = !shouldLock; // Disable interactions (e.g. drag, click)
  object.lockMovementX = shouldLock; // Lock movement on X axis
  object.lockMovementY = shouldLock; // Lock movement on Y axis
  object.hasControls = !shouldLock; // Hide resize/rotate handles
  object.hasBorders = !shouldLock; // Hide selection borders

  // 2. Ensure canvas allows object selection in general
  canvas.selection = true;

  // 3. Re-register the object to force Fabric to rebind interactions
  canvas.discardActiveObject(); // Deselect any active object
  canvas.remove(object); // Temporarily remove the object
  canvas.add(object); // Re-add it to the canvas (at the same position)
  canvas.setActiveObject(object); // Set it back as the active object

  // 4. Force redraw and interaction refresh
  object.dirty = true; // Mark the object as "dirty" to trigger rerender
  canvas.renderAll();
  canvas.requestRenderAll();

  // 5. Fire a manual modification event (in case listeners are watching)
  canvas.fire("object:modified", { target: object });

  // 6. Update the layers list (e.g., sidebar UI via Zustand store)
  updateLayers(canvas);
};

// ======================  Snap to grid  ====================== //
const handleObjectMoving = (e: { target: FabricObject }) => {
  const obj = e.target;
  if (!obj || !useCanvasStore.getState().snapEnabled) return;

  const gridSize = 20;
  obj.set({
    left: Math.round((obj.left ?? 0) / gridSize) * gridSize,
    top: Math.round((obj.top ?? 0) / gridSize) * gridSize,
  });
};

const handleObjectScaling = (e: { target: FabricObject }) => {
  const obj = e.target;
  if (!obj || !useCanvasStore.getState().snapEnabled) return;

  const gridSize = 20;
  obj.set({
    left: Math.round((obj.left ?? 0) / gridSize) * gridSize,
    top: Math.round((obj.top ?? 0) / gridSize) * gridSize,
  });
};

export const EnableSnapToGrid = (canvas: Canvas) => {
  // const gridSize = 20;
  if (!canvas) return;

  // ✅ امسح أي listeners قديمة قبل تضيف جديد
  canvas.off("object:moving", handleObjectMoving);
  canvas.off("object:scaling", handleObjectScaling);

  canvas.on("object:moving", handleObjectMoving);
  canvas.on("object:scaling", handleObjectScaling);
};

// ======================  Draw Grid Lines  ====================== //
export const drawGridLines = (
  canvas: Canvas,
  gridSize: number = 20,
  color: string = "#eee"
) => {
  const width = canvas.getWidth();
  const height = canvas.getHeight();

  // Remove old grid lines
  const existingLines = canvas
    .getObjects("line")
    .filter((line) => (line as any).isGridLine);
  existingLines.forEach((line) => canvas.remove(line));

  // Helper to create line
  const createGridLine = (points: [number, number, number, number]) =>
    new Line(points, {
      stroke: color,
      strokeWidth: 1,
      selectable: false,
      evented: false,
      excludeFromExport: true,
      hoverCursor: "default",
    });

  // Vertical Lines
  for (let x = 0; x <= width; x += gridSize) {
    const vertical = createGridLine([x, 0, x, height]);
    (vertical as any).isGridLine = true;
    canvas.add(vertical);
    (vertical as any).sendToBack?.();
  }

  // Horizontal Lines
  for (let y = 0; y <= height; y += gridSize) {
    const horizontal = createGridLine([0, y, width, y]);
    (horizontal as any).isGridLine = true;
    canvas.add(horizontal);
    (horizontal as any).sendToBack?.();
  }

  canvas.requestRenderAll();
};

// ======================  Zoom in / out / resset  ====================== //
export const zoomIn = (canvas: Canvas, step = 0.1, max = 3) => {
  if (!canvas) return;
  const zoom = canvas.getZoom();
  const newZoom = Math.min(zoom + step, max);
  canvas.zoomToPoint(
    new Point(canvas.getWidth() / 2, canvas.getHeight() / 2),
    newZoom
  );
};

export const zoomOut = (canvas: Canvas, step = 0.1, min = 0.2) => {
  if (!canvas) return;
  const zoom = canvas.getZoom();
  const newZoom = Math.max(zoom - step, min);
  canvas.zoomToPoint(
    new Point(canvas.getWidth() / 2, canvas.getHeight() / 2),
    newZoom
  );
};
