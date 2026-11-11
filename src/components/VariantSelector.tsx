import { useRef } from "react";
import type { KeyboardEvent } from "react";
import type { ProductVariant } from "../services/transform";
import { variantLabel } from "../pages/productDetailText";

interface VariantSelectorProps {
  /** 商品的所有變體 */
  variants: ProductVariant[];
  /** 目前選中的變體 id；不在清單內時第一個選項可 Tab 進入 */
  selectedId: string | null;
  /** 選中某個變體 */
  onSelect: (id: string) => void;
}

// 選項共用外觀；選中與未選另加邊框與文字色
const CHIP_BASE_CLASS =
  "inline-flex h-11 items-center gap-2 rounded-pill bg-surface-raised px-4 text-body transition-colors duration-150";
const CHIP_SELECTED_CLASS = "border-2 border-accent font-semibold text-accent";
const CHIP_IDLE_CLASS = "border border-dash text-ink";

/**
 * 依按鍵算出下一個要選中的索引；不處理的按鍵回傳 null
 * @param key - 按鍵名稱
 * @param index - 目前索引
 * @param last - 最後一個索引
 * @returns 下一個索引或 null
 */
function nextIndex(key: string, index: number, last: number): number | null {
  if (key === "ArrowRight" || key === "ArrowDown") return index === last ? 0 : index + 1;
  if (key === "ArrowLeft" || key === "ArrowUp") return index === 0 ? last : index - 1;
  if (key === "Home") return 0;
  if (key === "End") return last;
  return null;
}

// 變體選擇：兩個以上才顯示；只有選中者在 Tab 順序內，方向鍵切換選中並移動焦點
const VariantSelector = ({ variants, selectedId, onSelect }: VariantSelectorProps) => {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  if (variants.length < 2) return null;

  const hasSelected = variants.some((variant) => variant.id === selectedId);

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const next = nextIndex(event.key, index, variants.length - 1);
    if (next === null) return;
    // 避免方向鍵與兩端鍵捲動頁面
    event.preventDefault();
    onSelect(variants[next].id);
    refs.current[next]?.focus();
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="text-body font-semibold text-ink">選規格</p>
      <div role="radiogroup" aria-label="選擇規格" className="flex flex-wrap gap-2">
        {variants.map((variant, index) => {
          const selected = variant.id === selectedId;
          const focusable = selected || (!hasSelected && index === 0);
          return (
            <button
              key={variant.id}
              ref={(el) => {
                refs.current[index] = el;
              }}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={focusable ? 0 : -1}
              onClick={() => onSelect(variant.id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={`${CHIP_BASE_CLASS} ${selected ? CHIP_SELECTED_CLASS : CHIP_IDLE_CLASS}`}
            >
              {variantLabel(variant)}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default VariantSelector;
