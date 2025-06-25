// ========  types/canvas.types.ts  ================
import { FabricObject, Canvas, Textbox } from "fabric";

// to have the properties recognized on the instance and in the constructor
declare module "fabric" {
  interface Object {
    id?: string;
    name?: string;
  }
}

// ========  Right SideBar Props Types ========
export interface RightSideBarProps {
  canvas: Canvas | null;
  brushWidth: number;
  // onDuplicate: () => void;
  // onMoveUp: () => void;
  // onMoveDown: () => void;
  // onMoveToFront: () => void;
  // onMoveToBack: () => void;
  // onDelete: () => void;
  // onSaveImage: () => void;
}

export interface LayerOrderProps {
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onMoveToFront: () => void;
  onMoveToBack: () => void;
  onDelete: () => void;
  onSaveImage: () => void;
}

// Define a type for your canvas element with the custom property
export type FabricCanvasElement = HTMLCanvasElement & {
  _fabricInitialized?: boolean;
  _fabricCanvasInstance?: unknown;
};

// ========  types/toolbar.types.ts  ========
export interface ToolbarProps {
  brushWidth: number;
  onAddRect: () => void;
  onAddStar: () => void;
  onAddCircle: () => void;
  onAddLine: () => void;
  onAddTriangle: () => void;
  onDisableFreeDrawing: (canvas: Canvas) => void;
  onAddText: () => void;
  onChangeTextAlign?: (align: "left" | "center" | "right" | "justify") => void;
  currentText?: Textbox | null;
  onChangeFontFamily?: (font: string) => void;
  onChangeFontWeight?: (weight: string) => void;
  onChangeTextDecoration?: (decoration: string) => void;
  onChangeFontStyle?: (style: string) => void;
  onChangeFontSize?: (size: number) => void;
  onChangeText?: (value: string) => void;
  // selectedText: Textbox | null;
  onEnableFreeDrawing: (canvas: Canvas, color: string, width: number) => void;
}

// ========  Canvas Store Props  ========
export interface Layer {
  id: string | undefined;
  name: string;
  type: string;
  object?: FabricObject;
  // metadata?: Record<string, any>; // Optional metadata for additional information
}

// ====== Canvas Store Props ======
export type TextAlignType = "left" | "center" | "right" | "justify";
export type FontWeightType = "normal" | "bold" | "lighter" | number | undefined;
export type FontStyleType = "normal" | "italic";

export interface CanvasStoreProps {
  canvas: Canvas | null;
  setCanvas: (canvas: Canvas | null) => void;

  renameLayer: (id: string, newName: string) => void;

  // grid lines
  gridEnabled: boolean;
  toggleGrid: () => void;

  // snap to grid
  snapEnabled: boolean;
  toggleSnap: () => void;

  customWidth: number;
  customHeight: number;
  setCustomSize: (width: number, height: number) => void;

  selectedObject: FabricObject | null;
  setSelectedObject: (obj: FabricObject | null) => void;

  opacity: number;
  setOpacity: (value: number) => void;

  selectedLayerId: string | null;
  setSelectedLayerId: (id: string | null) => void;

  bgColor: string;
  setBgColor: (color: string) => void;

  fillColor: string;
  setFillColor: (color: string) => void;

  strokeColor: string;
  setStrokeColor: (color: string) => void;

  borderRadius: number;
  setBorderRadius: (value: number) => void;

  scale: number;
  setScale: (value: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetScale: () => void;

  resetHistory: () => void;
  canvasHistory: FabricObject[][];
  historyIndex: number;
  safePushState: () => void;
  undo: () => void;
  redo: () => void;
  isRestoring: boolean;
  getCanvas: () => Canvas | null;
  undoStack: string[];
  redoStack: string[];
  layers: Layer[];
  pushState: () => void;
  saveState?: () => void;
  setLayers: (layers: Layer[]) => void;
  restoreCanvasFromStorage: () => void;
  applySavedBgColor: () => void;

  dimensions: Dimensions;
  setDimensions: (dims: Dimensions) => void;

  text: string;
  setText: (text: string) => void;

  fontSize: number | string;
  setFontSize: (size: number) => void;

  fontFamily: string;
  setFontFamily: (family: string) => void;

  fontWeight: FontWeightType;
  setFontWeight: (weight: FontWeightType) => void;

  fontStyle: FontStyleType;
  setFontStyle: (style: FontStyleType) => void;

  textAlign: TextAlignType;
  setTextAlign: (align: TextAlignType) => void;

  underline: boolean;
  setUnderline: (val: boolean) => void;

  linethrough: boolean;
  setLinethrough: (val: boolean) => void;
}

// ====== CanvasSizeSelector ======
export interface SizeSelectorProps {
  onSizeChange: (width: number, height: number) => void;
}

// ====== Keyboard Short Cut ======
export type KeyboardShortcutsProps = {
  canvas: Canvas;
  undo: () => void;
  redo: () => void;
};

// ====== Dimensions ======
export type Dimensions = {
  width: string;
  height: string;
};
// ====== Radius Slider Props ======
export interface RadiusSliderProps {
  canvas: Canvas;
}
