import { useParams } from "react-router-dom";
import Layout from "../components/Layout";
import NotFoundState from "../components/NotFoundState";
import ProductDetailView from "../components/ProductDetailView";
import DetailMobileBar from "../components/DetailMobileBar";
import { AlertIcon } from "../components/icons";
import { useProductDetail } from "../hooks/useProductDetail";
import { useCopyInquiry } from "../hooks/useCopyInquiry";
import { buildInquiryText } from "./productDetailText";

// 主按鈕樣式（與商品列表頁一致）
const PRIMARY_BUTTON_CLASS =
  "items-center rounded-pill bg-accent px-6 text-body font-semibold text-accent-ink shadow-btn transition-colors duration-150 hover:bg-accent-hover active:shadow-btn-pressed";
// 骨架色塊
const SKELETON_CLASS = "bg-sand motion-safe:animate-pulse";

/** 載入骨架：版面與成功態一致，避免載入完成時跳動 */
const DetailSkeleton = () => (
  <div aria-busy="true" className="pt-6">
    <div className={`h-11 w-1/3 rounded-pill ${SKELETON_CLASS}`} />
    <div className="mt-6 grid gap-6 xl:grid-cols-[5fr_6fr] xl:gap-12">
      <div className="mx-auto w-full max-w-[520px] pt-4 xl:max-w-none">
        <div className={`aspect-square w-full rounded-block ${SKELETON_CLASS}`} />
      </div>
      <div className="flex flex-col gap-6">
        <div className={`h-6 w-1/3 rounded-pill ${SKELETON_CLASS}`} />
        <div className={`h-12 w-3/4 rounded-pill ${SKELETON_CLASS}`} />
        <div className={`h-24 w-full rounded-block ${SKELETON_CLASS}`} />
        <div className={`h-14 w-1/2 rounded-pill ${SKELETON_CLASS}`} />
      </div>
    </div>
  </div>
);

// 商品詳情頁：依詳情資料狀態切換內容；只渲染一個 Layout，狀態切換時骨架不重掛
const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const detail = useProductDetail(id);

  // 複製狀態由頁面持有，行內 CTA 與手機固定列共用同一份
  const inquiryText =
    detail.status === "success"
      ? buildInquiryText(detail.product.name, detail.product.model, window.location.href)
      : null;
  const { status: copyStatus, copy } = useCopyInquiry(inquiryText);
  const handleCopy = () => {
    void copy();
  };

  return (
    <Layout
      footer="address"
      mobileBar={
        detail.status === "success" ? (
          <DetailMobileBar status={copyStatus} onCopy={handleCopy} />
        ) : undefined
      }
    >
      {detail.status === "loading" && <DetailSkeleton />}

      {detail.status === "notFound" && (
        <>
          <title>找不到商品 | KRD</title>
          <NotFoundState
            title="找不到這個商品"
            description="它可能已經下架，或是網址打錯了。回到所有商品逛逛吧。"
            actionLabel="回到所有商品"
            actionTo="/all-products"
          />
        </>
      )}

      {detail.status === "error" && (
        <div className="flex justify-center py-16">
          <div
            role="alert"
            className="w-full max-w-[560px] rounded-block bg-surface-raised p-8 text-center"
          >
            <AlertIcon className="mx-auto h-12 w-12 text-danger" />
            <h1 className="mt-4 text-heading font-semibold text-ink">商品暫時載入不出來</h1>
            <p className="mt-2 text-body text-ink-muted">
              {detail.isRateLimited
                ? "現在逛的人有點多，等幾秒再試一次。"
                : "可能是網路不穩或我們這邊在忙，等一下再試試看。"}
            </p>
            <button
              type="button"
              onClick={detail.retry}
              className={`mt-6 inline-flex h-11 ${PRIMARY_BUTTON_CLASS}`}
            >
              重新載入
            </button>
          </div>
        </div>
      )}

      {detail.status === "success" && (
        <ProductDetailView
          key={detail.product.id}
          product={detail.product}
          copyStatus={copyStatus}
          onCopy={handleCopy}
        />
      )}
    </Layout>
  );
};

export default ProductDetailPage;
