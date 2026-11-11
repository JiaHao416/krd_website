import { CONTACT } from "../config/contact";
import type { ContactInfo } from "../config/contact";

interface FooterProps {
  /** 頁尾文案：首頁與列表用 thanks，其餘頁用 address */
  variant: "thanks" | "address";
  /** 聯絡資訊（預設 CONTACT，測試可注入） */
  info?: ContactInfo;
}

/** 一行置中頁尾 */
const Footer = ({ variant, info = CONTACT }: FooterProps) => {
  const text =
    variant === "thanks"
      ? "© KRD・謝謝你逛到這裡"
      : `© KRD・${info.address}・${info.businessHours}`;

  return (
    <footer className="px-4 py-8 text-center text-label text-ink-muted">
      {text}
    </footer>
  );
};

export default Footer;
