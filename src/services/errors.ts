import axios from "axios";

/**
 * 錯誤種類：網路（含 timeout）、限流（429）、其他 HTTP 錯誤、回應格式不符、請求被取消
 * canceled 來自 AbortController（例如元件 unmount 或 StrictMode 重跑 effect），UI 應直接忽略、不顯示錯誤
 */
export type ApiErrorKind =
  | "network"
  | "rate_limited"
  | "http"
  | "invalid_response"
  | "canceled";

/** 資料層統一錯誤；使用者看到的文字只能來自 getErrorMessage */
export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;

  constructor(kind: ApiErrorKind, message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
  }
}

/** 給訪客看的固定中文訊息 */
export const ERROR_MESSAGES = {
  rateLimited: "瀏覽太頻繁，請稍候一分鐘再重試",
  network: "無法連線，請檢查網路後重試",
  generic: "商品資料暫時無法載入，請稍後再試",
} as const;

/** 從後端錯誤 body（{ error: { message } }）取出字串訊息，取不到回傳 undefined */
function extractBackendMessage(data: unknown): string | undefined {
  if (typeof data !== "object" || data === null || !("error" in data)) {
    return undefined;
  }
  const inner = data.error;
  if (typeof inner !== "object" || inner === null || !("message" in inner)) {
    return undefined;
  }
  return typeof inner.message === "string" ? inner.message : undefined;
}

/**
 * 將任意錯誤正規化為 ApiError
 * 判斷順序：已是 ApiError → 被取消 → 無 response（網路）→ 429 → 其他 HTTP → 其餘。
 * 不自動重試：429 時重試只會更糟，重試交給 Phase 2 的按鈕。
 * @param error - 捕捉到的任意錯誤
 * @returns ApiError
 */
export function normalizeError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }
  // CanceledError 也算 AxiosError 且沒有 response，須在網路判斷之前攔下，避免誤報連線失敗
  if (axios.isCancel(error)) {
    return new ApiError("canceled", "請求已取消");
  }
  if (axios.isAxiosError(error)) {
    const response = error.response;
    if (!response) {
      return new ApiError("network", error.message);
    }
    const message = extractBackendMessage(response.data) ?? error.message;
    if (response.status === 429) {
      return new ApiError("rate_limited", message, 429);
    }
    return new ApiError("http", message, response.status);
  }
  return new ApiError(
    "invalid_response",
    error instanceof Error ? error.message : "未知錯誤"
  );
}

/**
 * 取得可顯示給訪客的中文錯誤訊息
 * @param error - 捕捉到的任意錯誤
 * canceled 不應顯示給訪客，呼叫端需先以 kind 判斷略過；此處退回通用文案
 * @returns ERROR_MESSAGES 中的固定文案，不含後端細節
 */
export function getErrorMessage(error: unknown): string {
  const { kind } = normalizeError(error);
  if (kind === "rate_limited") return ERROR_MESSAGES.rateLimited;
  if (kind === "network") return ERROR_MESSAGES.network;
  return ERROR_MESSAGES.generic;
}
