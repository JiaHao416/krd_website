import { CONTACT } from "../config/contact";
import type { ContactInfo } from "../config/contact";
import type { CopyStatus } from "../hooks/useCopyInquiry";
import { CheckIcon, CopyIcon, PhoneIcon } from "./icons";

interface DetailMobileBarProps {
  /** 複製詢價的狀態（由頁面持有，與行內 CTA 共用） */
  status: CopyStatus;
  /** 點擊複製按鈕 */
  onCopy: () => void;
  /** 聯絡資訊（預設 CONTACT，測試可注入） */
  info?: ContactInfo;
}

// 左：描邊複製鈕；右：主色撥號鈕
const COPY_BUTTON_CLASS =
  "inline-flex h-14 items-center justify-center gap-2 rounded-pill border-2 border-ink text-body font-semibold text-ink transition-colors duration-150 hover:bg-surface";
const CALL_BUTTON_CLASS =
  "inline-flex h-14 items-center justify-center gap-2 rounded-pill bg-accent text-body font-semibold text-accent-ink shadow-btn transition-colors duration-150 hover:bg-accent-hover active:shadow-btn-pressed";

// 詳情頁 base 的雙鈕固定列（md 起隱藏）；複製失敗提示放在列內、按鈕上方跨兩欄
const DetailMobileBar = ({ status, onCopy, info = CONTACT }: DetailMobileBarProps) => (
  <div
    data-testid="detail-mobile-bar"
    aria-live="polite"
    className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-[2fr_3fr] gap-2 bg-surface-raised p-4 shadow-float md:hidden"
  >
    {status === "failed" && (
      <p className="col-span-2 text-label text-danger">複製失敗，請手動選取網址</p>
    )}
    <button type="button" onClick={onCopy} className={COPY_BUTTON_CLASS}>
      {status === "copied" ? (
        <>
          <CheckIcon className="h-5 w-5" />
          已複製
        </>
      ) : (
        <>
          <CopyIcon className="h-5 w-5" />
          複製詢價
        </>
      )}
    </button>
    <a href={`tel:${info.phoneHref}`} className={CALL_BUTTON_CLASS}>
      <PhoneIcon className="h-5 w-5" />
      打電話問問
    </a>
  </div>
);

export default DetailMobileBar;
