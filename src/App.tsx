import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, ChevronRight, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import { FaFacebookF, FaInstagram } from 'react-icons/fa';
import { SiZalo } from 'react-icons/si';
import { motion, AnimatePresence } from 'motion/react';
import productsData from './data/products.json';
import ProductGrid from './components/ProductGrid';
import ProductDetail from './components/ProductDetail';
import ScrollToTop from './components/ScrollToTop';
import CartModal from './components/CartModal';
import AuthModal from './components/AuthModal';
import FilterSection from './components/FilterSection';
import { ProductProvider, useProducts } from './context/ProductContext';
import { CartProvider, useCart } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Product, CartItem } from './types';
import ProfileModal from './components/ProfileModal';

const products: Product[] = productsData;

// --- Header Component ---
const Header = ({ 
  isMenuOpen, 
  setIsMenuOpen, 
  cartCount, 
  onOpenCart,
  onOpenAuth,
  onOpenProfile
}: { 
  isMenuOpen: boolean; 
  setIsMenuOpen: (val: boolean) => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
}) => {
  const { user, isLoggedIn } = useAuth();
  const menuItems = [
    { name: 'Giày Bóng Rổ Indoor', href: '#' },
    { name: 'Giày Bóng Rổ OutDoor', href: '#' },
    { name: 'Bóng Rổ', href: '#' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-black tracking-tighter italic cursor-pointer">ELITE HOOPS</Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-10">
            {menuItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-sm font-bold text-gray-800 hover:text-black transition-all duration-300 relative group py-2"
              >
                {item.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
          </div>

          {/* Icons & Auth */}
          <div className="flex items-center space-x-3 md:space-x-6">
            {/* Auth Status */}
            <div className="hidden md:block">
              {isLoggedIn ? (
                <button 
                  onClick={onOpenProfile} 
                  className="text-[11px] font-black uppercase tracking-widest text-black flex items-center gap-2 hover:opacity-70 transition-opacity"
                >
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  {user?.fullName}
                </button>
              ) : (
                <button 
                  onClick={onOpenAuth} 
                  className="text-[11px] font-black uppercase tracking-widest text-gray-500 hover:text-black transition-colors"
                >
                  Đăng nhập
                </button>
              )}
            </div>

            <button 
              onClick={onOpenCart}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
            >
              <ShoppingBag size={22} />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-black text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                  {cartCount}
                </span>
              )}
            </button>
            <button 
              className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-40 md:hidden bg-white pt-20 px-6"
          >
            <div className="flex flex-col space-y-6">
              {menuItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-2xl font-bold text-gray-900 flex justify-between items-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                  <ChevronRight size={24} />
                </a>
              ))}
              
              <div className="pt-6 border-t border-gray-100">
                {isLoggedIn ? (
                  <button 
                    onClick={() => {
                      onOpenProfile();
                      setIsMenuOpen(false);
                    }}
                    className="text-xl font-bold text-black flex items-center gap-3"
                  >
                    <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                    Chào, {user?.fullName}
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      onOpenAuth();
                      setIsMenuOpen(false);
                    }}
                    className="text-xl font-bold text-gray-500 hover:text-black transition-colors"
                  >
                    Đăng nhập / Đăng ký
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

// --- Footer Component ---
const Footer = () => {
  return (
    <footer className="bg-black text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 mb-16">
          {/* Column 1: Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-6">Hỗ Trợ</h4>
            <ul className="space-y-4 text-xs font-medium text-gray-400">
              <li className="hover:text-white cursor-pointer transition-colors">Tình trạng đơn hàng</li>
              <li className="hover:text-white cursor-pointer transition-colors">Giao hàng & Nhận hàng</li>
              <li className="hover:text-white cursor-pointer transition-colors">Đổi trả</li>
              <li className="hover:text-white cursor-pointer transition-colors">Phương thức thanh toán</li>
              <li className="hover:text-white cursor-pointer transition-colors">Liên hệ chúng tôi</li>
            </ul>
          </div>

          {/* Column 2: About / Terms */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-6">Về Elite Hoops</h4>
            <ul className="space-y-4 text-xs font-medium text-gray-400">
              <li className="hover:text-white cursor-pointer transition-colors">Tin tức</li>
              <li className="hover:text-white cursor-pointer transition-colors">Tuyển dụng</li>
              <li className="hover:text-white cursor-pointer transition-colors">Nhà đầu tư</li>
              <li className="hover:text-white cursor-pointer transition-colors">Bền vững</li>
            </ul>
          </div>

          {/* Column 3: Terms & Policies */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-6">Điều Khoản</h4>
            <ul className="space-y-4 text-xs font-medium text-gray-400">
              <li className="hover:text-white cursor-pointer transition-colors">Điều khoản bán hàng</li>
              <li className="hover:text-white cursor-pointer transition-colors">Điều khoản sử dụng</li>
              <li className="hover:text-white cursor-pointer transition-colors">Chính sách bảo mật</li>
              <li className="hover:text-white cursor-pointer transition-colors">Cài đặt Cookie</li>
            </ul>
          </div>

          {/* Column 4: Social Media */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-6">Mạng Xã Hội</h4>
            <div className="flex space-x-4">
              <a 
                href="https://www.facebook.com/vqphucs" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gray-800 p-3 rounded-full hover:bg-blue-600 transition-all duration-300 flex items-center justify-center"
                title="Facebook"
              >
                <FaFacebookF size={18} />
              </a>
              <a 
                href="https://www.instagram.com/qphucs/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gray-800 p-3 rounded-full hover:bg-pink-600 transition-all duration-300 flex items-center justify-center"
                title="Instagram"
              >
                <FaInstagram size={18} />
              </a>
              <a 
                href="https://zalo.me/0399182294" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gray-800 p-3 rounded-full hover:bg-blue-500 transition-all duration-300 flex items-center justify-center"
                title="Zalo"
              >
                <SiZalo size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-[10px] text-gray-500 space-y-4 md:space-y-0 uppercase tracking-wider">
          <div className="flex items-center space-x-4">
            <span className="text-white font-bold">Việt Nam</span>
            <p>© 2026 Elite Hoops, Inc. Bảo lưu mọi quyền</p>
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <span className="hover:text-white cursor-pointer transition-colors">Hướng dẫn</span>
            <span className="hover:text-white cursor-pointer transition-colors">Điều khoản bán hàng</span>
            <span className="hover:text-white cursor-pointer transition-colors">Điều khoản sử dụng</span>
            <span className="hover:text-white cursor-pointer transition-colors">Quyền riêng tư</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

function Home({ onAddToCart }: { onAddToCart: (product: Product) => void }) {
  const { 
    filteredProducts, 
    searchQuery, 
    setSearchQuery, 
    selectedBrand, 
    setSelectedBrand, 
    selectedPlayer, 
    setSelectedPlayer,
    clearFilters 
  } = useProducts();

  return (
    <>
      {/* Hero Section */}
      <header className="relative h-[50vh] md:h-[70vh] flex items-center justify-center overflow-hidden bg-black">
        <img
          src="https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=2000&auto=format&fit=crop"
          alt="Basketball court"
          className="absolute inset-0 w-full h-full object-cover opacity-70"
          referrerPolicy="no-referrer"
        />
        <div className="relative z-10 text-center px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-8xl font-black text-white tracking-tighter italic mb-6"
          >
            RISE ABOVE
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-2xl text-gray-100 mb-10 max-w-3xl mx-auto font-medium"
          >
            Elevate your game with the most advanced basketball performance gear.
          </motion.p>
          <motion.button
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white text-black px-10 py-4 rounded-full font-black hover:bg-gray-200 transition-all transform hover:scale-105 uppercase tracking-widest text-sm"
          >
            Shop Collection
          </motion.button>
        </div>
      </header>

      {/* Filter & Search Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <FilterSection
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedBrand={selectedBrand}
          setSelectedBrand={setSelectedBrand}
          selectedPlayer={selectedPlayer}
          setSelectedPlayer={setSelectedPlayer}
        />

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <h2 className="text-3xl font-black tracking-tight uppercase italic">
            {searchQuery ? `Kết quả cho "${searchQuery}"` : 'Tất cả sản phẩm'} ({filteredProducts.length})
          </h2>
        </div>

        {/* Product Grid Component */}
        {filteredProducts.length > 0 ? (
          <ProductGrid 
            products={filteredProducts} 
            onAddToCart={onAddToCart}
          />
        ) : (
          <div className="py-20 text-center">
            <p className="text-xl font-bold text-gray-400 uppercase italic tracking-widest">Không tìm thấy sản phẩm phù hợp</p>
            <button 
              onClick={clearFilters}
              className="mt-4 text-sm font-black underline uppercase tracking-widest"
            >
              Xóa tất cả bộ lọc
            </button>
          </div>
        )}
      </section>
    </>
  );
}

function AppContent() {
  const { 
    items: cartItems, 
    totalQuantity: cartCount, 
    addToCart, 
    removeFromCart, 
    updateQuantity 
  } = useCart();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    setIsCartOpen(true);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollToTop />
      <Header 
        isMenuOpen={isMenuOpen} 
        setIsMenuOpen={setIsMenuOpen} 
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onRemove={removeFromCart}
        onUpdateQuantity={updateQuantity}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home onAddToCart={handleAddToCart} />} />
          <Route path="/product/:id" element={<ProductDetail />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProductProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </ProductProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
