import { create } from "zustand";
import { CanvasStoreProps, Layer } from "@/types/canvas.types";
import { Canvas } from "fabric";
import type {
  FontStyleType,
  FontWeightType,
  TextAlignType,
} from "@/types/canvas.types";
import { replaceVideoPlaceholders } from "@/utils/canvasUtils";

// Helper: convert canvas state to JSON with required properties
const exportCanvasState = (canvas: Canvas) => canvas.toJSON();

export const useCanvasStore = create<CanvasStoreProps>((set, get) => ({
  // ----- STATE -----
  canvas: null,

  canvasHistory: [],
  historyIndex: -1,

  undoStack: [],
  redoStack: [],

  isRestoring: false,

  // grid lines
  gridEnabled: false,
  toggleGrid: () => set((state) => ({ gridEnabled: !state.gridEnabled })),

  // Snap to grid
  snapEnabled: false,
  toggleSnap: () => set((state) => ({ snapEnabled: !state.snapEnabled })),

  // ----- Background color of the canvas ----- \\
  bgColor: "#075B5E",
  setBgColor: (color: string) => {
    set({ bgColor: color });
    localStorage.setItem("canvasBgColor", color);
  },

  // ----- Fill Color of the selected object on canvas ----- \\
  fillColor: "#F2E2B1",
  setFillColor: (color: string) => {
    set({ fillColor: color });
  },

  // ----- Stroke Color of the selected object on canvas ----- \\
  strokeColor: "#F2E2B1",
  setStrokeColor: (color: string) => {
    set({ strokeColor: color });
  },

  // ----- Opacity ----- \\
  opacity: 1,
  setOpacity: (value: number) => {
    set({ opacity: value });
  },

  // ----- Clicked Shape on Canvas ----- \\
  layers: [],
  selectedLayerId: null, // ID of the currently selected layer

  // Re-name layer in [ layer list - the Canvas ]
  renameLayer: (id: string, newName: string) => {
    set((state) => {
      // Update layer name in layer list [left side bar]
      const updatedLayers = state.layers.map((layer) =>
        layer.id === id ? { ...layer, name: newName } : layer
      );

      // Update the name of Object.name in the Canvas it self
      const canvas = state.canvas;
      if (canvas) {
        const object = canvas.getObjects().find((obj: any) => obj.id === id);
        if (object) {
          object.name = newName; // VIP
        }
      }

      return { layers: updatedLayers };
    });
  },

  // ----- Selected Object ----- \\
  selectedObject: null,
  setSelectedObject: (obj) => set({ selectedObject: obj }),

  // ----- Border Radius ----- \\
  borderRadius: 0,
  setBorderRadius: (value) => set({ borderRadius: value }),

  // ----- Canvas Dimensions ----- \\
  dimensions: { width: "", height: "" },
  setDimensions: (dims) => set({ dimensions: dims }),

  // ----- Canvas Size : Width / Height ----- \\
  customWidth: 800,
  customHeight: 800,
  setCustomSize: (width, height) =>
    set({ customWidth: width, customHeight: height }),

  // ----- Canvas Scale ----- \\
  scale: 1,
  setScale: (scale) => set({ scale }),
  //  setScale: (value) => set({ scale: value }),

  // Scale *2 MAX
  zoomIn: () => {
    const newScale = Math.min(get().scale + 0.1, 2);
    set({ scale: parseFloat(newScale.toFixed(2)) });
  },

  // Scale * 0.1 MIN
  zoomOut: () => {
    const newScale = Math.max(get().scale - 0.1, 0.1);
    set({ scale: parseFloat(newScale.toFixed(2)) });
  },

  // Reset Scale
  resetScale: () => set({ scale: 1 }),

  // ----- Text ----- \\
  text: "",
  setText: (text: string) => set({ text }),

  fontSize: 16,
  setFontSize: (size: number) => set({ fontSize: size }),

  fontFamily: "Inter",
  setFontFamily: (family: string) => set({ fontFamily: family }),

  fontWeight: "normal" as FontWeightType,
  setFontWeight: (weight: FontWeightType) => set({ fontWeight: weight }),

  fontStyle: "normal" as FontStyleType,
  setFontStyle: (style: FontStyleType) => set({ fontStyle: style }),

  textAlign: "left" as TextAlignType,
  setTextAlign: (align: TextAlignType) => set({ textAlign: align }),

  underline: false,
  setUnderline: (val: boolean) => set({ underline: val }),

  linethrough: false,
  setLinethrough: (val: boolean) => set({ linethrough: val }),

  // ----- GETTERS -----
  getCanvas: () => get().canvas,

  // ----- CORE METHODS -----

  // Save the initial state of the canvas to history or ( to store)
  setCanvas: (canvas) => {
    set({ canvas }); // put canvas in state

    if (canvas) {
      const json = exportCanvasState(canvas); // Export Current State as JSON
      set({
        canvasHistory: [json], // Start The History
        historyIndex: 0,
      });
    } else {
      // Reset canvas history [Clear Canvas]
      set({
        canvasHistory: [],
        historyIndex: -1,
        undoStack: [],
        redoStack: [],
      });
    }
  },

  // Saves the current canvas state into the history,
  // but only if it's different from the latest one (to avoid duplicates).
  // Skips saving during undo/redo operations.
  pushState: () => {
    const { canvas, canvasHistory, historyIndex, isRestoring } = get();
    if (!canvas || isRestoring) return;

    const json = exportCanvasState(canvas);

    const currentJson = canvasHistory[historyIndex];

    const normalize = (json: unknown) => JSON.stringify(json);

    if (normalize(json) === normalize(currentJson)) return;

    const newHistory = [...canvasHistory.slice(0, historyIndex + 1), json];

    set({
      canvasHistory: newHistory,
      historyIndex: newHistory.length - 1,
    });

    localStorage.setItem("canvasHistory", JSON.stringify(newHistory));
    localStorage.setItem("historyIndex", JSON.stringify(newHistory.length - 1));
  },

  // Adds a new state to the history **only if** we're not currently restoring (undo/redo).
  // This prevents pushState from interfering with undo/redo operations.
  safePushState: () => {
    const { isRestoring, pushState } = get();
    if (!isRestoring) pushState();
  },

  undo: () => {
    const { historyIndex, canvasHistory, canvas } = get();
    if (!canvas || historyIndex <= 0) return;

    set({ isRestoring: true });

    const newIndex = historyIndex - 1;
    canvas.loadFromJSON(canvasHistory[newIndex], async () => {
      canvas.getObjects().forEach((obj) => obj.setCoords());
      await replaceVideoPlaceholders(canvas); // 🟡 أضف دي
      canvas.requestRenderAll();
      set({ historyIndex: newIndex, isRestoring: false });
    });

    canvas.requestRenderAll();
  },

  redo: () => {
    const { historyIndex, canvasHistory, canvas } = get();
    if (!canvas || historyIndex >= canvasHistory.length - 1) return;

    set({ isRestoring: true });

    const newIndex = historyIndex + 1;
    canvas.loadFromJSON(canvasHistory[newIndex], async () => {
      canvas.getObjects().forEach((obj) => obj.setCoords());
      await replaceVideoPlaceholders(canvas); // 🟡 أضف دي
      canvas.requestRenderAll();
      set({ historyIndex: newIndex, isRestoring: false });
    });

    canvas.requestRenderAll();
  },

  resetHistory: () => {
    const canvas = get().canvas;
    if (!canvas) return;

    const json = exportCanvasState(canvas);
    set({
      canvasHistory: [json],
      historyIndex: 0,
      redoStack: [],
      undoStack: [],
    });
  },

  // ----- LAYERS ----- \\
  setLayers: (layers: Layer[]) => {
    set({ layers });
  },

  setSelectedLayerId: (id) => {
    set({ selectedLayerId: id });
  },

  // ----- RESTORE CANVAS FROM STORAGE ----- \\
  // This method restores the canvas from localStorage on application load
  // or Refresh or when needed
  restoreCanvasFromStorage: async () => {
    const { canvas, applySavedBgColor } = get();
    if (!canvas) return;

    const history = localStorage.getItem("canvasHistory");
    const index = localStorage.getItem("historyIndex");

    if (history && index !== null) {
      const parsedHistory = JSON.parse(history);
      const parsedIndex = JSON.parse(index);

      if (parsedHistory.length > 0) {
        canvas.loadFromJSON(parsedHistory[parsedIndex], async () => {
          canvas.getObjects().forEach((obj) => obj.setCoords());

          // ✅ استبدال الفيديوهات بعد التحميل
          await replaceVideoPlaceholders(canvas);

          set({
            canvasHistory: parsedHistory,
            historyIndex: parsedIndex,
          });

          applySavedBgColor();
          canvas.requestRenderAll();
        });
      }
    }
  },

  // ----- Background Color ----- \\
  applySavedBgColor: () => {
    const { canvas, setBgColor } = get();
    const savedColor = localStorage.getItem("canvasBgColor");

    if (!canvas || !savedColor) return;

    canvas.backgroundColor = savedColor;
    canvas.requestRenderAll();

    setBgColor(savedColor); // Update Color In Zustand Also
  },
}));
