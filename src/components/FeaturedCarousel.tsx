import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { UseProductsResult } from "../hooks/useProducts";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { useMediaQuery } from "../hooks/useMediaQuery";
import type { Product } from "../services/transform";
import ImagePlaceholder from "./ImagePlaceholder";
import PriceTag from "./PriceTag";
import { AlertIcon, ChevronLeftIcon, ChevronRightIcon } from "./icons";
import { getErrorMessage } from "../services/errors";

interface FeaturedCarouselProps {
  result: UseProductsResult;
  intervalMs?: number;
}

interface NoteCardProps {
  product: Product;
  tilt: string;
  isFirst: boolean;
}

// 手機寬度斷點（與測試 mock 的字串逐字一致）
const BASE_QUERY = "(max-width: 767px)";
// 便條卡依位置輪流傾斜；寫成靜態字串才不會被 Tailwind purge
const NOTE_TILTS = ["-rotate-[1.5deg]", "rotate-[1deg]", "-rotate-[0.5deg]"] as const;

// 單張便條卡：整張為連到詳情頁的連結；自行記錄破圖，3 張同時顯示時各自判斷
const NoteCard = ({ product, tilt, isFirst }: NoteCardProps) => {
  // 記錄載入失敗的圖片網址；換成其他網址時自動重新嘗試（比照 ProductCard）
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const showImage = product.imageUrl && product.imageUrl !== failedImageUrl;

  return (
    <Link
      to={`/products/${product.id}`}
      aria-label={`查看 ${product.name} 詳情`}
      className={`block relative rounded-card bg-surface-raised p-4 shadow-note-sm md:shadow-note ${tilt}`}
    >
      {/* 琥珀色膠帶裝飾 */}
      <span
        aria-hidden="true"
        className="absolute -top-4 left-1/2 h-7 w-24 -translate-x-1/2 -rotate-[4deg] bg-tape/80"
      />
      <div className="h-[170px] w-full overflow-hidden rounded-image bg-white md:h-[200px]">
        {showImage ? (
          <img
            src={product.imageUrl ?? undefined}
            alt={product.name}
            onError={() => setFailedImageUrl(product.imageUrl)}
            {...(isFirst ? { fetchPriority: "high" as const } : { loading: "lazy" as const })}
            className="h-full w-full object-contain"
          />
        ) : (
          <ImagePlaceholder />
        )}
      </div>
      {product.brand && (
        <p className="mt-2 text-label text-ink-muted">{product.brand}</p>
      )}
      <h3 className="mt-1 line-clamp-2 text-body font-semibold leading-card text-ink">
        {product.name}
      </h3>
      <div className="mt-2 flex items-center justify-between gap-2">
        <PriceTag product={product} />
        {/* 整張卡已是連結，這段只是視覺提示；讀屏以連結名稱為準 */}
        <span aria-hidden="true" className="text-body font-semibold text-accent">
          <span className="hidden md:inline">查看詳情 →</span>
          <span className="md:hidden">詳情 →</span>
        </span>
      </div>
    </Link>
  );
};

// 單組熱銷輪播：自行管理目前投影片與自動播放
const FeaturedCarousel = ({ result, intervalMs = 5000 }: FeaturedCarouselProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { items, status } = result;

  const [isHovered, setIsHovered] = useState(false);
  const [hasFocusWithin, setHasFocusWithin] = useState(false);
  // 代表「一次指標點擊序列進行中」：pointerdown 設定，focus／click／pointercancel 清除，
  // pointerup 只對滑鼠清除。此期間的 focus 來自點擊而非鍵盤，不應暫停，
  // 否則點完箭頭後焦點留在按鈕上，自動播放會一直停住。
  // 不用 :focus-visible 判斷，因為 jsdom 無法區分而無法測試
  const isPointerDownRef = useRef(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  // 手機寬度改為橫向捲動條，與減少動態同機制停止自動播放
  const isBase = useMediaQuery(BASE_QUERY);
  // base 時每張卡的 li，供按鈕與指示點捲動定位
  const cardRefs = useRef<Array<HTMLLIElement | null>>([]);
  // 減少動態偏好、手機寬度、滑鼠停留、焦點在輪播內時都不自動切換（WCAG 2.2.2）
  const isPaused = prefersReducedMotion || isBase || isHovered || hasFocusWithin;

  // 只有成功、多於一筆且未暫停時才自動播放；
  // 每次切換（自動或手動）都會因 currentSlide 改變而重新計時
  useEffect(() => {
    if (status !== "success" || items.length <= 1 || isPaused) return;
    const timer = setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % items.length);
    }, intervalMs);
    return () => clearTimeout(timer);
  }, [status, items.length, intervalMs, isPaused, currentSlide]);

  // 上一次 render 是否為 base，用來辨識「由 md+ 切進 base」的那一刻
  const wasBaseRef = useRef(isBase);

  // 由 md+ 切進 base 時，捲動條是全新掛載（停在第 1 張），需對齊目前指示點；
  // 只讀 currentSlide、不改狀態機。直接設定 scrollLeft 而非 scrollIntoView，
  // 輪播不在畫面內時才不會讓整頁垂直跳動
  useEffect(() => {
    const isEnteringBase = isBase && !wasBaseRef.current;
    wasBaseRef.current = isBase;
    if (!isEnteringBase || items.length === 0) return;
    const firstCard = cardRefs.current[0];
    const targetCard = cardRefs.current[currentSlide % items.length];
    const track = targetCard?.parentElement;
    if (!firstCard || !targetCard || !track) return;
    track.scrollLeft = targetCard.offsetLeft - firstCard.offsetLeft;
  }, [isBase, currentSlide, items.length]);

  if (status === "error") {
    return (
      <div role="alert" className="rounded-card bg-surface-raised p-6 text-center">
        <AlertIcon className="mx-auto h-12 w-12 text-danger" />
        <p className="mt-2 text-body text-ink">{getErrorMessage(result.error)}</p>
        <button
          type="button"
          onClick={result.retry}
          className="mt-4 inline-flex h-11 items-center rounded-pill bg-accent px-6 text-body font-semibold text-accent-ink shadow-btn hover:bg-accent-hover active:shadow-btn-pressed"
        >
          重新載入
        </button>
      </div>
    );
  }

  if (status === "success" && items.length === 0) {
    return <p className="text-body text-ink-muted">目前沒有精選商品</p>;
  }

  if (status === "loading") {
    return (
      <div className="space-y-4">
        <p aria-live="polite" className="text-label text-ink-muted">
          載入產品中...
        </p>
        <div className="grid gap-8 md:grid-cols-3">
          {[0, 1, 2].map((key) => (
            <div key={key} aria-hidden="true" className="rounded-card bg-surface-raised p-4">
              <div className="h-[170px] rounded-image bg-sand motion-safe:animate-pulse md:h-[200px]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 商品數變少時避免索引越界
  const activeIndex = currentSlide % items.length;
  const showControls = items.length > 1;

  // base 時把目標卡捲到捲動條起點；block 必須為 nearest，避免整頁垂直跳動
  const scrollToCard = (target: number) => {
    if (!isBase) return;
    cardRefs.current[target]?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "nearest",
      inline: "start",
    });
  };

  const goPrev = () => {
    const target = (activeIndex - 1 + items.length) % items.length;
    setCurrentSlide((activeIndex - 1 + items.length) % items.length);
    scrollToCard(target);
  };
  const goNext = () => {
    const target = (activeIndex + 1) % items.length;
    setCurrentSlide((activeIndex + 1) % items.length);
    scrollToCard(target);
  };

  // md+ 只渲染視窗內最多 3 張（循環取模，筆數不足 3 不重複）
  const visible = Array.from(
    { length: Math.min(3, items.length) },
    (_, k) => (activeIndex + k) % items.length
  );

  return (
    <div
      className="space-y-4"
      // 只有滑鼠停留才暫停；觸控裝置點擊會模擬 mouseenter 卻不送 mouseleave，
      // 若用 mouse 事件，手機點過一次後輪播就會黏在暫停狀態
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setIsHovered(true);
      }}
      onPointerLeave={() => setIsHovered(false)}
      onPointerDown={() => {
        isPointerDownRef.current = true;
      }}
      onPointerUp={(event) => {
        // 滑鼠的 focus 在 pointerdown 與 pointerup 之間，此時清除即可；
        // 觸控／觸控筆的相容 mousedown 與 focus 在 pointerup 之後才發生，
        // 若在此清除，focus 會被誤判為鍵盤焦點而暫停
        if (event.pointerType === "mouse") isPointerDownRef.current = false;
      }}
      onPointerCancel={() => {
        // 觸控被捲動／手勢取消時不會有 click，需在此清除旗標
        isPointerDownRef.current = false;
      }}
      onClick={() => {
        // 點擊序列結束；涵蓋點在非按鈕區域（不會觸發 focus）的情況，避免旗標殘留
        isPointerDownRef.current = false;
      }}
      onFocus={() => {
        // 只有鍵盤等非指標操作帶來的焦點才暫停
        if (!isPointerDownRef.current) setHasFocusWithin(true);
        isPointerDownRef.current = false;
      }}
      onBlur={(event) => {
        // 焦點在輪播內部移動時不算離開
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setHasFocusWithin(false);
        }
      }}
    >
      {showControls && (
        <div className="flex justify-end gap-2">
          <button
            type="button"
            aria-label="上一張"
            onClick={goPrev}
            className="inline-flex h-11 w-11 items-center justify-center rounded-pill border-2 border-ink text-ink transition-colors duration-150 hover:bg-surface-raised"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="下一張"
            onClick={goNext}
            className="inline-flex h-11 w-11 items-center justify-center rounded-pill bg-ink text-surface-raised"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      {isBase ? (
        <>
          {/* 手機：全部卡片橫向捲動，不自動播放 */}
          <ul className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-pl-4 px-4 pt-4 pb-4">
            {items.map((item, index) => (
              <li
                key={item.id}
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
                className="w-[260px] shrink-0 snap-start"
              >
                <NoteCard
                  product={item}
                  tilt={NOTE_TILTS[index % NOTE_TILTS.length]}
                  isFirst={index === 0}
                />
              </li>
            ))}
          </ul>
          {showControls && (
            <p className="text-label text-ink-muted">← 左右滑動看更多 →</p>
          )}
        </>
      ) : (
        <ul className="grid grid-cols-3 gap-8 pt-4">
          {visible.map((itemIndex, position) => {
            const item = items[itemIndex];
            return (
              <li key={item.id}>
                <NoteCard
                  product={item}
                  tilt={NOTE_TILTS[itemIndex % NOTE_TILTS.length]}
                  isFirst={position === 0}
                />
              </li>
            );
          })}
        </ul>
      )}

      {/* 指示點：放在 ul 之外，避免混進 listitem */}
      {showControls && (
        <div className="flex justify-center">
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              aria-label={`第 ${index + 1} 張`}
              aria-current={index === activeIndex ? "true" : undefined}
              onClick={() => {
                setCurrentSlide(index);
                scrollToCard(index);
              }}
              className="inline-flex h-11 w-11 items-center justify-center"
            >
              <span
                className={`h-2 w-2 rounded-pill ${
                  index === activeIndex ? "bg-accent" : "bg-dash"
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeaturedCarousel;
