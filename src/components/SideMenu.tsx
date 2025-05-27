import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { airTable } from "../services/index";

interface NavigationItem {
  fields: {
    title: string;
    path: string;
  };
  id?: string;
}

interface SideMenuProps {
  title?: string;
}

const SideMenu = ({ title }: SideMenuProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [navigationData, setNavigationData] = useState<NavigationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function getNavigation() {
      try {
        setIsLoading(true);
        const response = await airTable("navigation", "data");
        // 類型轉換，確保 fields 有必要屬性
        const navigationData = response
          .filter((item) => item.fields?.title && item.fields?.path)
          .map((item) => ({
            ...item,
            fields: {
              ...item.fields,
              title: item.fields.title as string,
              path: item.fields.path as string,
            },
          })) as NavigationItem[];

        setNavigationData(navigationData);
      } catch (error) {
        console.error("Error fetching navigation:", error);
      } finally {
        setIsLoading(false);
      }
    }

    getNavigation();
  }, []);

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const isActivePath = (path: string) => location.pathname === path;

  return (
    <aside className="hidden lg:block w-80 p-6 mr-8">
      <div className="sticky top-24 space-y-6">
        {/* Breadcrumb Card */}
        <div className="relative glass-card p-6 overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-2xl"></div>

          <div className="relative">
            {/* Current category */}
            <div className="space-y-3">
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                {title}
              </h2>
              <div className="h-1 w-16 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="glass-card overflow-hidden">
          {/* Menu Header */}
          <div className="px-6 py-4 border-b border-white/10 bg-gradient-to-r from-blue-500/5 to-purple-500/5">
            <h3 className="text-lg font-bold text-white flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  />
                </svg>
              </div>
              產品分類
            </h3>
          </div>

          {/* Menu Items */}
          <div className="p-3">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="flex items-center px-4 py-3 rounded-xl"
                  >
                    <div className="w-3 h-3 bg-gray-600 rounded-full animate-pulse mr-3"></div>
                    <div className="h-4 bg-gray-600 rounded animate-pulse flex-1"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                {navigationData.map((item, index) => (
                  <button
                    key={item.id || index}
                    onClick={() => handleNavigation(item.fields.path)}
                    className={`w-full flex items-center px-4 py-3 text-left rounded-xl transition-all duration-300 group relative overflow-hidden ${
                      isActivePath(item.fields.path)
                        ? "text-white bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30"
                        : "text-gray-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {/* Active indicator */}
                    {isActivePath(item.fields.path) && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-r-full"></div>
                    )}

                    {/* Dot indicator */}
                    <div
                      className={`w-2.5 h-2.5 rounded-full mr-4 transition-all duration-300 ${
                        isActivePath(item.fields.path)
                          ? "bg-gradient-to-r from-blue-400 to-purple-400 scale-100"
                          : "bg-gray-500 group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 group-hover:scale-110 scale-75"
                      }`}
                    ></div>

                    {/* Menu text */}
                    <span className="font-medium flex-1">
                      {item.fields.title}
                    </span>

                    {/* Arrow icon */}
                    <svg
                      className={`w-4 h-4 transition-all duration-300 ${
                        isActivePath(item.fields.path)
                          ? "text-blue-400 translate-x-0"
                          : "text-gray-500 group-hover:text-blue-400 group-hover:translate-x-1 -translate-x-1 opacity-0 group-hover:opacity-100"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>

                    {/* Hover background effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Contact Info Card */}
        <div className="glass-card p-6 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-full blur-xl"></div>

          <div className="relative">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center mr-3">
                <svg
                  className="w-5 h-5 text-white"
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
              <h3 className="text-lg font-bold text-white">需要協助？</h3>
            </div>

            <p className="text-gray-300 text-sm mb-4 leading-relaxed">
              我們的專業團隊隨時為您提供產品諮詢和技術支援
            </p>

            <div className="space-y-3">
              <a
                href="tel:04-22798787"
                className="flex items-center space-x-3 p-3 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-xl hover:from-green-500/20 hover:to-blue-500/20 transition-all duration-300 group"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">📞</span>
                </div>
                <div>
                  <div className="text-white font-medium group-hover:text-green-400 transition-colors">
                    (04) 22798787
                  </div>
                  <div className="text-gray-400 text-xs">點擊撥打電話</div>
                </div>
              </a>

              <div className="text-center pt-2">
                <div className="text-xs text-gray-500">
                  服務時間：週一至週六 09:00-17:30
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-card p-4">
          <div className="space-y-2">
            <button
              onClick={() => handleNavigation("/new-products")}
              className="w-full flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium rounded-xl transition-all duration-300 transform hover:scale-105 group"
            >
              <svg
                className="w-4 h-4 group-hover:rotate-12 transition-transform"
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
              <span>查看最新產品</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default SideMenu;
