import type { ProductDetail, ProductVariant } from "../services/transform";

/** 規格表的一列 */
export interface SpecRow {
  label: string;
  value: string;
}

/** trim 後非空才保留，否則為 null */
function trimOrNull(value: string | null): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed === "" ? null : trimmed;
}

/**
 * 組合複製詢價的文字（全形直線分隔）；沒有型號時省略型號段。
 * @param name - 商品名稱
 * @param model - 商品型號，可為 null 或空白
 * @param url - 商品頁完整網址
 * @returns 可直接貼給客服的詢價文字
 */
export function buildInquiryText(
  name: string,
  model: string | null,
  url: string
): string {
  const trimmedModel = trimOrNull(model);
  if (trimmedModel === null) return `${name}｜${url}`;
  return `${name}｜型號 ${trimmedModel}｜${url}`;
}

/**
 * 產生頁面 description：優先取說明（壓縮空白後截斷），沒有說明時以品牌、型號、分類組成。
 * @param product - 商品的說明、品牌、型號與分類
 * @returns description 文字
 */
export function buildMetaDescription(
  product: Pick<ProductDetail, "description" | "brand" | "model" | "category">
): string {
  const text = (product.description ?? "").replace(/\s+/g, " ").trim();
  if (text !== "") {
    // 以 code point 切割，取前 80 個字元，避免切斷 surrogate pair
    return Array.from(text).slice(0, 80).join("");
  }
  return [product.brand, product.model, product.category]
    .map(trimOrNull)
    .filter((part): part is string => part !== null)
    .join(" ");
}

/**
 * 變體選項的顯示文字：屬性值以斜線串接，沒有屬性時顯示 SKU。
 * @param variant - 商品變體
 * @returns 變體標籤
 */
export function variantLabel(
  variant: Pick<ProductVariant, "attributes" | "sku">
): string {
  if (variant.attributes.length === 0) return variant.sku;
  return variant.attributes.map((attribute) => attribute.value).join(" / ");
}

/**
 * 保固月數轉為顯示文字：整年以年為單位，其餘以月為單位。
 * @param months - 保固月數（正整數）
 * @returns 保固文字
 */
export function formatWarranty(months: number): string {
  if (months % 12 === 0) return `${months / 12} 年`;
  return `${months} 個月`;
}

/**
 * 品牌與型號行：只顯示有內容的部分，以間隔點串接，型號前加前綴。
 * @param brand - 品牌，可為 null
 * @param model - 型號，可為 null
 * @returns 顯示文字；兩者皆空時為 null
 */
export function buildBrandModelLine(
  brand: string | null,
  model: string | null
): string | null {
  const trimmedModel = trimOrNull(model);
  const parts = [
    trimOrNull(brand),
    trimmedModel === null ? null : `型號 ${trimmedModel}`,
  ].filter((part): part is string => part !== null);
  return parts.length === 0 ? null : parts.join(" · ");
}

/**
 * 規格表內容：依序為 SKU、變體屬性、保固；保固為空或非正數時不顯示該列。
 * @param variant - 目前選中的變體，可為 null
 * @param warrantyMonths - 保固月數，可為 null
 * @returns 規格列陣列
 */
export function buildSpecRows(
  variant: ProductVariant | null,
  warrantyMonths: number | null
): SpecRow[] {
  const rows: SpecRow[] = [];
  if (variant) {
    rows.push({ label: "SKU", value: variant.sku });
    variant.attributes.forEach((attribute) => {
      rows.push({ label: attribute.key, value: attribute.value });
    });
  }
  if (warrantyMonths !== null && warrantyMonths > 0) {
    rows.push({ label: "保固", value: formatWarranty(warrantyMonths) });
  }
  return rows;
}
