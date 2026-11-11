import { CONTACT, hasText } from "../config/contact";
import type { ContactInfo } from "../config/contact";
import type { CopyStatus } from "../hooks/useCopyInquiry";
import { CheckIcon, CopyIcon, PhoneIcon } from "./icons";

interface DetailCtaProps {
  /** 複製詢價的狀態（由頁面持有，與手機固定列共用） */
  status: CopyStatus;
  /** 點擊複製按鈕 */
  onCopy: () => void;
  /** 聯絡資訊（預設 CONTACT，測試可注入） */
  info?: ContactInfo;
}

// 主按鈕（撥號）、描邊按鈕（複製）與 LINE 按鈕樣式
const PRIMARY_BUTTON_CLASS =
  "items-center rounded-pill bg-accent px-6 text-body font-semibold text-accent-ink shadow-btn transition-colors duration-150 hover:bg-accent-hover active:shadow-btn-pressed";
const OUTLINE_BUTTON_CLASS =
  "inline-flex h-14 items-center gap-2 rounded-pill border-2 border-ink px-6 text-body font-semibold text-ink transition-colors duration-150 hover:bg-surface-raised";
const LINE_BUTTON_CLASS =
  "inline-flex h-14 items-center rounded-pill border border-dash px-6 text-body text-ink transition-colors duration-150 hover:bg-surface-raised";

// 詳情頁 md 起的行內 CTA 列；base 由手機固定列取代（純 CSS 切換）
const DetailCta = ({ status, onCopy, info = CONTACT }: DetailCtaProps) => (
  <div aria-live="polite" className="hidden flex-col gap-2 md:flex">
    <div className="flex flex-wrap gap-2">
      <a href={`tel:${info.phoneHref}`} className={`inline-flex h-14 gap-2 ${PRIMARY_BUTTON_CLASS}`}>
        <PhoneIcon className="h-5 w-5" />
        打電話問 {info.phone}
      </a>
      <button type="button" onClick={onCopy} className={OUTLINE_BUTTON_CLASS}>
        {status === "copied" ? (
          <>
            <CheckIcon className="h-5 w-5" />
            已複製
          </>
        ) : (
          <>
            <CopyIcon className="h-5 w-5" />
            複製詢價訊息
          </>
        )}
      </button>
      {hasText(info.lineUrl) && (
        <a
          href={info.lineUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={LINE_BUTTON_CLASS}
        >
          LINE 問問
        </a>
      )}
    </div>
    {status === "failed" && <p className="text-label text-danger">複製失敗，請手動選取網址</p>}
  </div>
);

export default DetailCta;
