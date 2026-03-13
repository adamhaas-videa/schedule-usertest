import { useRef, useCallback, useEffect } from "react";
import {
  START_MINUTES,
  TOTAL_MINUTES,
  formatTimeLabel,
  clampTime,
  snapToIncrement,
} from "@/lib/timeline";

interface TimelineScrubberProps {
  snapshotTime: number;
  onTimeChange: (time: number) => void;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}

export default function TimelineScrubber({
  snapshotTime,
  onTimeChange,
  scrollContainerRef,
}: TimelineScrubberProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  // Forward wheel events to the scroll container so scrolling works over the scrubber area
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop += e.deltaY;
        e.preventDefault();
      }
    };
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [scrollContainerRef]);

  const ratioFromEvent = useCallback((clientY: number): number => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
  }, []);

  const timeFromRatio = useCallback((ratio: number): number => {
    return clampTime(Math.round(START_MINUTES + ratio * TOTAL_MINUTES));
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isDragging.current = true;
      onTimeChange(timeFromRatio(ratioFromEvent(e.clientY)));
    },
    [ratioFromEvent, timeFromRatio, onTimeChange]
  );

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (!isDragging.current) return;
      onTimeChange(timeFromRatio(ratioFromEvent(e.clientY)));
    }
    function handleMouseUp(e: MouseEvent) {
      if (!isDragging.current) return;
      isDragging.current = false;
      const time = timeFromRatio(ratioFromEvent(e.clientY));
      onTimeChange(snapToIncrement(clampTime(time)));
    }
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [ratioFromEvent, timeFromRatio, onTimeChange]);

  return (
    <div
      ref={containerRef}
      className="absolute left-0 top-0 bottom-0 w-[88px] z-20 cursor-pointer select-none"
      onMouseDown={handleMouseDown}
    >
      <div
        className="absolute left-2 right-0 flex items-center -translate-y-1/2 pointer-events-none"
        style={{ top: "50%" }}
      >
        <div className="bg-periwinkle rounded-md px-2 py-1.5 flex items-center justify-center">
          <span className="text-xs font-medium text-foreground leading-none whitespace-nowrap">
            {formatTimeLabel(snapshotTime)}
          </span>
        </div>
        <div
          className="w-0 h-0 shrink-0"
          style={{
            borderTop: "6px solid transparent",
            borderBottom: "6px solid transparent",
            borderLeft: "8px solid #9ABEF4",
          }}
        />
      </div>
    </div>
  );
}
