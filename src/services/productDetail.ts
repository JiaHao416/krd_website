import type { AxiosInstance } from "axios";
import { apiClient } from "./client";
import { ApiError, normalizeError } from "./errors";
import { toProductDetail } from "./transform";
import type { ProductDetail } from "./transform";
import type { PublicProductDetailApi } from "./apiTypes";

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

/** fetchProductDetail 的選項 */
export interface FetchProductDetailOptions {
  /** 用於取消請求；abort 後會拋出 kind 為 canceled 的 ApiError */
  signal?: AbortSignal;
}

/**
 * 型別守衛：驗證回應為 { success: true, data: {...} }（data 為非 null 物件）
 * 涵蓋 success:false 與 SPA fallback 回傳 HTML 字串的情況。
 */
function isProductDetailResponse(
  value: unknown
): value is { success: true; data: unknown } {
  if (typeof value !== "object" || value === null) return false;
  if (!("success" in value) || value.success !== true) return false;
  if (!("data" in value)) return false;
  return typeof value.data === "object" && value.data !== null;
}

/**
 * 型別守衛：驗證商品層必要欄位
 * id、name、category 為字串，in_stock 為布林，variants 為陣列；
 * variant 層的壞資料由 toProductDetail 逐筆略過。
 */
function isPublicProductDetail(value: unknown): value is PublicProductDetailApi {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.name === "string" &&
    typeof v.category === "string" &&
    typeof v.in_stock === "boolean" &&
    Array.isArray(v.variants)
  );
}

/**
 * 取得單一商品詳情
 * 失敗一律拋出 ApiError；資料層不自動重試（重試交給 UI 按鈕），也不做快取。
 * 非 UUID 的 id 不發出請求，直接拋 http 400（省下限流額度，分類為 notFound）。
 * @param id - 商品 UUID
 * @param client - axios instance，預設為共用 apiClient，測試時可注入
 * @param options - 額外選項，目前支援 signal 用於取消請求
 * @returns 轉換後的商品詳情
 * @throws {ApiError} id 格式不符、網路、限流、HTTP 錯誤、回應格式不符，或請求被取消
 */
export async function fetchProductDetail(
  id: string,
  client: AxiosInstance = apiClient,
  options: FetchProductDetailOptions = {}
): Promise<ProductDetail> {
  if (!isUuid(id)) {
    throw new ApiError("http", "商品編號格式不符", 400);
  }

  let body: unknown;
  try {
    const response = await client.get<unknown>(
      "/products/" + encodeURIComponent(id),
      { signal: options.signal }
    );
    body = response.data;
  } catch (error: unknown) {
    throw normalizeError(error);
  }

  if (!isProductDetailResponse(body)) {
    throw new ApiError("invalid_response", "商品詳情 API 回應格式不符");
  }
  if (!isPublicProductDetail(body.data)) {
    throw new ApiError("invalid_response", "商品詳情 API 商品欄位不符");
  }

  return toProductDetail(body.data);
}
