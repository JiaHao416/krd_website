import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { airTable } from "../services/index";

// 定義服務項目的類型
interface ServiceItem {
  fields: {
    img_url: string;
    icon_name: string;
  };
  id?: string;
}

const Abouts = () => {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function getServices() {
      try {
        setIsLoading(true);
        const response = await airTable("abouts", "data");
        // 類型轉換，確保 fields 有必要屬性
        const serviceData = response
          .filter((item) => item.fields?.img_url && item.fields?.icon_name)
          .map((item) => ({
            ...item,
            fields: {
              ...item.fields,
              img_url: item.fields.img_url as string,
              icon_name: item.fields.icon_name as string,
            },
          })) as ServiceItem[];

        setServices(serviceData);
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setIsLoading(false);
      }
    }

    getServices();
  }, []);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500/3 rounded-full blur-3xl"></div>
        </div>

        {/* Hero Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-pink-600/10"></div>
          <div className="relative max-w-7xl mx-auto px-4 py-32">
            <div className="text-center">
              <div className="mb-8">
                <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-8 animate-fade-in">
                  關於我們
                </h1>
                <div className="flex items-center justify-center space-x-4 mb-8">
                  <div className="h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent w-32"></div>
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <div className="h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent w-32"></div>
                </div>
              </div>

              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed animate-slide-up">
                專業音響設備供應商，致力於為每位客戶提供最優質的音頻解決方案
              </p>
            </div>
          </div>
        </div>

        {/* Company Info Section */}
        <div className="relative max-w-7xl mx-auto px-4 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-32">
            {/* Company Description */}
            <div className="space-y-8">
              <div className="glass-card p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-2xl"></div>

                <div className="relative">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-white">
                        羽程企業社
                      </h2>
                      <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-2"></div>
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-6">
                    KRD MICGO
                  </h3>

                  <p className="text-gray-300 leading-relaxed text-lg">
                    我們是一家專業的音響設備供應商，擁有多年的行業經驗。致力於提供高品質的麥克風、擴音設備及相關配件，
                    並以專業的技術支援和優質的產品服務，滿足客戶的各種音響需求。
                  </p>

                  <div className="grid grid-cols-2 gap-4 mt-8">
                    <div className="text-center p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl">
                      <div className="text-2xl font-bold text-blue-400 mb-1">
                        10+
                      </div>
                      <div className="text-gray-400 text-sm">年專業經驗</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl">
                      <div className="text-2xl font-bold text-purple-400 mb-1">
                        1000+
                      </div>
                      <div className="text-gray-400 text-sm">滿意客戶</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div className="glass-card p-10 relative overflow-hidden">
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-full blur-2xl"></div>

                <div className="relative">
                  <div className="flex items-center space-x-4 mb-8">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-white">
                        聯絡我們
                      </h3>
                      <div className="h-1 w-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mt-2"></div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Address */}
                    <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-xl hover:from-blue-500/10 hover:to-purple-500/10 transition-all duration-300">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-6 h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <div className="text-white font-semibold mb-1">
                          地址
                        </div>
                        <div className="text-gray-300 leading-relaxed">
                          台中市太平區永平路二段320之1號
                        </div>
                      </div>
                    </div>

                    {/* Phone */}
                    <a
                      href="tel:04-22798787"
                      className="flex items-center space-x-4 p-4 bg-gradient-to-r from-green-500/5 to-blue-500/5 rounded-xl hover:from-green-500/10 hover:to-blue-500/10 transition-all duration-300 group"
                    >
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <svg
                          className="w-6 h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                      </div>
                      <div>
                        <div className="text-white font-semibold mb-1 group-hover:text-green-400 transition-colors">
                          電話
                        </div>
                        <div className="text-gray-300 group-hover:text-green-300 transition-colors">
                          (04) 22798787
                        </div>
                        <div className="text-gray-500 text-xs">
                          點擊撥打電話
                        </div>
                      </div>
                    </a>

                    {/* Business Hours */}
                    <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-xl">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-6 h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <div className="text-white font-semibold mb-1">
                          營業時間
                        </div>
                        <div className="text-gray-300">
                          週一至週六 09:00 - 17:30
                        </div>
                        <div className="text-gray-500 text-xs">
                          週日及國定假日休息
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Services Section */}
          <div className="text-center mb-16">
            <h3 className="text-5xl font-bold text-white mb-6">我們的服務</h3>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
              提供全方位的音響解決方案，滿足不同場合的需求
            </p>
            <div className="flex justify-center">
              <div className="h-1 w-32 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"></div>
            </div>
          </div>

          {/* Services Grid - 改進版 */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="glass-card p-6 animate-pulse">
                  <div className="aspect-square bg-gray-700 rounded-xl mb-4"></div>
                  <div className="h-4 bg-gray-700 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {services.map((service, index) => (
                <div
                  key={service.id || index}
                  className="group glass-card p-6 hover:border-blue-500/30 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/10 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* 明亮的圖標容器 */}
                  <div className="aspect-square mb-6 overflow-hidden rounded-2xl relative">
                    {/* 白色背景讓圖標更明顯 */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-white group-hover:from-blue-50 group-hover:to-purple-50 transition-all duration-500"></div>

                    {/* 圖標容器 */}
                    <div className="relative w-full h-full flex items-center justify-center p-8">
                      <img
                        src={service.fields.img_url}
                        alt={service.fields.icon_name}
                        className="w-full h-full object-contain transition-all duration-500 group-hover:scale-110"
                        style={{
                          filter: "brightness(0.2) contrast(1.5) saturate(1.2)",
                          maxWidth: "80%",
                          maxHeight: "80%",
                        }}
                      />
                    </div>

                    {/* 懸停時的彩色邊框 */}
                    <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-blue-400/50 transition-all duration-300"></div>

                    {/* 懸停時的光暈效果 */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  <h4 className="text-white font-semibold text-center text-lg group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 transition-all duration-300">
                    {service.fields.icon_name}
                  </h4>
                </div>
              ))}
            </div>
          )}

          {/* CTA Section */}
          <div className="mt-32">
            <div className="glass-card p-16 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

              <div className="relative">
                <h3 className="text-4xl font-bold text-white mb-6">
                  準備開始合作？
                </h3>
                <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
                  讓我們的專業團隊為您提供最適合的音響解決方案
                </p>

                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <a
                    href="tel:04-22798787"
                    className="group bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-4 px-8 rounded-full transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-2xl"
                  >
                    <span className="flex items-center justify-center space-x-2">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      <span>立即聯絡</span>
                    </span>
                  </a>
                  <button className="border-2 border-white/30 hover:border-white/50 text-white font-medium py-4 px-8 rounded-full transition-all duration-200 backdrop-blur-sm hover:bg-white/10">
                    查看產品目錄
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Abouts;
