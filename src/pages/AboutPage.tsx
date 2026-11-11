import Layout from "../components/Layout";
import ContactBlock from "../components/ContactBlock";
import { ABOUT_SERVICES } from "../content/abouts";

const Abouts = () => {
  return (
    <Layout footer="address">
      <div className="space-y-8 py-8 xl:space-y-16 xl:py-16">
        <h1 className="text-display font-semibold text-ink">關於我們</h1>

        {/* 公司介紹：文字區不傾斜 */}
        <section
          aria-labelledby="company-title"
          className="grid gap-6 xl:grid-cols-[3fr_2fr] xl:gap-12"
        >
          <div>
            <h2 id="company-title" className="text-heading font-semibold text-ink">
              羽程企業社
            </h2>
            <p className="mt-1 text-label text-ink-muted">KRD MICGO</p>
            <p className="mt-4 max-w-[640px] text-body text-ink-muted">
              我們是一家專業的音響設備供應商，擁有多年的行業經驗。致力於提供高品質的麥克風、擴音設備及相關配件，
              並以專業的技術支援和優質的產品服務，滿足客戶的各種音響需求。
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-4">
            <div className="rounded-card bg-surface-raised p-6">
              <dt className="text-label text-ink-muted">年專業經驗</dt>
              <dd className="text-heading font-semibold text-ink">10+</dd>
            </div>
            <div className="rounded-card bg-surface-raised p-6">
              <dt className="text-label text-ink-muted">滿意客戶</dt>
              <dd className="text-heading font-semibold text-ink">1000+</dd>
            </div>
          </dl>
        </section>

        {/* 聯絡資訊與首頁共用同一個聯絡區，資料來源為 contact.ts */}
        <ContactBlock />

        <section aria-labelledby="services-title">
          <h2 id="services-title" className="text-heading font-semibold text-ink">
            我們的服務
          </h2>
          <ul className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 xl:gap-8">
            {ABOUT_SERVICES.map((service) => (
              <li
                key={service.name}
                className="rounded-card bg-surface-raised p-4 shadow-card-sm md:shadow-card"
              >
                {/* 固定正方形白底，圖片載入前後版面不跳動 */}
                <div className="aspect-square overflow-hidden rounded-image bg-white">
                  <img
                    src={service.image}
                    alt={service.name}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-contain"
                  />
                </div>
                <h3 className="mt-2 text-center text-body font-semibold text-ink">
                  {service.name}
                </h3>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Layout>
  );
};

export default Abouts;
