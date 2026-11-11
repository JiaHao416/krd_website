import Layout from "../components/Layout";
import NotFoundState from "../components/NotFoundState";

/** 全域找不到頁面：任何未定義的網址都顯示此頁（底部維持預設單鈕撥號列） */
const NotFoundPage = () => (
  <Layout footer="address">
    {/* React 19 會把 title 提升到 head，卸載時移除並還原站名 */}
    <title>找不到頁面 | KRD</title>
    <NotFoundState
      title="找不到這一頁"
      description="這個網址沒有東西，回到首頁重新逛逛吧。"
      actionLabel="回到首頁"
      actionTo="/"
    />
  </Layout>
);

export default NotFoundPage;
