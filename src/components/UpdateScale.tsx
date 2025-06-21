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
  const canvasWrapper = document.getElementById("canvas-wrapper");
  const { customWidth, customHeight, setScale } = useCanvasStore.getState();

  if (!canvasWrapper) return;

  const wrapperW = canvasWrapper.clientWidth;
  const wrapperH = canvasWrapper.clientHeight;

  // ✅ تأكد إن الـ wrapper ليه حجم فعلي
  if (wrapperW < 100 || wrapperH < 100) {
    setTimeout(updateScale, 50); // استنى لغاية ما يترندر كويس
    return;
  }

  const scaleX = wrapperW / customWidth;
  const scaleY = wrapperH / customHeight;

  const finalScale = Math.min(scaleX, scaleY);
  setScale(finalScale);
};
