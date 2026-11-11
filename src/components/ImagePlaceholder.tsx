interface ImagePlaceholderProps {
  size?: "lg" | "sm";
}

// 缺圖佔位元件：商品沒有圖片或載入失敗時顯示，商品頁與首頁共用
// 白底與圖片容器一致；圖示與文字用 accent-ink，白底上對比足夠
const ImagePlaceholder = ({ size = "lg" }: ImagePlaceholderProps) => {
  return (
    <div
      role="img"
      aria-label="暫無圖片"
      className="flex h-full w-full flex-col items-center justify-center bg-white"
    >
      <svg
        className={`${size === "lg" ? "h-12 w-12" : "h-8 w-8"} text-accent-ink`}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
        />
      </svg>
      <span className="mt-2 text-label text-accent-ink">暫無圖片</span>
    </div>
  );
};

export default ImagePlaceholder;
