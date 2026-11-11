import { useCallback, useEffect, useState } from "react";
import {
  classifyDetailError,
  fetchProductDetail,
  isUuid,
} from "../services/productDetail";
import { ApiError, normalizeError } from "../services/errors";
import type { ProductDetail } from "../services/transform";

/** 商品詳情的載入狀態（判別聯合） */
export type ProductDetailState =
  | { status: "loading" }
  | { status: "success"; product: ProductDetail }
  | { status: "notFound" }
  | { status: "error"; error: ApiError; isRateLimited: boolean };

/** useProductDetail 的回傳值：狀態加上重試函式 */
export type UseProductDetailResult = ProductDetailState & { retry: () => void };

/** 內部儲存：結果與其對應的請求鍵 */
interface StoredResult {
  requestKey: string;
  result: ProductDetailState;
}

/**
 * 商品詳情載入 hook，不含任何 JSX，也不產生訪客文案（由畫面決定）。
 * 設計：
 * - 不快取、不預取、不打列表 API；每次造訪只發一個有效請求。
 * - 回傳狀態由 render 時比對 requestKey 衍生：切換 id 或 retry 的第一次 render
 *   就是 loading，不殘留舊資料，也不必在 effect 內同步 setState。
 * - id 為 undefined 或非 UUID 時直接 notFound，不發請求。
 * @param id - 商品 UUID（通常來自路由參數）
 */
export function useProductDetail(id: string | undefined): UseProductDetailResult {
  const validId = isUuid(id) ? id : null;
  const [reloadToken, setReloadToken] = useState(0);
  const [stored, setStored] = useState<StoredResult | null>(null);

  const retry = useCallback(() => setReloadToken((n) => n + 1), []);

  const requestKey = validId === null ? "" : validId + "#" + reloadToken;

  // 請求鍵改變（切換 id、retry，含 A→B→A 切回舊 id）時，在 render 階段就清掉已存結果，
  // 讓第一次 render 必為 loading，避免殘留先前載入的舊資料（D-11 不快取）
  const [prevKey, setPrevKey] = useState(requestKey);
  if (prevKey !== requestKey) {
    setPrevKey(requestKey);
    setStored(null);
  }

  useEffect(() => {
    if (validId === null) return;
    const key = validId + "#" + reloadToken;
    const controller = new AbortController();

    fetchProductDetail(validId, undefined, { signal: controller.signal })
      .then((product) => {
        if (controller.signal.aborted) return;
        setStored({ requestKey: key, result: { status: "success", product } });
      })
      .catch((error: unknown) => {
        // 被取消的請求不是錯誤，不能改變狀態
        if (
          controller.signal.aborted ||
          (error instanceof ApiError && error.kind === "canceled")
        ) {
          return;
        }
        const apiError = normalizeError(error);
        const result: ProductDetailState =
          classifyDetailError(apiError) === "notFound"
            ? { status: "notFound" }
            : {
                status: "error",
                error: apiError,
                isRateLimited: apiError.kind === "rate_limited",
              };
        setStored({ requestKey: key, result });
      });

    return () => controller.abort();
  }, [validId, reloadToken]);

  if (validId === null) return { status: "notFound", retry };
  if (stored === null || stored.requestKey !== requestKey) {
    return { status: "loading", retry };
  }
  return { ...stored.result, retry };
}
