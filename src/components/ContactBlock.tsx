import { CONTACT, hasText } from "../config/contact";
import type { ContactInfo } from "../config/contact";
import { PhoneIcon } from "./icons";

interface ContactBlockProps {
  info?: ContactInfo;
}

// 首頁與關於我們共用的聯絡區，資料單一來源為 contact.ts
// LINE／Email 為選填，有值才顯示；文字用 ink 加底線，block-2 底上不用 accent 文字（對比不足）
const ContactBlock = ({ info = CONTACT }: ContactBlockProps) => {
  const showLine = hasText(info.lineUrl);
  const showEmail = hasText(info.email);

  return (
    <section
      aria-labelledby="contact-title"
      className="grid gap-6 rounded-block bg-block-2 p-6 md:rounded-panel md:p-12 xl:grid-cols-[5fr_4fr] xl:items-center xl:gap-12"
    >
      <div>
        <h2 id="contact-title" className="text-heading font-semibold text-ink">
          有空來店裡坐坐
        </h2>
        <p className="mt-4 text-body text-ink">{info.address}</p>
        {(showLine || showEmail) && (
          <p className="mt-2 flex flex-wrap gap-4 text-body text-ink">
            {showLine && (
              <a
                href={info.lineUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4"
              >
                LINE
              </a>
            )}
            {showEmail && (
              <a href={`mailto:${info.email}`} className="underline underline-offset-4">
                {info.email}
              </a>
            )}
          </p>
        )}
        <p className="mt-2 text-body text-ink">
          {info.businessHours}
          {/* 備註自帶括號，這裡不再外包；md+ 為 inline，以 md:ml-2 與營業時間隔開 */}
          <span className="block text-label text-ink-muted md:ml-2 md:inline md:text-body md:text-ink">
            {info.closedNote}
          </span>
        </p>
        {/* 手機寬度由固定撥號列承擔，這裡只在 md+ 顯示 */}
        <a
          href={`tel:${info.phoneHref}`}
          className="mt-6 hidden h-14 items-center gap-2 rounded-pill bg-accent px-6 text-body font-semibold text-accent-ink shadow-btn transition-colors duration-150 hover:bg-accent-hover active:shadow-btn-pressed md:inline-flex"
        >
          <PhoneIcon className="h-5 w-5" />
          {info.phone}
        </a>
      </div>

      {/* 地圖素材尚未提供，以預留位正式呈現（D-15） */}
      <div
        role="img"
        aria-label="地圖（待嵌入）"
        className="flex h-[140px] -rotate-[1.5deg] items-center justify-center rounded-block border-[3px] border-dashed border-dash bg-surface-raised text-label text-ink-muted xl:h-[220px]"
      >
        地圖（待嵌入）
      </div>
    </section>
  );
};

export default ContactBlock;
