import type { ComponentType } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import FeaturedCarousel from "../components/FeaturedCarousel";
import ContactBlock from "../components/ContactBlock";
import {
  AccessoryIcon,
  SpeakerIcon,
  WiredMicIcon,
  WirelessMicIcon,
} from "../components/icons";
import { CONTACT, splitBusinessHours } from "../config/contact";
import { PRODUCT_PAGE_VIEWS } from "../config/productPageViews";
import { useProducts } from "../hooks/useProducts";
import { HOME_FEATURED_QUERIES } from "../services/catalog";
import type { ProductPagePath } from "../services/catalog";

// 營業中戳章的兩行文字，由聯絡資訊單一來源拆出
const [hoursLine1, hoursLine2] = splitBusinessHours(CONTACT.businessHours);

/** 分類貼紙卡設定：底色與傾斜用靜態 class，避免動態組字讓 Tailwind 掃不到 */
interface CategoryCard {
  path: ProductPagePath;
  cardClass: string;
  circleClass: string;
  Icon: ComponentType<{ className?: string }>;
}

const CATEGORY_CARDS: readonly CategoryCard[] = [
  {
    path: "/wired-micphone",
    cardClass: "bg-block-1 -rotate-2",
    circleClass: "bg-surface-raised",
    Icon: WiredMicIcon,
  },
  {
    path: "/wireless-micphone",
    cardClass: "bg-block-2 rotate-[1.5deg]",
    circleClass: "bg-surface-raised",
    Icon: WirelessMicIcon,
  },
  {
    path: "/trumpet",
    cardClass: "bg-block-3 -rotate-1",
    circleClass: "bg-surface-raised",
    Icon: SpeakerIcon,
  },
  {
    path: "/accessories",
    cardClass: "bg-surface-raised rotate-2",
    circleClass: "bg-block-1",
    Icon: AccessoryIcon,
  },
];

const Home = () => {
  // 兩組熱銷輪播各自獨立載入，一組失敗不影響另一組
  const featured1 = useProducts(HOME_FEATURED_QUERIES[0]);
  const featured2 = useProducts(HOME_FEATURED_QUERIES[1]);

  return (
    <Layout footer="thanks">
      <div className="space-y-8 py-8 xl:space-y-16 xl:py-16">
        {/* 主視覺：文案與按鈕在左，店面照片預留位與營業中戳章在右 */}
        <section
          aria-labelledby="hero-title"
          className="grid gap-8 xl:grid-cols-[6fr_5fr] xl:items-center xl:gap-16"
        >
          <div>
            <span className="inline-flex items-center rounded-pill bg-block-1 px-4 py-1 text-label font-semibold text-ink">
              台中太平・實體門市
            </span>
            <h1 id="hero-title" className="mt-4 text-display font-semibold text-ink">
              找麥克風、喇叭？
              <br />
              {/* 螢光筆底線：md 起為手繪 SVG，手機改為 4px 實線 */}
              <span className="relative inline-block border-b-4 border-tape md:border-b-0">
                來問我們
                <svg
                  aria-hidden="true"
                  viewBox="0 0 230 20"
                  fill="none"
                  preserveAspectRatio="none"
                  className="absolute -bottom-[10px] left-0 hidden h-5 w-full text-tape md:block"
                >
                  <path
                    d="M3 14c30-9 60-9 90-3s70 4 134-8"
                    stroke="currentColor"
                    strokeWidth={8}
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              就對了。
            </h1>
            <p className="mt-4 max-w-[520px] text-body text-ink-muted">
              <span className="hidden md:inline">我們是在太平開店的音響盤商，</span>
              有線、無線麥克風到擴大機都有。不確定要選哪一款？打個電話來問就好。
            </p>
            {/* 手機寬度由固定撥號列承擔撥號，按鈕列只在 md+ 顯示 */}
            <div className="mt-8 hidden flex-wrap items-center gap-6 md:flex">
              <Link
                to="/all-products"
                className="inline-flex h-14 items-center rounded-pill bg-ink px-8 text-body font-semibold text-surface-raised transition-colors duration-150 hover:bg-ink-muted"
              >
                逛逛商品 →
              </Link>
              <a
                href={`tel:${CONTACT.phoneHref}`}
                className="border-b-2 border-dashed border-accent text-body font-semibold text-accent transition-colors duration-150 hover:text-accent-hover"
              >
                {CONTACT.phone}
              </a>
            </div>
          </div>

          <div className="relative">
            {/* 店面照片尚未提供，以預留位正式呈現（D-15） */}
            <div
              role="img"
              aria-label="店面照片（待提供）"
              className="flex h-[200px] rotate-[1.5deg] items-center justify-center rounded-block border-[3px] border-dashed border-dash bg-sand text-label text-ink-muted md:h-[320px] md:rotate-2 md:rounded-panel xl:h-[420px]"
            >
              店面照片（待提供）
            </div>
            {/* 營業中戳章為裝飾，對輔助科技隱藏；營業時間由聯絡區提供 */}
            <div
              aria-hidden="true"
              className="absolute -left-8 bottom-8 hidden h-[148px] w-[148px] -rotate-[10deg] flex-col items-center justify-center rounded-pill bg-block-3 text-center text-ink shadow-card xl:flex"
            >
              <span className="text-heading font-semibold">營業中</span>
              <span className="text-label">{hoursLine1}</span>
              <span className="text-label">{hoursLine2}</span>
            </div>
          </div>
        </section>

        {/* 分類貼紙卡：整張卡為連結 */}
        <section aria-labelledby="categories-title">
          <h2 id="categories-title" className="text-heading font-semibold text-ink">
            想找什麼？
          </h2>
          <ul className="mt-6 grid grid-cols-2 gap-4 py-2 md:gap-6 xl:grid-cols-4 xl:gap-8">
            {CATEGORY_CARDS.map(({ path, cardClass, circleClass, Icon }) => (
              <li key={path}>
                <Link
                  to={path}
                  className={`flex h-full min-h-[136px] flex-col justify-between rounded-block p-4 text-ink shadow-card-sm transition-colors duration-150 hover:ring-2 hover:ring-inset hover:ring-accent md:min-h-[180px] md:p-6 md:shadow-card ${cardClass}`}
                >
                  <span
                    className={`flex h-16 w-16 items-center justify-center rounded-pill ${circleClass}`}
                  >
                    <Icon className="h-[34px] w-[34px]" />
                  </span>
                  {/* 手機卡寬只有約 145px，名稱與「看看 →」改上下排列，避免名稱被擠成直排 */}
                  <span className="mt-4 flex flex-col items-start gap-1 md:flex-row md:items-end md:justify-between md:gap-2">
                    <span className="text-heading font-semibold">
                      {PRODUCT_PAGE_VIEWS[path].title}
                    </span>
                    <span className="shrink-0 text-label">看看 →</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* 熱銷：同一個標題下兩組獨立輪播，各以 group 命名供輔助科技與測試辨識 */}
        <section aria-labelledby="featured-title">
          <h2 id="featured-title" className="text-heading font-semibold text-ink">
            這陣子大家都在問
          </h2>
          <div role="group" aria-label="熱門推薦系列" className="mt-6">
            <FeaturedCarousel result={featured1} intervalMs={5000} />
          </div>
          <div role="group" aria-label="頂級精選系列" className="mt-12">
            <FeaturedCarousel result={featured2} intervalMs={5500} />
          </div>
        </section>

        <ContactBlock />
      </div>
    </Layout>
  );
};

export default Home;
