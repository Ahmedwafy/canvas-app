"use client";
import { useCanvasStore } from "@/store/canvasStore";
import { FabricImage, FabricObject } from "fabric";
import { Image } from "lucide-react";
import { useState } from "react";

const btnStyle2 =
  "bg-gray-200 md:h-32 py-5 border-b-4 lg:h-8 min-w-[99%] mx-auto rounded-lg flex items-center justify-center text-black shadow hover:scale-105 transition-transform duration-200 ease-out";

const UploadPhoto = () => {
  const canvas = useCanvasStore((state) => state.canvas);
  const [toggleOptions, setToggleOptions] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (f) {
      const data = f.target?.result as string;
      FabricImage.fromURL(data).then((img) => {
        img.set({
          left: 100,
          top: 100,
          selectable: true,
        });

        canvas?.add(img as FabricObject);
        canvas?.setActiveObject(img as FabricObject);
        canvas?.renderAll();
      });
    };

    reader.readAsDataURL(file);
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
          {/* the next line is to STOP esLint to think <Image /> is a HTML element */}
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image className="text-gray-600" />
        </button>
      </div>
      {toggleOptions && (
        <div className="flex flex-col p-2">
          <input type="file" accept="image/*" onChange={handleImageUpload} />
        </div>
      )}
    </div>
  );
};

export default UploadPhoto;
