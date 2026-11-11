import type { ReactNode } from "react";
import NavBar from "./NavBar";
import Footer from "./Footer";
import MobileCallBar from "./MobileCallBar";

interface LayoutProps {
  children: ReactNode;
  /** 頁尾文案：首頁與列表用 thanks，其餘頁用 address */
  footer: "thanks" | "address";
  /** base 底部固定列；預設為全站單鈕撥號列，詳情頁傳入雙鈕列 */
  mobileBar?: ReactNode;
}

/** 全站骨架：skip link、頂列、主要內容、一行頁尾、base 固定列 */
const Layout = ({
  children,
  footer,
  mobileBar = <MobileCallBar />,
}: LayoutProps) => (
  // base 底部留 96px 給固定撥號列；md 起沒有固定列
  <div className="flex min-h-screen flex-col pb-24 md:pb-0">
    {/* skip link：第一個 tab stop，聚焦時顯示為主按鈕樣式 */}
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:inline-flex focus:h-11 focus:items-center focus:rounded-pill focus:bg-accent focus:px-6 focus:text-body focus:font-semibold focus:text-accent-ink"
    >
      跳到主要內容
    </a>
    <div className="mx-auto w-full max-w-[1280px] px-4 pt-4 md:px-8 md:pt-6 xl:px-16">
      <NavBar />
    </div>
    <main
      id="main"
      tabIndex={-1}
      className="mx-auto w-full max-w-[1280px] flex-1 px-4 md:px-8 xl:px-16"
    >
      {children}
    </main>
    <Footer variant={footer} />
    {mobileBar}
  </div>
);

export default Layout;
