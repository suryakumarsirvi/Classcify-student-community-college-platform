import React from "react";
import NotFoundGif from "@/assets/images/404.gif"; // ✅ Import the GIF

const NotFound = () => {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-zinc-50 overflow-hidden">
      <div className="w-screen h-screen bg-amber-400 flex items-center justify-center">
        <img src={NotFoundGif} alt="404" className="w-full max-w-[100vw] object-fit" />
      </div>
      {/* Use imported GIF */}
      <div className="absolute top-[70%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 leading-48 tracking-tight">
        <h1 className="text-[200px] font-bold text-[#1c49ea] text-center pt-20">
          404
        </h1>
        <h2 className="text-5xl font-bold text-[#1c49ea] text-center">
          Page Not Found
        </h2>
      </div>
    </div>
  );
};

export default NotFound;
