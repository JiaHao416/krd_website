import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Abouts from "./pages/AboutPage";
import ProductPageTemplate from "./pages/ProductPageTemplate";
import NotFoundPage from "./pages/NotFoundPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import { PRODUCT_PAGES } from "./services/catalog";
import { PRODUCT_PAGE_VIEWS } from "./config/productPageViews";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/abouts" element={<Abouts />} />
      {/* 商品頁由設定產生；ProductPageTemplate 的 key 讓切換頁面時重設排序與舊列表 */}
      {PRODUCT_PAGES.map((page) => {
        const view = PRODUCT_PAGE_VIEWS[page.path];
        return (
          <Route
            key={page.path}
            path={page.path}
            element={
              <ProductPageTemplate
                key={page.path}
                query={page.query}
                {...view}
              />
            }
          />
        );
      })}
      {/* 商品詳情頁（不列入導覽選單） */}
      <Route path="/products/:id" element={<ProductDetailPage />} />
      {/* 其他任何路徑顯示全域 NotFound；v6 依權重比對，不影響上方明確路由 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;
