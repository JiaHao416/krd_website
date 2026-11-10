import { useEffect, useState } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/** 目前環境是否支援 matchMedia（舊瀏覽器、jsdom 預設沒有） */
function canMatchMedia(): boolean {
  return typeof window !== "undefined" && typeof window.matchMedia === "function";
}

/**
 * 讀取並監聽使用者系統的「減少動態」偏好。
 * 初值於第一次 render 即讀取，避免先排一次計時器；不支援 matchMedia 時回傳 false。
 * @returns 使用者是否開啟 prefers-reduced-motion: reduce
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState<boolean>(() =>
    canMatchMedia() ? window.matchMedia(REDUCED_MOTION_QUERY).matches : false
  );

  useEffect(() => {
    if (!canMatchMedia()) return;
    const mql = window.matchMedia(REDUCED_MOTION_QUERY);
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReduced(event.matches);
    };
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  return prefersReduced;
}
