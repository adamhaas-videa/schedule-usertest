import { useEffect, useState } from "react";
import { getNowMinutes } from "@/lib/timeline";

/** Local clock in minutes since midnight. Updates when the minute rolls over. */
export function useNowMinutes(): number {
  const [nowMinutes, setNowMinutes] = useState(getNowMinutes);

  useEffect(() => {
    const id = window.setInterval(() => {
      setNowMinutes((prev) => {
        const next = getNowMinutes();
        return next === prev ? prev : next;
      });
    }, 1_000);
    return () => window.clearInterval(id);
  }, []);

  return nowMinutes;
}
