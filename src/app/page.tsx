// import HomePage from "@/components/HomePage";

// export default function Page() {
//   return (
//     <main className="p-2">
//       {/* <h1 className="text-2xl font-bold mb-4">Figma Clone – Canvas</h1> */}
//       <HomePage />
//     </main>
//   );
// }
// src/app/page.tsx
// import HomePage from "@/components/HomePage";
import CanvasEditor from "@/components/CanvasEditor";
import "./globals.css";

export default function Page() {
  return (
    <main className="p-2">
      <CanvasEditor />
    </main>
  );
}
