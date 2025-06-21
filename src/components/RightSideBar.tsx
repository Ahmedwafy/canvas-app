"use client";
import Dimentions from "@/components/ui/Dimentions";
import RadiusSlider from "@/components/ui/RadiusSlider";
import FillColor from "@/components/ui/FillColor";
import StrokeColor from "@/components/ui/StrokeColor";
import Opacity from "@/components/ui/Opacity";
import LayerOrder from "@/components/ui/LayerOrder";
import Video from "@/components/ui/Video";
import Photo from "@/components/ui/photo";
import { useState } from "react";
import { MdOutlineSettings } from "react-icons/md";

const RightSideBar = () => {
  const [controls, setControls] = useState(false);

  return (
    <div className="absolute right-2 shadow ">
      <button
        onClick={() => setControls(!controls)}
        className="flex justify-center gap-2 w-[250px] h-10 text-[#4B5563] text-md font-bold bg-gray-300 mt-2 shadow rounded-lg py-2"
      >
        <MdOutlineSettings size={24} className="my-auto" />
        <span className="my-auto">Controls</span>
      </button>

      {controls ? (
        <section
          className={`${controls ? "h-auto" : null} 
          flex flex-col w-[250px] px-2 rounded-lg bg-gray-300 shadow mt-2 gap-2 max-sm:hidden select-none overflow-hidden`}
        >
          <Dimentions />
          <FillColor />
          <StrokeColor />
          <RadiusSlider />
          <Opacity />
          <LayerOrder />
          <Photo />
          <Video />
        </section>
      ) : null}
    </div>
  );
};

export default RightSideBar;
