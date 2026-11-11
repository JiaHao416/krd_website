import { CONTACT, hasText } from "../config/contact";
import type { ContactInfo } from "../config/contact";
import { PhoneIcon } from "./icons";

// 店面照片卡依序循環的傾斜角度（絕對值 ≤ 2deg）
const PHOTO_TILTS = ["-rotate-1", "rotate-[1deg]", "-rotate-[0.5deg]"];

interface ContactBlockProps {
  info?: ContactInfo;
}

// 首頁與關於我們共用的聯絡區，資料單一來源為 contact.ts
// LINE／Email 為選填，有值才顯示；文字用 ink 加底線，block-2 底上不用 accent 文字（對比不足）
const ContactBlock = ({ info = CONTACT }: ContactBlockProps) => {
  const showLine = hasText(info.lineUrl);
  const showEmail = hasText(info.email);
  const photos = info.storePhotos ?? [];

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

      {/* 外層不傾斜也不 overflow-hidden，避免裁掉地圖框的旋轉角落；開啟連結（文字）不傾斜 */}
      <div>
        {hasText(info.mapEmbedUrl) ? (
          // 使用者核准的免金鑰 Google 地圖嵌入，取代 UI-SPEC 原本「不嵌 iframe」的設定
          // overflow-hidden 只加在地圖框本身，用來把 iframe 裁成圓角
          <div className="h-[140px] -rotate-[1.5deg] overflow-hidden rounded-block border-[3px] border-dash bg-surface-raised xl:h-[220px]">
            <iframe
              src={info.mapEmbedUrl}
              title="羽程企業社 Google 地圖"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="block h-full w-full border-0"
            />
          </div>
        ) : (
          // 未設定嵌入網址時的預留位（D-15）
          <div
            role="img"
            aria-label="地圖（待嵌入）"
            className="flex h-[140px] -rotate-[1.5deg] items-center justify-center rounded-block border-[3px] border-dashed border-dash bg-surface-raised text-label text-ink-muted xl:h-[220px]"
          >
            地圖（待嵌入）
          </div>
        )}
        {hasText(info.mapUrl) && (
          <a
            href={info.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block text-body text-ink underline underline-offset-4"
          >
            在 Google 地圖開啟 →
          </a>
        )}
      </div>

      {/* 店面照片：手機單欄堆疊、md 以上三欄；不用橫向捲動，因其需 overflow 會裁掉傾斜角落與膠帶 */}
      {/* xl 橫跨資訊＋地圖兩欄；pt-4 給膠帶留空間；ul 與 section 皆不加 overflow-hidden */}
      {photos.length > 0 && (
        <ul aria-label="店面照片" className="grid gap-6 pt-4 md:grid-cols-3 xl:col-span-2">
          {photos.map((photo, index) => (
            <li
              key={photo.src}
              className={`relative rounded-card bg-surface-raised p-2 ${PHOTO_TILTS[index % PHOTO_TILTS.length]}`}
            >
              <span
                aria-hidden="true"
                className="absolute -top-4 left-1/2 h-7 w-24 -translate-x-1/2 -rotate-[4deg] bg-tape/80"
              />
              {/* 固定 4:3 比例框裁切；width/height 讓瀏覽器先預留版位避免 CLS */}
              <div className="aspect-[4/3] overflow-hidden rounded-image">
                <img
                  src={photo.src}
                  alt={photo.alt}
                  width={photo.width}
                  height={photo.height}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default ContactBlock;
