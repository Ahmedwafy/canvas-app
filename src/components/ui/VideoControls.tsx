"use client";
import { useEffect, useState } from "react";
import { useCanvasStore } from "@/store/canvasStore";
import { FabricVideo } from "@/customs/CustomFabricVideo";
import { Play, Pause, MonitorStop } from "lucide-react";

export default function VideoControls() {
  const canvas = useCanvasStore((state) => state.canvas);
  const [selectedVideo, setSelectedVideo] = useState<FabricVideo | null>(null);

  useEffect(() => {
    if (!canvas) return;

    const handleSelection = () => {
      const active = canvas.getActiveObject();
      if (active instanceof FabricVideo && active.getElement()) {
        setSelectedVideo(active);
      } else {
        setSelectedVideo(null);
      }
    };

    canvas.on("selection:created", handleSelection);
    canvas.on("selection:updated", handleSelection);
    canvas.on("selection:cleared", () => setSelectedVideo(null));

    return () => {
      canvas.off("selection:created", handleSelection);
      canvas.off("selection:updated", handleSelection);
      canvas.off("selection:cleared", () => setSelectedVideo(null));
    };
  }, [canvas]);

  const startRenderLoop = () => {
    const render = () => {
      if (
        selectedVideo &&
        selectedVideo.getElement() &&
        !selectedVideo.getElement().paused &&
        !selectedVideo.getElement().ended
      ) {
        canvas?.requestRenderAll();
        requestAnimationFrame(render);
      }
    };
    render();
  };

  const handlePlay = () => {
    const selected = canvas?.getActiveObject();
    if (!selected) return;

    if (selected instanceof FabricVideo) {
      const videoEl = selected.getElement();
      videoEl?.play?.();
      startRenderLoop();
    }
  };

  const handlePause = () => {
    selectedVideo?.getElement()?.pause();
  };

  const handleStop = () => {
    const videoEl = selectedVideo?.getElement();
    if (videoEl) {
      videoEl.pause();
      videoEl.currentTime = 0;
      canvas?.requestRenderAll();
    }
  };

  const active = canvas?.getActiveObject();
  const canControlVideo = active instanceof FabricVideo && active.getElement();

  return (
    <div className="flex gap-2 mt-4">
      {canControlVideo && (
        <>
          <button onClick={handlePlay} disabled={!selectedVideo}>
            <Play />
            <span>Play</span>
          </button>
          <button onClick={handlePause} disabled={!selectedVideo}>
            <Pause />
            <span>Pause</span>
          </button>
          <button onClick={handleStop} disabled={!selectedVideo}>
            <MonitorStop />
            <span>Stop</span>
          </button>
        </>
      )}
    </div>
  );
}
