"use client";
import { useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";

interface TipProps {
  text: string;
}

export default function Tip({ text }: TipProps) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const show = useCallback(() => {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    setPos({ x: r.left + r.width / 2, y: r.top });
  }, []);

  const hide = useCallback(() => setPos(null), []);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        className="text-gray-500 hover:text-gray-300 transition-colors shrink-0"
        aria-label="More info"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" />
        </svg>
      </button>
      {pos && typeof document !== "undefined" && createPortal(
        <div
          style={{
            position: "fixed",
            left: Math.max(8, Math.min(pos.x - 144, window.innerWidth - 296)),
            top: pos.y - 8,
            transform: "translateY(-100%)",
            zIndex: 99999,
            width: 288,
            pointerEvents: "none",
          }}
          className="rounded-lg bg-[#0e0e1a] border border-[#1e2d3d] p-3 shadow-xl"
        >
          <p className="text-xs text-gray-300 leading-relaxed">{text}</p>
        </div>,
        document.body
      )}
    </>
  );
}
