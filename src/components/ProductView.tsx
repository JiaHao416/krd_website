import { useState } from "react";
import ImageModal from "../components/ImageModal";

interface Product {
  fields: {
    img_url: string;
    product_name?: string;
    name?: string;
    description?: string;
    price?: string;
    [key: string]: any;
  };
  id?: string;
}

interface ProductViewProps {
  title: string;
  products: Product[];
}

const ProductView = ({ title, products }: ProductViewProps) => {
  const [isShowImageModal, setIsShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>("");

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setIsShowImageModal(true);
  };

  const handleCloseModal = () => {
    setIsShowImageModal(false);
    setSelectedImage("");
  };

  return (
    <div className="w-full p-6">
      {/* Title Section */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-4">
          {title}
        </h1>
        <div className="h-1 w-32 bg-gradient-to-r from-blue-500 to-purple-500"></div>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-12 h-12 text-gray-400"
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
          <h3 className="text-2xl font-semibold text-gray-300 mb-2">
            暫無產品
          </h3>
          <p className="text-gray-500">此分類目前沒有可用的產品</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product, index) => {
            const productName =
              product.fields.product_name ||
              product.fields.name ||
              `Product ${index + 1}`;

            return (
              <div
                key={product.id || index}
                className="group backdrop-blur-sm bg-white/5 rounded-2xl overflow-hidden border border-white/10 hover:border-blue-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20"
              >
                {/* Product Image */}
                <div
                  className="aspect-square overflow-hidden bg-gradient-to-br from-blue-500/10 to-purple-500/10 cursor-pointer relative"
                  onClick={() => handleImageClick(product.fields.img_url)}
                >
                  <img
                    src={product.fields.img_url}
                    alt={productName}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
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
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-6">
                  <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
                    {productName}
                  </h3>

                  {product.fields.description && (
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {product.fields.description}
                    </p>
                  )}

                  {product.fields.price && (
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-blue-400 font-bold text-lg">
                        ${product.fields.price}
                      </span>
                    </div>
                  )}

                  <button
                    onClick={() => handleImageClick(product.fields.img_url)}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105"
                  >
                    查看大圖
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Image Modal */}
      <ImageModal
        show={isShowImageModal}
        onHide={handleCloseModal}
        img={selectedImage}
      />
    </div>
  );
};

export default ProductView;
