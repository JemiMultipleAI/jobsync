"use client";

import { useEffect, useRef } from "react";

export default function AutoSlider({ children}) {
  const containerRef = useRef(null);

 

  return (
    <div className="overflow-hidden">
      <div
        ref={containerRef}
        className="flex whitespace-nowrap animate-scroll gap-4"
        style={{ scrollBehavior: "smooth" }}
      >
        {children}
        {children}
      </div>
    </div>
  );
}
