import { normalizeError } from "./errors";

/**
 * UUID 格式（RFC 4122 風格），與後端 zod `.uuid()` 對齊。
 * 前後端判斷若有細微差異，結果同為 notFound，不影響使用者看到的狀態。
 */
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * 判斷值是否為 UUID 字串
 * 不做 trim，前後有空白視為非 UUID。
 * @param value - 待檢查的值
 * @returns 是否為 UUID 字串
 */
export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

/** 詳情錯誤分類：找不到（不必重試）或可重試 */
export type DetailErrorClass = "notFound" | "retryable";

/**
 * 將詳情請求的錯誤分類
 * 只有 http 404 或 400 視為 notFound；429、5xx、網路、格式不符皆為 retryable。
 * canceled 由呼叫端（hook）先行忽略，不應傳入；若傳入也回 retryable。
 * @param error - 任意錯誤，會先經 normalizeError 正規化
 * @returns notFound 或 retryable
 */
export function classifyDetailError(error: unknown): DetailErrorClass {
  const normalized = normalizeError(error);
  if (
    normalized.kind === "http" &&
    (normalized.status === 404 || normalized.status === 400)
  ) {
    return "notFound";
  }
  return "retryable";
}
