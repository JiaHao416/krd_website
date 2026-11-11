import { CONTACT } from "../config/contact";
import type { ContactInfo } from "../config/contact";
import { PhoneIcon } from "./icons";

interface MobileCallBarProps {
  /** 聯絡資訊（預設 CONTACT，測試可注入） */
  info?: ContactInfo;
}

/** base 固定在底部的撥號列；md 起隱藏（display:none，也不進無障礙樹） */
const MobileCallBar = ({ info = CONTACT }: MobileCallBarProps) => (
  <div className="fixed inset-x-4 bottom-4 z-40 md:hidden">
    <a
      href={`tel:${info.phoneHref}`}
      className="flex h-14 w-full items-center justify-center gap-2 rounded-pill bg-accent text-body font-semibold text-accent-ink shadow-btn-float transition-colors duration-150 hover:bg-accent-hover"
    >
      <PhoneIcon className="h-5 w-5" />
      打電話問問
    </a>
  </div>
);

export default MobileCallBar;
