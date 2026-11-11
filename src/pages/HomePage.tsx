import { useNavigate } from "react-router-dom"; // 添加 React Router 導航 hook
import Layout from "../components/Layout";
import FeaturedCarousel from "../components/FeaturedCarousel";
import { useProducts } from "../hooks/useProducts";
import { HOME_FEATURED_QUERIES } from "../services/catalog";

const Home = () => {
  // 使用 React Router 的導航 hook
  const navigate = useNavigate();

  // 兩組熱銷輪播各自獨立載入，一組失敗不影響另一組
  const featured1 = useProducts(HOME_FEATURED_QUERIES[0]);
  const featured2 = useProducts(HOME_FEATURED_QUERIES[1]);

  return (
    <Layout footer="thanks">
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        {/* 背景裝飾 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>

        {/* Hero Section */}
        <div className="relative">
          <div className="max-w-7xl mx-auto px-4 py-32">
            <div className="text-center">
              <div className="mb-8">
                <h1 className="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-8 animate-fade-in">
                  KRD MICGO
                </h1>
                <div className="flex items-center justify-center space-x-4 mb-8">
                  <div className="h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent w-32"></div>
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <div className="h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent w-32"></div>
                </div>
              </div>

              <p className="text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-12 animate-slide-up">
                專業音響設備供應商，為您提供最優質的音頻解決方案
                <br />
                <span className="text-lg text-gray-400">
                  致力於打造完美的聲音體驗
                </span>
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate("/all-products")} // 點擊時導航到所有產品頁面
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-4 px-8 rounded-full transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-2xl"
                >
                  探索產品
                </button>
                <button
                  onClick={() => navigate("/abouts")} // 點擊時導航到關於我們頁面
                  className="border-2 border-white/20 hover:border-white/40 text-white font-medium py-4 px-8 rounded-full transition-all duration-200 backdrop-blur-sm hover:bg-white/5"
                >
                  聯絡我們
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 特色產品區域 */}
        <div className="relative max-w-7xl mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-6">精選產品</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              探索我們最受歡迎的專業音響設備，每一款都經過精心挑選
            </p>
            <div className="flex justify-center mt-8">
              <div className="h-1 w-40 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"></div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
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
                      d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                    />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  熱門推薦系列
                </h3>
              </div>
              <FeaturedCarousel
                result={featured1}
                accent="blue"
                intervalMs={5000}
              />
            </div>

            <div className="space-y-8">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
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
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  頂級精選系列
                </h3>
              </div>
              <FeaturedCarousel
                result={featured2}
                accent="purple"
                intervalMs={5500}
              />
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="relative max-w-6xl mx-auto px-4 py-20">
          <div className="relative glass-card p-16 text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

            <div className="relative z-10">
              <h3 className="text-4xl font-bold text-white mb-6">
                準備開始您的音響之旅？
              </h3>
              <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                我們的專業團隊隨時為您提供諮詢服務，
                讓我們一起打造屬於您的完美音響體驗
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <button
                  onClick={() => navigate("/all-products")} // 點擊時導航到所有產品頁面
                  className="border-2 border-white/30 hover:border-white/50 text-white font-medium py-4 px-8 rounded-full transition-all duration-200 backdrop-blur-sm hover:bg-white/10"
                >
                  查看所有產品
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
