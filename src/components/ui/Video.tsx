"use client";

import { useCanvasStore } from "@/store/canvasStore";
import { saveVideoBlob } from "@/utils/indexedDB";
import { FabricVideo } from "@/customs/CustomFabricVideo";
import { useState } from "react";
import { Video } from "lucide-react";

const btnStyle2 =
  "bg-gray-200 md:h-32 py-5 border-b-4 lg:h-8 min-w-[99%] mx-auto rounded-lg flex items-center justify-center text-black shadow hover:scale-105 transition-transform duration-200 ease-out";

const UploadVideoButton = () => {
  const canvas = useCanvasStore((state) => state.canvas);
  const [toggleOptions, setToggleOptions] = useState(false);

  const handleUploadVideo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !canvas) return;

    const videoId = crypto.randomUUID();
    await saveVideoBlob(videoId, file);

    const videoURL = URL.createObjectURL(file);

    const videoObj = new FabricVideo(
      videoURL,
      {
        left: 100,
        top: 100,
        selectable: true,
      },
      videoId
    );

    canvas.add(videoObj);

    const animate = () => {
      videoObj.set("dirty", true);
      canvas.requestRenderAll();
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  };

  return (
    <div className="flex flex-col">
      <div className="border-b-4 pb-2">
        <button
          className={`flex gap-2 text-sm font-medium text-gray-700 ${btnStyle2}`}
          onClick={() => {
            setToggleOptions(!toggleOptions);
          }}
        >
          Upload
          <Video className="text-gray-600" />
        </button>
      </div>
      {toggleOptions && (
        <div className="flex flex-col p-2">
          <input type="file" accept="video/*" onChange={handleUploadVideo} />
        </div>
      )}
    </div>
  );
};

export default UploadVideoButton;
