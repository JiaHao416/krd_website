import { Link } from "react-router-dom";
import { AlertIcon } from "./icons";

interface NotFoundStateProps {
  /** 面板標題（頁面唯一的 h1） */
  title: string;
  /** 標題下方的說明 */
  description: string;
  /** 主按鈕文字 */
  actionLabel: string;
  /** 主按鈕連結目標 */
  actionTo: string;
}

// 主按鈕外觀（accent 底＋實色陰影，按下時陰影變淺），與列表頁錯誤卡一致
const PRIMARY_BUTTON_CLASS =
  "items-center rounded-pill bg-accent px-6 text-body font-semibold text-accent-ink shadow-btn transition-colors duration-150 hover:bg-accent-hover active:shadow-btn-pressed";

/**
 * 可重用的「找不到」面板：全域 NotFound 與商品版共用。
 * 分頁標題由呼叫端頁面決定，面板本身不設定。
 */
const NotFoundState = ({
  title,
  description,
  actionLabel,
  actionTo,
}: NotFoundStateProps) => (
  <div className="flex justify-center py-16">
    <div className="w-full max-w-[560px] rounded-block bg-surface-raised p-8 text-center">
      <AlertIcon className="mx-auto h-12 w-12 text-ink-muted" />
      <h1 className="mt-4 text-heading font-semibold text-ink">{title}</h1>
      <p className="mt-2 text-body text-ink-muted">{description}</p>
      <Link
        to={actionTo}
        className={`mt-6 inline-flex h-11 ${PRIMARY_BUTTON_CLASS}`}
      >
        {actionLabel}
      </Link>
    </div>
  </div>
);

export default NotFoundState;
