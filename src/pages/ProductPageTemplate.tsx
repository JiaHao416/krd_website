import { useState } from "react";
import Layout from "../components/Layout";
import ImageModal from "../components/ImageModal";
import ProductCard from "../components/ProductCard";
import ProductCardSkeleton from "../components/ProductCardSkeleton";
import CategoryChips from "../components/CategoryChips";
import { AlertIcon, PhoneIcon } from "../components/icons";
import { CONTACT } from "../config/contact";
import { useProducts } from "../hooks/useProducts";
import { PRODUCT_LIMIT } from "../services/catalog";
import type { ProductPageQuery } from "../services/catalog";
import type { ProductSort } from "../services/apiTypes";
import { getErrorMessage } from "../services/errors";

interface ProductPageProps {
  title: string;
  /** 保留給呼叫端展開設定用；新版面不顯示描述 */
  description?: string;
  query: ProductPageQuery;
}

interface ErrorCardProps {
  error: unknown;
  onRetry: () => void;
}

// 載入骨架張數：約兩列 grid，讓首屏高度接近載入完成後
const SKELETON_COUNT = 8;

// 主按鈕共用外觀（accent 底＋實色陰影，按下時陰影變淺）
const PRIMARY_BUTTON_CLASS =
  "items-center rounded-pill bg-accent px-6 text-body font-semibold text-accent-ink shadow-btn transition-colors duration-150 hover:bg-accent-hover active:shadow-btn-pressed";

// 檢視切換鈕外觀；選中加 block-2 底與粗體
const VIEW_BUTTON_CLASS =
  "inline-flex h-11 items-center gap-2 rounded-pill border border-dash px-4 text-body text-ink transition-colors duration-150 hover:bg-surface-raised";
const VIEW_BUTTON_ACTIVE_CLASS = "bg-block-2 font-semibold";

// 載入失敗卡片：文字只來自 getErrorMessage，不顯示後端原始訊息
const ErrorCard = ({ error, onRetry }: ErrorCardProps) => {
  const handleRetry = () => onRetry();
  return (
    <div role="alert" className="rounded-block bg-surface-raised p-8 text-center">
      <AlertIcon className="mx-auto h-12 w-12 text-danger" />
      <h2 className="mt-4 text-heading font-semibold text-danger">
        無法載入商品
      </h2>
      <p className="mt-2 text-body text-ink-muted">{getErrorMessage(error)}</p>
      <button
        type="button"
        onClick={handleRetry}
        className={`mt-6 inline-flex h-11 ${PRIMARY_BUTTON_CLASS}`}
      >
        重新載入
      </button>
    </div>
  );
};

// 空狀態：查詢成功但分類內沒有商品
const EmptyState = () => (
  <div className="rounded-block bg-block-2 p-8 text-center">
    <h2 className="text-heading font-semibold text-ink">這裡還沒有商品</h2>
    <p className="mt-2 text-body text-ink-muted">
      這個分類暫時沒東西，過幾天再來看看，或直接打電話問我們。
    </p>
  </div>
);

// 結尾詢問區：base 由固定撥號列承擔撥號，故按鈕只在 md 以上顯示
const AskUsSection = () => (
  <section className="mt-8 rounded-block bg-block-2 px-8 py-6 md:flex md:items-center md:justify-between md:gap-6">
    <div>
      <h2 className="text-heading font-semibold text-ink">找不到想要的？</h2>
      <p className="mt-1 text-body text-ink-muted">
        我們店裡還有很多沒放上來，打個電話問最快。
      </p>
    </div>
    <a
      href={`tel:${CONTACT.phoneHref}`}
      className={`mt-4 hidden h-14 shrink-0 gap-2 md:mt-0 md:inline-flex ${PRIMARY_BUTTON_CLASS}`}
    >
      <PhoneIcon className="h-5 w-5" />
      {CONTACT.phone}
    </a>
  </section>
);

const ProductPageTemplate = ({ title, query }: ProductPageProps) => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<ProductSort>("name");
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [showImageModal, setShowImageModal] = useState(false);

  // 頁面鎖定排序（如 /new-products）時不顯示下拉，也不送使用者排序
  const sortLocked = query.sort !== undefined;
  const { status, items, truncated, error, retry } = useProducts(
    query,
    sortLocked ? undefined : sortBy
  );
  const isInitialLoading = status === "loading" && items.length === 0;
  // 已有舊列表時重新載入：保留列表並淡化
  const isRefreshing = status === "loading" && items.length > 0;
  const hasItems = status !== "error" && items.length > 0;

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  const handleCloseModal = () => {
    setShowImageModal(false);
    setSelectedImage("");
  };

  const listLayoutClass =
    viewMode === "grid"
      ? "grid grid-cols-2 items-stretch gap-4 py-4 md:grid-cols-3 md:gap-6 xl:grid-cols-4 xl:gap-8"
      : "flex flex-col gap-4 py-4";

  // 列表區：依狀態顯示骨架、錯誤卡、空狀態或商品
  const renderProducts = () => {
    if (isInitialLoading) {
      return (
        <>
          <p aria-live="polite" className="mt-6 text-label text-ink-muted">
            正在載入產品資訊...
          </p>
          <div className={listLayoutClass}>
            {Array.from({ length: SKELETON_COUNT }, (_, i) => (
              <ProductCardSkeleton key={i} variant={viewMode} />
            ))}
          </div>
        </>
      );
    }
    if (status === "error") {
      return <ErrorCard error={error} onRetry={retry} />;
    }
    if (status === "success" && items.length === 0) {
      return <EmptyState />;
    }
    return (
      <div
        aria-busy={isRefreshing}
        className={`transition-opacity duration-200 ${
          isRefreshing ? "pointer-events-none opacity-60" : ""
        } ${listLayoutClass}`}
      >
        {items.map((product, i) => (
          <ProductCard
            key={product.id}
            product={product}
            variant={viewMode}
            onImageClick={handleImageClick}
            index={i}
          />
        ))}
      </div>
    );
  };

  return (
    <Layout footer="thanks">
      {/* 標題區：左側 h1＋副行，右側檢視切換與排序 */}
      <div className="flex flex-col gap-4 pt-8 md:flex-row md:items-end md:justify-between xl:pt-16">
        <div>
          <h1 className="text-display font-semibold text-ink">{title}</h1>
          {hasItems && (
            <p className="mt-2 text-body text-ink-muted">
              {/* 截斷時 items.length 只是上限，不顯示數量以免與頁底截斷提示矛盾 */}
              {!truncated && `共 ${items.length} 項。`}
              看到喜歡的，直接打電話問最快。
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            aria-label="格狀檢視"
            aria-pressed={viewMode === "grid"}
            className={`${VIEW_BUTTON_CLASS} ${
              viewMode === "grid" ? VIEW_BUTTON_ACTIVE_CLASS : ""
            }`}
          >
            格狀
          </button>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            aria-label="列表檢視"
            aria-pressed={viewMode === "list"}
            className={`${VIEW_BUTTON_CLASS} ${
              viewMode === "list" ? VIEW_BUTTON_ACTIVE_CLASS : ""
            }`}
          >
            列表
          </button>
          {!sortLocked && (
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as ProductSort)}
              disabled={isRefreshing}
              aria-label="排序方式"
              className="h-11 rounded-pill border border-dash bg-surface-raised px-4 text-body text-ink"
            >
              <option value="name">依名稱</option>
              <option value="newest">最新優先</option>
            </select>
          )}
        </div>
      </div>

      {/* 分類 chip 列（取代舊側邊選單） */}
      <div className="mt-6">
        <CategoryChips />
      </div>

      {renderProducts()}

      {status === "success" && truncated && (
        <p className="mt-4 text-center text-label text-ink-muted">
          {`僅顯示前 ${PRODUCT_LIMIT} 項商品`}
        </p>
      )}

      {hasItems && <AskUsSection />}

      {/* 燈箱：Phase 10 改為只在詳情頁使用 */}
      <ImageModal
        show={showImageModal}
        onHide={handleCloseModal}
        img={selectedImage}
      />
    </Layout>
  );
};

export default ProductPageTemplate;
