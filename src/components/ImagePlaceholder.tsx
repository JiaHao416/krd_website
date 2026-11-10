interface ImagePlaceholderProps {
  size?: "lg" | "sm";
}

// 缺圖佔位元件：商品沒有圖片時顯示，商品頁與首頁共用
const ImagePlaceholder = ({ size = "lg" }: ImagePlaceholderProps) => {
  return (
    <div
      role="img"
      aria-label="暫無圖片"
      className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800"
    >
      <svg
        className={`${size === "lg" ? "w-12 h-12" : "w-8 h-8"} text-gray-500`}
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
      <span className="text-sm text-gray-500 mt-2">暫無圖片</span>
    </div>
  );
};

export default ImagePlaceholder;
