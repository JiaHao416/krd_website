import { useCallback, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import type { ProductDetail } from "../services/transform";
import type { CopyStatus } from "../hooks/useCopyInquiry";
import { findCategoryPage } from "../config/categoryPage";
import {
  buildBrandModelLine,
  buildMetaDescription,
  buildSpecRows,
} from "../pages/productDetailText";
import ImageModal from "./ImageModal";
import ImagePlaceholder from "./ImagePlaceholder";
import PriceBlock from "./PriceBlock";
import VariantSelector from "./VariantSelector";
import SpecTable from "./SpecTable";
import DetailCta from "./DetailCta";

interface ProductDetailViewProps {
  /** 已轉換的商品詳情 */
  product: ProductDetail;
  /** 複製詢價狀態（由頁面持有，與手機固定列共用） */
  copyStatus: CopyStatus;
  /** 點擊行內複製按鈕 */
  onCopy: () => void;
}

// 返回按鈕（有歷史時為按鈕，直接開網址時為分類連結，外觀相同）
const BACK_CLASS =
  "inline-flex h-11 shrink-0 items-center self-start rounded-pill border border-dash px-4 text-body text-ink transition-colors duration-150 hover:bg-surface-raised md:self-auto";
// 麵包屑連結
const CRUMB_LINK_CLASS = "text-accent transition-colors duration-150 hover:text-accent-hover";
// 主圖相框：白底、粗邊、微傾斜（文字區不傾斜）
const FRAME_CLASS =
  "relative block aspect-square w-full -rotate-[1.2deg] overflow-hidden rounded-block border-8 border-surface-raised bg-white shadow-card-lg md:border-[16px]";
// 「洽詢交期」標籤（與商品卡一致）
const LEAD_TIME_TAG_CLASS =
  "inline-flex items-center rounded-pill bg-block-3 px-4 py-1 text-label text-ink";

// 商品詳情成功態：標題與 description、麵包屑、返回、主圖燈箱與資訊欄
const ProductDetailView = ({ product, copyStatus, onCopy }: ProductDetailViewProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(
    product.defaultVariantId ?? product.variants[0]?.id ?? null
  );
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const handleCloseZoom = useCallback(() => setIsZoomOpen(false), []);

  // 由選中的變體推導顯示內容；沒有變體時視為無價、沿用商品層的現貨與圖片
  const selected = product.variants.find((variant) => variant.id === selectedId) ?? null;
  const priceText = selected?.priceText ?? null;
  const inStock = selected ? selected.inStock : product.inStock;
  const imageUrl = selected?.imageUrl ?? product.imageUrl;
  const showImage = imageUrl !== null && imageUrl !== failedImageUrl;
  const category = findCategoryPage(product.category);
  const brandModel = buildBrandModelLine(product.brand, product.model);
  const description = product.description?.trim() ? product.description : null;
  const specRows = buildSpecRows(selected, product.warrantyMonths);

  // 站內進入時才有上一頁可回；直接開網址改連到所屬分類頁
  const hasInSiteHistory = location.key !== "default";
  const handleBack = () => navigate(-1);

  return (
    <div className="pb-8 pt-6 md:pb-0">
      {/* React 19 會把標題與 description 提升到 head，卸載時移除 */}
      <title>{`${product.name} | KRD`}</title>
      <meta name="description" content={buildMetaDescription(product)} />

      <div className="flex flex-col-reverse gap-2 md:flex-row md:items-center md:justify-between">
        <nav aria-label="麵包屑" className="min-w-0">
          <ol className="flex min-w-0 items-center gap-2 text-label text-ink-muted">
            <li>
              <Link to="/" className={CRUMB_LINK_CLASS}>
                首頁
              </Link>
            </li>
            <li aria-hidden="true">›</li>
            <li>
              <Link to={category.path} className={CRUMB_LINK_CLASS}>
                {category.title}
              </Link>
            </li>
            <li aria-hidden="true">›</li>
            <li className="min-w-0 truncate" aria-current="page">
              {product.name}
            </li>
          </ol>
        </nav>
        {hasInSiteHistory ? (
          <button type="button" onClick={handleBack} className={BACK_CLASS}>
            ← 回上一頁
          </button>
        ) : (
          <Link to={category.path} className={BACK_CLASS}>
            ← 回到{category.title}
          </Link>
        )}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[5fr_6fr] xl:gap-12">
        {/* 圖欄：父層不可裁切，膠帶才能超出相框 */}
        <div className="relative mx-auto w-full max-w-[520px] pt-4 xl:max-w-none">
          <span
            aria-hidden="true"
            className="absolute left-1/2 top-0 z-10 h-8 w-[120px] -translate-x-1/2 -rotate-[4deg] bg-tape/80"
          />
          {showImage ? (
            <button
              type="button"
              aria-label={`放大查看 ${product.name} 圖片`}
              onClick={() => setIsZoomOpen(true)}
              className={`${FRAME_CLASS} cursor-zoom-in`}
            >
              <img
                src={imageUrl}
                alt={product.name}
                fetchPriority="high"
                className="h-full w-full object-contain"
                onError={() => setFailedImageUrl(imageUrl)}
              />
              <span
                aria-hidden="true"
                className="absolute bottom-4 right-4 inline-flex h-9 items-center rounded-pill bg-surface px-4 text-label text-ink"
              >
                放大看
              </span>
            </button>
          ) : (
            <div className={FRAME_CLASS}>
              <ImagePlaceholder />
            </div>
          )}
          {showImage && (
            <ImageModal show={isZoomOpen} onHide={handleCloseZoom} img={imageUrl} />
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            {brandModel !== null && (
              <p className="text-body text-ink-muted [overflow-wrap:anywhere]">{brandModel}</p>
            )}
            <h1 className="text-display font-semibold text-ink">{product.name}</h1>
            <Link
              to={category.path}
              data-testid="category-tag"
              className="self-start rounded-pill bg-block-1 px-4 py-1 text-label text-ink"
            >
              {product.category}
            </Link>
          </div>

          <PriceBlock priceText={priceText} />

          <VariantSelector
            variants={product.variants}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />

          <div data-testid="stock-status" className="flex">
            {inStock ? (
              <p className="inline-flex items-center gap-2 text-label text-success">
                <span aria-hidden="true" className="h-[10px] w-[10px] rounded-pill bg-success" />
                有現貨
              </p>
            ) : (
              <span className={`self-start ${LEAD_TIME_TAG_CLASS}`}>洽詢交期</span>
            )}
          </div>

          <DetailCta status={copyStatus} onCopy={onCopy} />

          {description !== null && (
            <section className="flex flex-col gap-2">
              <h2 className="text-body font-semibold text-ink">商品說明</h2>
              {/* 純文字節點，換行由 CSS 保留 */}
              <p className="whitespace-pre-line text-body text-ink">{description}</p>
            </section>
          )}

          <SpecTable rows={specRows} />
        </div>
      </div>
    </div>
  );
};

export default ProductDetailView;
