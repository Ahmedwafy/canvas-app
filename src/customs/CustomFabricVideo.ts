import { classRegistry, FabricObject } from "fabric";
import { getVideoBlobURL } from "@/utils/indexedDB";

export class FabricVideo extends FabricObject {
  videoEl: HTMLVideoElement;
  id: string;

  constructor(
    videoSrc: string,
    options: Partial<FabricObject> = {},
    id?: string
  ) {
    super(options);
    this.id = id || crypto.randomUUID();

    this.videoEl = document.createElement("video");
    this.videoEl.src = videoSrc;
    this.videoEl.autoplay = true;
    this.videoEl.loop = true;
    this.videoEl.muted = true;
    this.videoEl.playsInline = true;

    this.set({
      width: this.videoEl.videoWidth || 300,
      height: this.videoEl.videoHeight || 200,
    });

    this.videoEl.addEventListener("loadeddata", () => {
      this.set({
        width: this.videoEl.videoWidth,
        height: this.videoEl.videoHeight,
      });
    });
  }

  getElement() {
    return this.videoEl;
  }

  _render(ctx: CanvasRenderingContext2D) {
    if (this.videoEl.readyState >= 2) {
      ctx.drawImage(
        this.videoEl,
        -this.width! / 2,
        -this.height! / 2,
        this.width!,
        this.height!
      );
    }
  }

  // Convert Objects into JSON  [toObject()]
  toObject(propertiesToInclude?: string[]) {
    // final result when Object converts to JSON
    // this Object will go to fromObject(object)
    return {
      ...super.toObject(propertiesToInclude),
      type: "video",
      id: this.id,
      src: this.videoEl.src,
    };
  }

  // Convert JSON into Objects [fromObject()]
  static async fromObject(object: any, options?: any): Promise<FabricVideo> {
    const videoURL = await getVideoBlobURL(object.id);
    if (!videoURL) throw new Error("Video not found in IndexedDB");

    const video = new FabricVideo(videoURL, object, object.id);
    return video;
  }
}

// ✅ تسجيل الكلاس
classRegistry.setClass(FabricVideo, "video");
