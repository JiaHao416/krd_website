import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Abouts from "./pages/AboutPage";
import ProductPageTemplate from "./pages/ProductPageTemplate";
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
    </Routes>
  );
};

export default App;
