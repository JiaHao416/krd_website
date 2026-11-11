interface PriceBlockProps {
  /** 已格式化的含稅價；null 代表沒有標價 */
  priceText: string | null;
}

// 價格與說明文字樣式
const PRICE_TITLE_CLASS = "text-heading font-semibold text-ink";
const PRICE_NOTE_CLASS = "text-label text-ink-muted";

// 詳情頁價格色塊：沒有標價時請客人來電，有標價時註明含稅
const PriceBlock = ({ priceText }: PriceBlockProps) => (
  <div className="flex flex-col gap-1 rounded-block bg-block-2 px-6 py-4">
    {priceText === null ? (
      <>
        <p className={PRICE_TITLE_CLASS}>價格請來電</p>
        <p className={PRICE_NOTE_CLASS}>這個商品沒有標價，打個電話問，我們直接報給你。</p>
      </>
    ) : (
      <>
        <p className={PRICE_TITLE_CLASS}>{priceText}</p>
        <p className={PRICE_NOTE_CLASS}>含稅</p>
      </>
    )}
  </div>
);

export default PriceBlock;
