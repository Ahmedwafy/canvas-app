"use client";
import {
  BringToFront,
  SendToBack,
  ArrowBigDownDash,
  ArrowBigUpDash,
  Copy,
  Trash2,
  Download,
} from "lucide-react";
import {
  duplicateSelectedObject,
  moveObjectUp,
  moveObjectDown,
  moveObjectToFront,
  moveObjectToBack,
  deleteSelected,
  // saveAsImage,
} from "@/utils/canvasUtils";
import { useCanvasStore } from "@/store/canvasStore";
import DownloadMenu from "./DownloadMenu";
import { useState } from "react";

const btnStyle =
  "bg-gray-200 py-1 rounded-lg flex flex-1 items-center justify-center text-black shadow hover:scale-105 transition-transform duration-200 ease-out";

const btnStyle2 =
  "bg-gray-200 md:h-32 py-5 border-b-4 lg:h-8 min-w-[99%] mt-2 mx-auto rounded-lg flex items-center justify-center text-black shadow hover:scale-105 transition-transform duration-200 ease-out";

const LayerOrder = () => {
  const canvas = useCanvasStore.getState().getCanvas();
  const id = useCanvasStore.getState().selectedLayerId;
  const [menu, setMenu] = useState(false);

  return (
    <div>
      <p className="mx-auto text-sm font-medium text-gray-700">
        Layers Order System
      </p>
      <div className="flex py-4 gap-2 border-b-4">
        <div className="flex flex-col flex-1 gap-2">
          <button
            onClick={() => canvas && id && moveObjectUp(canvas, id)}
            className={`${btnStyle}`}
          >
            <ArrowBigUpDash className="text-gray-600" />
          </button>

          <button
            onClick={() => canvas && id && moveObjectDown(canvas, id)}
            className={`${btnStyle}`}
          >
            <ArrowBigDownDash className="text-gray-600" />
          </button>

          <button
            onClick={() => canvas && duplicateSelectedObject(canvas)}
            className={`${btnStyle}`}
          >
            <Copy className="text-gray-600" />
          </button>
        </div>

        <div className="flex flex-col flex-1 gap-2">
          <button
            onClick={() => canvas && id && moveObjectToFront(canvas, id)}
            className={`${btnStyle}`}
          >
            <BringToFront className="text-gray-600" />
          </button>
          <button
            onClick={() => canvas && id && moveObjectToBack(canvas, id)}
            className={`${btnStyle}`}
          >
            <SendToBack className="text-gray-600" />
          </button>
          <button
            onClick={() => canvas && deleteSelected(canvas)}
            className={`${btnStyle}`}
          >
            <Trash2 className="text-gray-600" />
          </button>
        </div>
      </div>
      <div className="border-b-4 pb-2">
        <button
          className={btnStyle2}
          onClick={() => {
            setMenu(!menu);
          }}
        >
          <Download className="mx-auto text-gray-600" />
        </button>
        {menu && <DownloadMenu />}
      </div>
    </div>
  );
};

export default LayerOrder;
