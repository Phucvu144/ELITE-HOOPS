import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Product } from '../types';

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

const ProductGrid = ({ products, onAddToCart }: ProductGridProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
      {products.map((product) => (
        <Link to={`/product/${product.id}`} key={product.id}>
          <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="group cursor-pointer flex flex-col"
          >
            {/* Image Container */}
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-gray-100 rounded-sm mb-4">
              <img
                src={product.image_url}
                alt={product.name}
                className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              
              {/* Hover Overlay: Add to Cart Button */}
              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-8 px-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onAddToCart(product);
                  }}
                  className="w-full bg-white text-black py-3 rounded-full text-xs font-black uppercase tracking-widest shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
                >
                  Thêm vào giỏ hàng
                </motion.button>
              </div>

              {/* Badge (Optional Nike Style) */}
              <div className="absolute top-4 left-4">
                <span className="bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-widest border border-gray-100">
                  Mới nhất
                </span>
              </div>
            </div>

            {/* Product Info */}
            <div className="flex flex-col space-y-1">
              <h3 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-gray-600 transition-colors">
                {product.name}
              </h3>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                {product.brand} Basketball
              </p>
              <p className="text-sm text-gray-400">
                Giày bóng rổ chuyên nghiệp
              </p>
              <p className="text-lg font-black text-gray-900 pt-3">
                {formatPrice(product.price)}
              </p>
            </div>
          </motion.div>
        </Link>
      ))}
    </div>
  );
};

export default ProductGrid;
