import { useCanvasStore } from "@/store/canvasStore";

// export const updateScale = () => {
//   const wrapper = document.getElementById("canvas-wrapper");
//   const canvas = useCanvasStore.getState().canvas;

//   if (!wrapper || !canvas) return;

//   const wrapperWidth = wrapper.clientWidth - 20;
//   const wrapperHeight = wrapper.clientHeight - 20;

//   const canvasWidth = canvas.getWidth();
//   const canvasHeight = canvas.getHeight();

//   const widthScale = wrapperWidth / canvasWidth;
//   const heightScale = wrapperHeight / canvasHeight;

//   const newScale = Math.min(widthScale, heightScale, 1);
//   useCanvasStore.getState().setScale(newScale); // أو setScale(newScale) لو تستخدم useState
// };

export const updateScale = () => {
  const wrapper = document.getElementById("canvas-wrapper");
  const { customWidth, customHeight, setScale } = useCanvasStore.getState();
  if (!wrapper) return;

  const w = wrapper.clientWidth;
  const h = wrapper.clientHeight;
  if (w < 100 || h < 100) {
    setTimeout(updateScale, 50);
    return;
  }

  const final = Math.min(w / customWidth, h / customHeight);
  setScale(final);
};
