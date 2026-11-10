import { useCallback, useEffect, useState } from "react";
import { fetchProducts } from "../services/products";
import { buildProductParams } from "../services/catalog";
import type { ProductPageQuery } from "../services/catalog";
import { ApiError } from "../services/errors";
import type { ProductSort } from "../services/apiTypes";
import type { Product } from "../services/transform";

/** 載入狀態 */
export type ProductsStatus = "loading" | "error" | "success";

/** useProducts 的回傳值 */
export interface UseProductsResult {
  status: ProductsStatus;
  /** 重新抓取或失敗時會保留上一次成功的結果（供畫面淡化顯示） */
  items: Product[];
  /** 後端總數大於本次取得筆數 */
  truncated: boolean;
  /** 失敗時為 ApiError，其餘為 null */
  error: unknown;
  /** 重新發出請求 */
  retry: () => void;
}

interface ProductsState {
  status: ProductsStatus;
  items: Product[];
  truncated: boolean;
  error: unknown;
}

const INITIAL_STATE: ProductsState = {
  status: "loading",
  items: [],
  truncated: false,
  error: null,
};

/**
 * 商品資料載入 hook，不含任何 JSX，可被不同畫面重用。
 * 不做快取：每次掛載都重新請求，後台修改後重新整理即可看到變更。
 * @param query - 頁面查詢條件（品牌、分類、熱銷群組）
 * @param sort - 使用者選擇的排序
 */
export function useProducts(
  query: ProductPageQuery,
  sort?: ProductSort
): UseProductsResult {
  // 以序列化結果作為依賴，避免每次 render 的新物件造成無限重抓
  const paramsKey = JSON.stringify(buildProductParams(query, sort));
  const [reloadToken, setReloadToken] = useState(0);
  const [state, setState] = useState<ProductsState>(INITIAL_STATE);

  const retry = useCallback(() => setReloadToken((n) => n + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    setState((prev) => ({ ...prev, status: "loading", error: null }));

    fetchProducts(JSON.parse(paramsKey), undefined, {
      signal: controller.signal,
    })
      .then((result) => {
        if (controller.signal.aborted) return;
        setState({
          status: "success",
          items: result.items,
          truncated: result.truncated,
          error: null,
        });
      })
      .catch((error: unknown) => {
        // 被取消的請求不是錯誤，不能進入錯誤狀態
        if (
          controller.signal.aborted ||
          (error instanceof ApiError && error.kind === "canceled")
        ) {
          return;
        }
        setState((prev) => ({ ...prev, status: "error", error }));
      });

    return () => controller.abort();
  }, [paramsKey, reloadToken]);

  return { ...state, retry };
}
