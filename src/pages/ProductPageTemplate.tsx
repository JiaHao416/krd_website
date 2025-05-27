import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import ImageModal from "../components/ImageModal";
import { airTable } from "../services/index";

// 定義產品類型
interface Product {
  fields: {
    img_url: string;
    name?: string;
    product_name?: string;
    description?: string;
    price?: string;
    [key: string]: any;
  };
  id?: string;
}

interface ProductPageProps {
  title: string;
  tableName: string;
  description?: string;
  icon?: React.ReactNode;
  accentColor?: string;
}

const ProductPageTemplate = ({
  title,
  tableName,
  description,
  icon,
}: ProductPageProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"name" | "newest">("name");
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const response = await airTable(tableName, "data");
        const products = response
          .filter((item) => item.fields?.img_url)
          .map((item) => ({
            ...item,
            fields: {
              ...item.fields,
              img_url: item.fields.img_url as string,
            },
          })) as Product[];
        setProducts(products);
      } catch (error) {
        console.error(`Error fetching ${tableName}:`, error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [tableName]);

  const sortedProducts = React.useMemo(() => {
    return [...products].sort((a, b) => {
      if (sortBy === "name") {
        const nameA = a.fields.name || a.fields.product_name || "";
        const nameB = b.fields.name || b.fields.product_name || "";
        return nameA.localeCompare(nameB);
      }
      return 0;
    });
  }, [products, sortBy]);

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  const handleCloseModal = () => {
    setShowImageModal(false);
    setSelectedImage("");
  };

  if (loading) {
    return (
      <Layout title={title} showSideMenu={true}>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-blue-500/30 rounded-full animate-spin"></div>
              <div className="absolute top-2 left-2 w-16 h-16 border-4 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-400 mt-6 text-lg">正在載入產品資訊...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={title} showSideMenu={true}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 relative">
        {/* 背景裝飾 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl"></div>
        </div>

        {/* Header Section */}
        <div className="relative border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-20">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-6 mb-6">
                  {icon && (
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                      {icon}
                    </div>
                  )}
                  <div>
                    <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
                      {title}
                    </h1>
                    <div className="h-1.5 w-40 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                  </div>
                </div>

                {description && (
                  <p className="text-xl text-gray-300 max-w-3xl leading-relaxed">
                    {description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 控制欄 */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-4">
              <span className="text-gray-400">排序方式：</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "name" | "newest")}
                className="bg-slate-800 text-white border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="name">依名稱</option>
                <option value="newest">最新優先</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-gray-400 text-sm">檢視方式：</span>
              <div className="flex bg-slate-800 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === "grid"
                      ? "bg-blue-500 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === "list"
                      ? "bg-blue-500 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <svg
                    className="w-4 h-4"
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
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="max-w-7xl mx-auto px-6 pb-12">
          {sortedProducts.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8">
                <svg
                  className="w-16 h-16 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2m16-7V9a2 2 0 00-2-2H6a2 2 0 00-2 2v4"
                  />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-gray-300 mb-4">
                暫無產品
              </h3>
              <p className="text-gray-500 text-lg">
                此分類目前沒有可用的產品，請稍後再試
              </p>
            </div>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                  : "space-y-6"
              }
            >
              {sortedProducts.map((product, index) => {
                const productName =
                  product.fields.name ||
                  product.fields.product_name ||
                  `產品 ${index + 1}`;

                if (viewMode === "list") {
                  return (
                    <div
                      key={product.id || index}
                      className="glass-card p-6 hover:border-blue-500/50 transition-all duration-300 group cursor-pointer"
                      style={{ animationDelay: `${index * 0.1}s` }}
                      onClick={() => handleImageClick(product.fields.img_url)}
                    >
                      <div className="flex items-center space-x-6">
                        <div className="w-24 h-24 rounded-xl overflow-hidden bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex-shrink-0">
                          <img
                            src={product.fields.img_url}
                            alt={productName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            draggable={false}
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                            {productName}
                          </h3>
                          {product.fields.description && (
                            <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                              {product.fields.description}
                            </p>
                          )}
                          {product.fields.price && (
                            <span className="text-blue-400 font-bold text-lg">
                              ${product.fields.price}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
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
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                          </svg>
                          <span className="text-sm">查看大圖</span>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={product.id || index}
                    className="group cursor-pointer"
                    style={{ animationDelay: `${index * 0.1}s` }}
                    onClick={() => handleImageClick(product.fields.img_url)}
                  >
                    {/* 固定高度的產品卡片 */}
                    <div className="product-card-new h-96 flex flex-col">
                      {/* 產品標籤 */}
                      {product.fields.price && (
                        <div className="product-badge">
                          ${product.fields.price}
                        </div>
                      )}

                      {/* 產品圖片 - 固定高度 */}
                      <div className="product-image-container flex-shrink-0 h-64">
                        <img
                          src={product.fields.img_url}
                          alt={productName}
                          className="product-image"
                          draggable={false}
                        />

                        {/* 懸停遮罩和放大鏡 */}
                        <div className="product-overlay">
                          <div className="zoom-icon">
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
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* 產品信息 - 剩餘空間 */}
                      <div className="product-info flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="product-title text-base leading-tight mb-2 line-clamp-2 min-h-[2.5rem]">
                            {productName}
                          </h3>

                          {product.fields.description && (
                            <p className="text-gray-400 text-xs mb-3 line-clamp-2 leading-relaxed">
                              {product.fields.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-auto">
                          <div className="text-xs text-gray-500">
                            點擊查看大圖
                          </div>
                          <svg
                            className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform flex-shrink-0"
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
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Image Modal */}
        <ImageModal
          show={showImageModal}
          onHide={handleCloseModal}
          img={selectedImage}
        />
      </div>
    </Layout>
  );
};

export default ProductPageTemplate;
