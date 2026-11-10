import axios from "axios";
import type { AxiosAdapter, AxiosInstance } from "axios";

/** 預設為 production 公開 API；dev 由 .env.development 覆寫為 /api/v1/public */
export const DEFAULT_BASE_URL = "https://api.krd.com.tw/api/v1/public";

/**
 * 決定 API base URL
 * @param envValue - VITE_API_BASE_URL 的值
 * @returns 未設定或空字串時回傳預設網址，否則回傳設定值
 */
export function resolveBaseUrl(envValue: string | undefined): string {
  return envValue || DEFAULT_BASE_URL;
}

/**
 * 建立公開 API 的 axios instance（不設任何 headers、不帶憑證）
 * @param baseURL - API 根網址，預設讀 VITE_API_BASE_URL
 * @param adapter - 測試用注入點；未提供時使用 axios 預設 adapter
 * @returns AxiosInstance
 */
export function createApiClient(
  baseURL: string = resolveBaseUrl(import.meta.env.VITE_API_BASE_URL),
  adapter?: AxiosAdapter
): AxiosInstance {
  return axios.create({ baseURL, timeout: 10000, adapter });
}

export const apiClient = createApiClient();
