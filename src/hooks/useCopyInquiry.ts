import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

/** 複製狀態：初始、已複製、失敗 */
export type CopyStatus = "idle" | "copied" | "failed";

/** 寫入剪貼簿的函式（可注入，方便測試） */
type WriteText = (text: string) => Promise<void>;

/** 「已複製」狀態維持的毫秒數 */
const COPIED_DURATION_MS = 2000;

/**
 * 預設寫入函式：呼叫當下才讀取瀏覽器剪貼簿 API。
 * 以物件方法形式呼叫，避免脫離 this 造成 Illegal invocation；
 * 剪貼簿 API 只在 secure context（HTTPS 或 localhost）可用，不可用時回傳 rejected promise。
 * @param text - 要寫入的文字
 * @returns 寫入完成的 promise
 */
function defaultWriteText(text: string): Promise<void> {
  const clipboard =
    typeof navigator !== "undefined" ? navigator.clipboard : undefined;
  if (!clipboard || typeof clipboard.writeText !== "function") {
    return Promise.reject(new Error("clipboard unavailable"));
  }
  return clipboard.writeText(text);
}

/**
 * 清除尚未觸發的還原計時器。
 * @param timerRef - 存放計時器 id 的 ref
 */
function clearTimer(timerRef: RefObject<number | null>): void {
  if (timerRef.current !== null) {
    window.clearTimeout(timerRef.current);
    timerRef.current = null;
  }
}

/**
 * 複製詢價文字的狀態 hook：成功後短暫顯示「已複製」再回到初始，失敗則維持失敗直到下次嘗試。
 * 寫入在 copy() 內同步發出（之前不 await 任何東西），以保留使用者點擊的手勢授權。
 * @param text - 要複製的文字；為 null 時 copy() 不做任何事
 * @param writeText - 寫入剪貼簿的函式，預設使用瀏覽器剪貼簿 API
 * @returns 目前狀態與觸發複製的函式（回傳的 promise 不會 reject）
 */
export function useCopyInquiry(
  text: string | null,
  writeText: WriteText = defaultWriteText
): { status: CopyStatus; copy: () => Promise<void> } {
  const [status, setStatus] = useState<CopyStatus>("idle");
  const [prevText, setPrevText] = useState(text);
  const timerRef = useRef<number | null>(null);
  const mountedRef = useRef(true);
  // 每次嘗試與每次切換文字都會遞增；請求完成時編號不符就丟棄結果
  const attemptRef = useRef(0);

  // 文字改變（切換商品）時在 render 階段重置狀態，避免舊商品的結果殘留
  if (prevText !== text) {
    setPrevText(text);
    setStatus("idle");
  }

  useEffect(() => {
    // 切換文字時清掉還原計時器，並作廢進行中的寫入
    attemptRef.current += 1;
    clearTimer(timerRef);
  }, [text]);

  useEffect(() => {
    // StrictMode 重新掛載時要設回 true
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clearTimer(timerRef);
    };
  }, []);

  const copy = useCallback((): Promise<void> => {
    if (text === null) return Promise.resolve();
    clearTimer(timerRef);
    attemptRef.current += 1;
    const attempt = attemptRef.current;
    // 已卸載或已有更新的嘗試／文字切換時，不套用這次的結果
    const isCurrent = () => mountedRef.current && attempt === attemptRef.current;
    const pending = writeText(text);
    // 寫入發出後先回到初始：同一狀態連續出現時，即時區域內容仍會變動而重新朗讀
    setStatus("idle");
    return pending
      .then(() => {
        if (!isCurrent()) return;
        setStatus("copied");
        timerRef.current = window.setTimeout(() => {
          timerRef.current = null;
          setStatus("idle");
        }, COPIED_DURATION_MS);
      })
      .catch(() => {
        if (isCurrent()) setStatus("failed");
      });
  }, [text, writeText]);

  return { status, copy };
}
