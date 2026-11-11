import { useEffect, useRef } from "react";
import { CloseIcon } from "./icons";

interface ImageModalProps {
  show: boolean;
  onHide: () => void;
  img: string;
}

const ImageModal = ({ show, onHide, img }: ImageModalProps) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // 開啟時把焦點移到關閉鈕並鎖住 Tab，關閉時還原到觸發元素（通常是商品卡）
  useEffect(() => {
    if (!show) return;
    const previous = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    // 燈箱內只有關閉鈕可聚焦，Tab／Shift+Tab 一律留在關閉鈕
    const handleTab = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        e.preventDefault();
        closeButtonRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleTab);
    return () => {
      document.removeEventListener("keydown", handleTab);
      previous?.focus();
    };
  }, [show]);

  // 防止背景滾動和處理 ESC 鍵
  useEffect(() => {
    if (show) {
      // 防止背景滾動
      document.body.style.overflow = "hidden";

      // ESC 鍵關閉
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onHide();
        }
      };

      document.addEventListener("keydown", handleEscape);

      return () => {
        document.body.style.overflow = "unset";
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [show, onHide]);

  if (!show) return null;

  // 處理背景點擊，防止事件冒泡
  const handleBackdropClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.target === e.currentTarget) {
      onHide();
    }
  };

  // 處理關閉按鈕點擊
  const handleCloseClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onHide();
  };

  // 防止圖片點擊冒泡
  const handleImageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="商品大圖"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* 背景遮罩：surface 90% */}
      <div className="absolute inset-0 bg-surface/90" />

      {/* 圖片容器 */}
      <div
        className="relative max-w-full max-h-full"
        onClick={handleImageClick}
      >
        {/* 關閉按鈕：右上 44×44 */}
        <button
          ref={closeButtonRef}
          onClick={handleCloseClick}
          className="absolute -right-4 -top-4 z-20 inline-flex h-11 w-11 items-center justify-center rounded-pill bg-ink text-surface"
          aria-label="關閉圖片"
          type="button"
        >
          <CloseIcon className="h-5 w-5" />
        </button>

        {/* 圖片：白底容器、不裁切 */}
        <div className="relative overflow-hidden rounded-block bg-white">
          <img
            src={img}
            alt="產品詳細圖片"
            className="max-h-[90vh] max-w-full object-contain"
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
          />
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
