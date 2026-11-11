interface PriceBlockProps {
  /** 已格式化的含稅價；null 代表沒有標價 */
  priceText: string | null;
}

// 價格與說明文字樣式
const PRICE_TITLE_CLASS = "text-heading font-semibold text-ink";
const PRICE_NOTE_CLASS = "text-label text-ink-muted";

// 詳情頁價格色塊：有標價時註明含稅；沒有標價時整塊不渲染，改由詢價 CTA 承擔
const PriceBlock = ({ priceText }: PriceBlockProps) => {
  if (priceText === null) return null;

  return (
    <div className="flex flex-col gap-1 rounded-block bg-block-2 px-6 py-4">
      <p className={PRICE_TITLE_CLASS}>{priceText}</p>
      <p className={PRICE_NOTE_CLASS}>含稅</p>
    </div>
  );
};

export default PriceBlock;
