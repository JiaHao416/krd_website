import { useEffect, useState } from "react";

/** 目前環境是否支援 matchMedia（舊瀏覽器、jsdom 預設沒有） */
function canMatchMedia(): boolean {
  return typeof window !== "undefined" && typeof window.matchMedia === "function";
}

/**
 * 讀取並監聽任意 media query。
 * 初值於第一次 render 即同步讀取；不支援 matchMedia 時回傳 false（視為不符合）。
 * @param query - CSS media query 字串
 * @returns 目前是否符合該 query
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() =>
    canMatchMedia() ? window.matchMedia(query).matches : false
  );

  useEffect(() => {
    if (!canMatchMedia()) return;
    const mql = window.matchMedia(query);
    const handleChange = (event: MediaQueryListEvent) => setMatches(event.matches);
    setMatches(mql.matches); // query 變更時同步一次
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, [query]);

  return matches;
}
