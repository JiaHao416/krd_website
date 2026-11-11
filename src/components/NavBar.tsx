import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { NAV_ITEMS } from "../config/navigation";
import { CONTACT } from "../config/contact";
import { CloseIcon, MenuIcon, PhoneIcon } from "./icons";

/** 導覽連結共用樣式（主選單與行動版面板） */
const NAV_LINK_CLASS =
  "inline-flex h-11 items-center rounded-pill px-4 text-body text-ink transition-colors duration-150 hover:bg-block-2";

/** 導覽連結選中時追加的樣式 */
const NAV_LINK_ACTIVE_CLASS = "bg-block-2 font-semibold";

interface NavLinkItem {
  title: string;
  path: string;
  isActive: boolean;
}

const NavBar = () => {
  const { pathname } = useLocation();
  // Logo 載入失敗時改顯示文字
  const [logoFailed, setLogoFailed] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const containerRef = useRef<HTMLElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // 「逛商品」在任一分類頁或商品詳情頁都算選中
  const isShopActive =
    NAV_ITEMS.some((item) => item.path === pathname) ||
    pathname.startsWith("/products/");
  const isAboutActive = pathname === "/abouts";

  const links: NavLinkItem[] = [
    { title: "逛商品", path: "/all-products", isActive: isShopActive },
    { title: "關於我們", path: "/abouts", isActive: isAboutActive },
  ];

  // 面板開啟時才監聽 Esc 與點外側；關閉或卸載時移除，避免監聽洩漏
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        buttonRef.current?.focus();
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isMenuOpen]);

  /**
   * 產生導覽連結
   * @param onClick - 點擊後的額外動作（行動版用來關閉面板）
   */
  const renderLinks = (onClick?: () => void) =>
    links.map(({ title, path, isActive }) => (
      <Link
        key={path}
        to={path}
        aria-current={isActive ? "page" : undefined}
        className={
          isActive ? `${NAV_LINK_CLASS} ${NAV_LINK_ACTIVE_CLASS}` : NAV_LINK_CLASS
        }
        onClick={onClick}
      >
        {title}
      </Link>
    ));

  return (
    <header ref={containerRef} className="relative">
      <div className="flex items-center justify-between gap-4 rounded-pill bg-surface-raised py-1 pr-1 pl-4 shadow-bar-sm md:py-2 md:pr-2 md:pl-6 md:shadow-bar">
        <Link to="/" className="inline-flex items-center">
          {!logoFailed ? (
            // 原始 Logo 為深灰單色圖，放在深色頂列上看不見，以濾鏡轉成白色
            <img
              src="/brand-logo.png"
              width={800}
              height={235}
              onError={() => setLogoFailed(true)}
              alt="KRD MICGO Logo"
              className="h-[26px] w-auto brightness-0 invert md:h-[30px]"
            />
          ) : (
            // 每頁已有自己的 h1，備援文字不可用標題元素
            <span className="text-body font-semibold text-ink">KRD MICGO</span>
          )}
        </Link>

        {/* md 以上的主選單 */}
        <nav aria-label="主選單" className="hidden items-center gap-2 md:flex">
          {renderLinks()}
        </nav>

        {/* md 以上的電話按鈕；手機改由固定撥號列提供 */}
        <a
          href={`tel:${CONTACT.phoneHref}`}
          className="hidden h-11 items-center gap-2 rounded-pill bg-accent px-6 text-body font-semibold text-accent-ink transition-colors duration-150 hover:bg-accent-hover md:inline-flex"
        >
          <PhoneIcon className="h-[18px] w-[18px]" />
          打電話問問
        </a>

        {/* 手機選單鈕 */}
        <button
          ref={buttonRef}
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-pill bg-block-3 text-ink md:hidden"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
          aria-label={isMenuOpen ? "關閉選單" : "開啟選單"}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          {isMenuOpen ? (
            <CloseIcon className="h-6 w-6" />
          ) : (
            <MenuIcon className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* 行動版面板：一律渲染，讓 aria-controls 永遠指得到元素 */}
      <div
        id="mobile-menu"
        hidden={!isMenuOpen}
        className="absolute inset-x-0 top-full z-30 mt-2 rounded-block bg-surface-raised p-2 shadow-float md:hidden"
      >
        <nav aria-label="行動版選單" className="flex flex-col gap-1">
          {renderLinks(() => setIsMenuOpen(false))}
        </nav>
      </div>
    </header>
  );
};

export default NavBar;
