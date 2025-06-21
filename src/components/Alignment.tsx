import {
  //  -- group Align --
  AlignStartVertical,
  AlignEndVertical,
  AlignStartHorizontal,
  AlignEndHorizontal,
  AlignCenterHorizontal,
  AlignCenterVertical,
  // -----------
  // -- Single object alignments --
  // ArrowLeftToLine as AlignLeft,
  // ArrowRightToLine as AlignRight,
  // ArrowUpToLine as AlignTop,
  // ArrowDownToLine as AlignBottom,
  // -----------
  AlignHorizontalSpaceAround as AlignHorizontal,
  AlignVerticalSpaceAround as AlignVertical,
  StretchHorizontal,
  StretchVertical,

  // for text alignment
  //   AlignLeft,
  // -----------
} from "lucide-react";

// -- Single object alignments --
import { TbLayoutAlignLeft } from "react-icons/tb";
import { TbLayoutAlignRight } from "react-icons/tb";
import { TbLayoutAlignTop } from "react-icons/tb";
import { TbLayoutAlignBottom } from "react-icons/tb";

import {
  alignObjectLeft,
  alignObjectRight,
  alignObjectTop,
  alignObjectBottom,
  alignObjectCenterH,
  alignObjectVertical,
  alignObjectsLeft,
  alignObjectsRight,
  alignObjectsTop,
  alignObjectsBottom,
  alignObjectsCenterHorizontal,
  alignObjectsCenterVertical,
  distributeObjecsHorizontal as SpaceBetweenHorizontal,
  distributeObjectsVertical as SpaceBetweenVertical,
} from "@/utils/canvasUtils";
import { Canvas } from "fabric";
import { useCanvasStore } from "@/store/canvasStore";

const Alignment = () => {
  const canvas = useCanvasStore((state) => state.getCanvas());
  const activeObject = canvas?.getActiveObjects() || [];
  return (
    <section className="flex flex-col justify-between gap-2 border-b-4 pt-2 pb-3">
      <div className="flex justify-between">
        {/* Align Left  */}
        <TbLayoutAlignLeft
          size={25}
          className="text-gray-600 cursor-pointer hover:text-gray-600 transition-colors duration-200 ease-in-out"
          onClick={() => {
            alignObjectLeft(canvas as Canvas);
          }}
        />

        {/* Align Right */}
        <TbLayoutAlignRight
          onClick={() => {
            alignObjectRight(canvas as Canvas);
          }}
          size={25}
          className="text-gray-600 cursor-pointer hover:text-gray-600 transition-colors duration-200 ease-in-out"
        />

        {/* Align Top */}
        <TbLayoutAlignTop
          size={25}
          className="text-gray-600 cursor-pointer hover:text-gray-600 transition-colors duration-200 ease-in-out"
          onClick={() => {
            alignObjectTop(canvas as Canvas);
          }}
        />

        {/* Align Bottom */}
        <TbLayoutAlignBottom
          onClick={() => {
            alignObjectBottom(canvas as Canvas);
          }}
          size={25}
          className="text-gray-600 cursor-pointer hover:text-gray-600 transition-colors duration-200 ease-in-out"
        />

        {/* Align Center Horizontal */}
        <AlignHorizontal
          onClick={() => {
            alignObjectCenterH(canvas as Canvas);
          }}
          className="text-gray-600 cursor-pointer hover:text-gray-600 transition-colors duration-200 ease-in-out"
        />

        {/* Align Center Vertical */}
        <AlignVertical
          onClick={() => {
            alignObjectVertical(canvas as Canvas);
          }}
          className="text-gray-600 cursor-pointer hover:text-gray-600 transition-colors duration-200 ease-in-out"
        />
      </div>

      {/* ----------------------- Groups ----------------------- */}

      <div className="flex gap-2 justify-between">
        {/* Align Left Group */}
        <AlignStartVertical
          className={`${
            activeObject.length > 1
              ? "text-gray-600 cursor-pointer hover:text-gray-600 transition-colors duration-200 ease-in-out"
              : "text-gray-400 cursor-not-allowed"
          }`}
          onClick={() => {
            alignObjectsLeft(canvas as Canvas);
          }}
        />

        {/* Align Right Group */}
        <AlignEndVertical
          className={`${
            activeObject.length > 1
              ? "text-gray-600 cursor-pointer hover:text-gray-600 transition-colors duration-200 ease-in-out"
              : "text-gray-400 cursor-not-allowed"
          }`}
          onClick={() => {
            alignObjectsRight(canvas as Canvas);
          }}
        />

        {/* Align Group Start Horizontal - Align Top / Top = 0 */}
        <AlignStartHorizontal
          className={`${
            activeObject.length > 1
              ? "text-gray-600 cursor-pointer hover:text-gray-600 transition-colors duration-200 ease-in-out"
              : "text-gray-400 cursor-not-allowed"
          }`}
          onClick={() => {
            alignObjectsTop(canvas as Canvas);
          }}
        />

        {/* Align Group End Horizontal - Align Bottom / Bottom = 0 */}
        <AlignEndHorizontal
          className={`${
            activeObject.length > 1
              ? "text-gray-600 cursor-pointer hover:text-gray-600 transition-colors duration-200 ease-in-out"
              : "text-gray-400 cursor-not-allowed"
          }`}
          onClick={() => {
            alignObjectsBottom(canvas as Canvas);
          }}
        />
        <AlignCenterVertical
          className={`${
            activeObject.length > 1
              ? "text-gray-600 cursor-pointer hover:text-gray-600 transition-colors duration-200 ease-in-out"
              : "text-gray-400 cursor-not-allowed"
          }`}
          onClick={() => {
            alignObjectsCenterHorizontal(canvas as Canvas);
          }}
        />
        <AlignCenterHorizontal
          className={`${
            activeObject.length > 1
              ? "text-gray-600 cursor-pointer hover:text-gray-600 transition-colors duration-200 ease-in-out"
              : "text-gray-400 cursor-not-allowed"
          }`}
          onClick={() => {
            alignObjectsCenterVertical(canvas as Canvas);
          }}
        />
      </div>

      <div className="flex flex-col gap-2 ">
        <button
          className="flex items-center gap-2"
          onClick={() => {
            SpaceBetweenHorizontal(canvas as Canvas);
          }}
        >
          <StretchVertical />
          <h2>Stretch Horizontal</h2>
        </button>

        <button
          className="flex items-center gap-2"
          onClick={() => {
            SpaceBetweenVertical(canvas as Canvas);
          }}
        >
          <StretchHorizontal />
          <h2>Stretch Vertical</h2>
        </button>
      </div>
    </section>
  );
};

export default Alignment;
