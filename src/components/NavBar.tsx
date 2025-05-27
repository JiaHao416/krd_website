import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { airTable } from "../services/index";

// 定義導航項目的類型
interface NavigationItem {
  fields: {
    title: string;
    path: string;
  };
  id?: string;
}

interface LogoData {
  fields: {
    img: string;
  };
}

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [navigationData, setNavigationData] = useState<NavigationItem[]>([]);
  const [logo, setLogo] = useState<string>("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeHover, setActiveHover] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    async function getLogo() {
      try {
        const response = await airTable("logo", "data");
        const logoData = response
          .filter((item) => item.fields?.img)
          .map((item) => ({
            ...item,
            fields: {
              ...item.fields,
              img: item.fields.img as string,
            },
          })) as LogoData[];

        if (logoData.length > 0) {
          setLogo(logoData[0].fields.img);
        }
      } catch (error) {
        console.error("Error fetching logo:", error);
      }
    }

    async function getNavigation() {
      try {
        const response = await airTable("navigation", "data");
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
      }
    }

    getLogo();
    getNavigation();
  }, []);

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const isActivePath = (path: string) => location.pathname === path;

  return (
    <>
      {/* Main Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "backdrop-blur-2xl bg-slate-950/90 border-b border-white/10 shadow-2xl shadow-blue-500/5"
            : "backdrop-blur-lg bg-slate-950/70 border-b border-white/5"
        }`}
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>

        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-20">
            {/* Logo Section - 增強版 */}
            <div
              className="flex items-center cursor-pointer group relative"
              onClick={() => handleNavigation("/")}
            >
              {logo ? (
                <div className="relative">
                  {/* 白色背景容器讓 Logo 更清晰 */}
                  <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-3 border-2 border-blue-400/50 group-hover:border-blue-500 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-blue-500/30">
                    <img
                      src={logo}
                      alt="KRD MICGO Logo"
                      className="h-7 sm:h-8 md:h-9 lg:h-10 w-auto transition-all duration-300 group-hover:scale-105"
                      style={{
                        filter: "brightness(1.1) contrast(1.1) saturate(1.2)",
                      }}
                    />
                  </div>

                  {/* 發光效果 */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                </div>
              ) : (
                <div className="relative">
                  <h1 className="text-2xl font-black text-white group-hover:text-blue-300 transition-colors duration-300">
                    KRD MICGO
                  </h1>
                  <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full"></div>
                </div>
              )}
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-2">
              {navigationData.map((item, index) => (
                <div key={item.id || index} className="relative">
                  <button
                    onClick={() => handleNavigation(item.fields.path)}
                    onMouseEnter={() => setActiveHover(item.fields.path)}
                    onMouseLeave={() => setActiveHover(null)}
                    className={`relative px-5 py-2.5 font-medium text-sm transition-all duration-300 rounded-xl group ${
                      isActivePath(item.fields.path)
                        ? "text-white bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-blue-500/30"
                        : "text-gray-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <span className="relative z-10">{item.fields.title}</span>

                    {/* Active indicator */}
                    {isActivePath(item.fields.path) && (
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl"></div>
                    )}

                    {/* Hover effect */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-xl transition-opacity duration-200 ${
                        activeHover === item.fields.path &&
                        !isActivePath(item.fields.path)
                          ? "opacity-100"
                          : "opacity-0"
                      }`}
                    ></div>

                    {/* Bottom indicator */}
                    <div
                      className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ${
                        isActivePath(item.fields.path)
                          ? "w-3/4"
                          : activeHover === item.fields.path
                          ? "w-1/2"
                          : "w-0"
                      }`}
                    ></div>
                  </button>
                </div>
              ))}

              {/* Separator */}
              <div className="h-8 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent mx-4"></div>

              {/* About Button */}
              <button
                onClick={() => handleNavigation("/abouts")}
                className={`relative px-6 py-2.5 font-semibold text-sm rounded-full transition-all duration-300 transform hover:scale-105 group overflow-hidden ${
                  isActivePath("/abouts")
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25"
                    : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl hover:shadow-blue-500/20"
                }`}
              >
                <span className="relative z-10 flex items-center space-x-2">
                  <span>商店介紹</span>
                  <svg
                    className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden relative p-3 rounded-xl transition-all duration-300 hover:bg-white/10 group"
            >
              <div className="w-6 h-5 relative flex flex-col justify-between">
                <span
                  className={`w-full h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300 origin-left ${
                    isMenuOpen ? "rotate-45 translate-y-0.5" : ""
                  }`}
                ></span>
                <span
                  className={`w-full h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-300 ${
                    isMenuOpen ? "opacity-0 scale-0" : ""
                  }`}
                ></span>
                <span
                  className={`w-full h-0.5 bg-gradient-to-r from-pink-400 to-blue-400 transition-all duration-300 origin-left ${
                    isMenuOpen ? "-rotate-45 -translate-y-0.5" : ""
                  }`}
                ></span>
              </div>
            </button>
          </div>

          {/* Mobile Menu */}
          <div
            className={`lg:hidden transition-all duration-500 ease-in-out overflow-hidden ${
              isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="py-6 space-y-2 border-t border-white/10">
              {navigationData.map((item, index) => (
                <button
                  key={item.id || index}
                  onClick={() => handleNavigation(item.fields.path)}
                  className={`flex items-center w-full px-4 py-3 text-left rounded-xl transition-all duration-300 group ${
                    isActivePath(item.fields.path)
                      ? "text-blue-400 bg-gradient-to-r from-blue-500/10 to-purple-500/10 pl-6 border-l-2 border-blue-400"
                      : "text-gray-300 hover:text-white hover:bg-white/5 hover:pl-6"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full mr-4 transition-all duration-300 ${
                      isActivePath(item.fields.path)
                        ? "bg-gradient-to-r from-blue-400 to-purple-400 scale-100"
                        : "bg-gray-500 group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 group-hover:scale-100 scale-75"
                    }`}
                  ></div>
                  <span className="font-medium">{item.fields.title}</span>
                  <svg
                    className={`w-4 h-4 ml-auto transition-all duration-300 ${
                      isActivePath(item.fields.path)
                        ? "text-blue-400 translate-x-0"
                        : "text-gray-500 group-hover:text-blue-400 group-hover:translate-x-1"
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
                </button>
              ))}

              <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-4"></div>

              <button
                onClick={() => handleNavigation("/abouts")}
                className={`flex items-center w-full px-4 py-3 text-left rounded-xl font-semibold transition-all duration-300 group ${
                  isActivePath("/abouts")
                    ? "text-white bg-gradient-to-r from-blue-500/20 to-purple-500/20 pl-6 border-l-2 border-blue-400"
                    : "text-blue-400 hover:text-blue-300 hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-purple-500/10 hover:pl-6"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full mr-4 bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300 ${
                    isActivePath("/abouts")
                      ? "scale-100"
                      : "scale-75 group-hover:scale-100"
                  }`}
                ></div>
                <span>商店介紹</span>
                <svg
                  className={`w-4 h-4 ml-auto transition-all duration-300 ${
                    isActivePath("/abouts")
                      ? "text-blue-400 translate-x-0"
                      : "text-blue-500 group-hover:translate-x-1"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer to prevent content from hiding behind navbar */}
      <div className="h-20"></div>
    </>
  );
};

export default NavBar;
