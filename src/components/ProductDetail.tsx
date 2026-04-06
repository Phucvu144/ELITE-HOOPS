import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft, ShoppingBag, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { Product } from '../types';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products } = useProducts();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);

  useEffect(() => {
    if (id && products.length > 0) {
      const foundProduct = products.find((p) => p.id === parseInt(id));
      if (foundProduct) {
        setProduct(foundProduct);
        if (foundProduct.sizes && foundProduct.sizes.length > 0) {
          setSelectedSize(foundProduct.sizes[0]);
        }
      }
    }
  }, [id, products]);

  if (!product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-xl font-black uppercase tracking-widest italic">Đang tải sản phẩm...</div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
      alert(`Đã thêm ${product.name} vào giỏ hàng!`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-xs font-black uppercase tracking-widest mb-12 hover:text-gray-500 transition-colors"
      >
        <ChevronLeft size={16} />
        <span>Quay lại</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Left: Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="aspect-[4/5] bg-gray-100 rounded-sm overflow-hidden"
          >
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover object-center"
              referrerPolicy="no-referrer"
            />
          </motion.div>
          {/* Grid of smaller images could go here */}
        </div>

        {/* Right: Product Info */}
        <div className="lg:col-span-5 flex flex-col">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Title & Brand */}
            <div className="space-y-2">
              <h1 className="text-4xl font-black tracking-tighter italic uppercase leading-none">
                {product.name}
              </h1>
              <p className="text-lg font-bold text-gray-500 uppercase tracking-widest">
                {product.brand} Basketball
              </p>
              <p className="text-2xl font-black text-black pt-4">
                {formatPrice(product.price)}
              </p>
            </div>

            {/* Size Selection */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-black uppercase tracking-widest">Chọn Size</span>
                <button className="text-xs font-bold text-gray-400 underline uppercase tracking-widest">Bảng size</button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-4 rounded-sm text-sm font-bold transition-all border-2 ${
                      selectedSize === size
                        ? 'border-black bg-black text-white'
                        : 'border-gray-100 hover:border-black text-gray-900'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="w-full bg-black text-white py-6 rounded-full font-black uppercase tracking-widest text-sm hover:bg-gray-800 transition-all transform active:scale-[0.98] flex items-center justify-center space-x-3"
            >
              <ShoppingBag size={20} />
              <span>Thêm vào giỏ hàng</span>
            </button>

            {/* Description */}
            <div className="pt-8 border-t border-gray-100 space-y-4">
              <h3 className="text-sm font-black uppercase tracking-widest">Mô tả công nghệ</h3>
              <p className="text-sm text-gray-600 leading-relaxed font-medium">
                {product.description || "Đôi giày này mang lại sự ổn định tối đa và khả năng phản hồi năng lượng vượt trội. Công nghệ đệm tiên tiến giúp bảo vệ đôi chân trong những pha tiếp đất mạnh mẽ."}
              </p>
            </div>

            {/* Features/Benefits */}
            <div className="grid grid-cols-1 gap-6 pt-8">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-gray-50 rounded-full">
                  <Truck size={18} className="text-black" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest">Giao hàng miễn phí</p>
                  <p className="text-[10px] text-gray-500 font-medium">Cho đơn hàng trên 2.000.000đ</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-gray-50 rounded-full">
                  <RotateCcw size={18} className="text-black" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest">Đổi trả 30 ngày</p>
                  <p className="text-[10px] text-gray-500 font-medium">Dễ dàng và nhanh chóng</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-gray-50 rounded-full">
                  <ShieldCheck size={18} className="text-black" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest">Bảo hành chính hãng</p>
                  <p className="text-[10px] text-gray-500 font-medium">Cam kết 100% Authentic</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
