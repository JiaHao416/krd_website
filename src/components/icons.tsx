// 全站 inline SVG 圖示：純裝飾（aria-hidden），顏色跟隨文字色（currentColor）
// 路徑取自 Phase 6 示意稿 home-desktop；尺寸由呼叫端以 className 控制

interface IconProps {
  className?: string;
}

/** 介面圖示共用屬性：viewBox 24、線寬 2（stroke 寫在各元件上，明確標示跟隨文字色） */
const UI_ICON_PROPS = {
  viewBox: "0 0 24 24",
  fill: "none",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true",
} as const;

/** 分類圖示共用屬性：viewBox 64、線寬 3.5（UI-SPEC Design System） */
const CATEGORY_ICON_PROPS = {
  viewBox: "0 0 64 64",
  fill: "none",
  strokeWidth: 3.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true",
} as const;

/** 電話 */
export const PhoneIcon = ({ className }: IconProps) => (
  <svg {...UI_ICON_PROPS} stroke="currentColor" className={className}>
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />
  </svg>
);

/** 漢堡選單 */
export const MenuIcon = ({ className }: IconProps) => (
  <svg {...UI_ICON_PROPS} stroke="currentColor" className={className}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

/** 關閉 */
export const CloseIcon = ({ className }: IconProps) => (
  <svg {...UI_ICON_PROPS} stroke="currentColor" className={className}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

/** 向左箭頭 */
export const ChevronLeftIcon = ({ className }: IconProps) => (
  <svg {...UI_ICON_PROPS} stroke="currentColor" className={className}>
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

/** 向右箭頭 */
export const ChevronRightIcon = ({ className }: IconProps) => (
  <svg {...UI_ICON_PROPS} stroke="currentColor" className={className}>
    <path d="M9 18l6-6-6-6" />
  </svg>
);

/** 警示（錯誤狀態） */
export const AlertIcon = ({ className }: IconProps) => (
  <svg {...UI_ICON_PROPS} stroke="currentColor" className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v4M12 16h.01" />
  </svg>
);

/** 分類：有線麥克風 */
export const WiredMicIcon = ({ className }: IconProps) => (
  <svg {...CATEGORY_ICON_PROPS} stroke="currentColor" className={className}>
    <path d="M25 8c4-3 11-3 14 1 2 3 2 16 1 22-1 5-14 5-16 0-2-6-3-19 1-23z" />
    <path d="M17 27c0 10 7 15 15 15s15-6 15-15" />
    <path d="M32 43v12M23 57h18" />
  </svg>
);

/** 分類：無線麥克風 */
export const WirelessMicIcon = ({ className }: IconProps) => (
  <svg {...CATEGORY_ICON_PROPS} stroke="currentColor" className={className}>
    <path d="M26 18c3-3 9-3 12 0 2 3 1 16 0 20-1 4-11 4-12 0-1-5-2-17 0-20z" />
    <path d="M32 42v14M15 15c-5 7-5 15 0 22M49 15c5 7 5 15 0 22" />
  </svg>
);

/** 分類：擴大機／喇叭 */
export const SpeakerIcon = ({ className }: IconProps) => (
  <svg {...CATEGORY_ICON_PROPS} stroke="currentColor" className={className}>
    <path d="M18 7c9-1 20-1 28 0 2 14 2 36 0 50-9 1-20 1-28 0-2-15-2-35 0-50z" />
    <circle cx="32" cy="38" r="9" />
    <circle cx="32" cy="18" r="3.5" />
  </svg>
);

/** 分類：配件 */
export const AccessoryIcon = ({ className }: IconProps) => (
  <svg {...CATEGORY_ICON_PROPS} stroke="currentColor" className={className}>
    <path d="M10 32c0-10 8-18 18-18M54 32c0 10-8 18-18 18" />
    <path d="M28 14l-4-6M36 50l4 6M22 40l20-16" />
  </svg>
);
