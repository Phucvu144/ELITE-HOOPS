import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowLeft, CheckCircle2, QrCode, Copy, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CartItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemove: (id: number) => void;
  onUpdateQuantity: (id: number, delta: number) => void;
  onOpenAuth: () => void;
}

type ViewState = 'cart' | 'checkout' | 'success';

const CartModal = ({ isOpen, onClose, items, onRemove, onUpdateQuantity, onOpenAuth }: CartModalProps) => {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const { clearCart } = useCart();
  const [view, setView] = useState<ViewState>('cart');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [orderId, setOrderId] = useState('');

  // Tự động điền thông tin nếu đã đăng nhập
  useEffect(() => {
    if (isLoggedIn && user && isOpen) {
      console.log("Auto-filling form with user data:", user);
      setFormData(prev => ({
        ...prev,
        fullName: user.fullName || prev.fullName,
        email: user.email || prev.email
      }));
    }
  }, [isLoggedIn, user, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setView('cart');
        setIsSubmitting(false);
      }, 300); // Reset view after closing animation
    }
  }, [isOpen]);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const handleCheckout = () => {
    if (!isLoggedIn) {
      alert("Vui lòng đăng nhập để tiến hành đặt hàng!");
      onClose();
      onOpenAuth();
      return;
    }
    if (items.length > 0) setView('checkout');
  };

  const processCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;

    // Validation
    const errors: Record<string, string> = {};
    
    // Họ tên: Chỉ chữ cái và khoảng trắng
    const nameRegex = /^[a-zA-ZÀ-ỹ\s]+$/;
    if (!nameRegex.test(formData.fullName)) {
      errors.fullName = "Họ tên chỉ được chứa chữ cái và khoảng trắng";
    }

    // Email: Phải là @gmail.com
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!emailRegex.test(formData.email)) {
      errors.email = "Email phải có định dạng @gmail.com (ví dụ: ten@gmail.com)";
    }

    // Số điện thoại: 10 số, bắt đầu bằng 0
    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      errors.phone = "Số điện thoại phải có đúng 10 chữ số và bắt đầu bằng số 0";
    }

    // Địa chỉ: Chỉ chữ cái và số, không ký tự đặc biệt
    const addressRegex = /^[a-zA-Z0-9À-ỹ\s]+$/;
    if (!addressRegex.test(formData.address)) {
      errors.address = "Địa chỉ chỉ được chứa chữ cái và số, không có ký tự đặc biệt";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);
    
    // Tạo mã đơn hàng trước khi gửi
    const newOrderId = 'EH' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    setOrderId(newOrderId);

    // Gom dữ liệu: Chỉ lấy các thông tin khách yêu cầu
    const orderData = {
      action: "checkout",
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      cartDetails: items.map(item => `${item.name} (x${item.quantity})`).join(', '),
      totalAmount: total,
      orderId: newOrderId // Gửi mã đơn hàng sang Sheet
    };

    console.log("Dữ liệu gửi đi:", orderData);

    if (!orderData.email) {
      console.warn("Cảnh báo: Email đang trống!");
    }

    try {
      console.log("Đang lưu đơn hàng tới Firestore...");
      const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
      const { db } = await import('../lib/firebase');
      
      const orderToSave = {
        orderId: newOrderId,
        fullName: formData.fullName,
        email: formData.email.toLowerCase().trim(),
        phone: formData.phone,
        address: formData.address,
        cartDetails: orderData.cartDetails,
        totalAmount: orderData.totalAmount,
        status: 'pending',
        userId: user?.id || null,
        createdAt: serverTimestamp()
      };

      await setDoc(doc(db, 'orders', newOrderId), orderToSave);
      console.log("Yêu cầu đã được lưu vào Firestore.");

      // Đồng bộ tới SQL Server
      try {
        const syncResponse = await fetch('/api/sync-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: newOrderId,
            fullName: formData.fullName,
            email: formData.email.toLowerCase().trim(),
            phone: formData.phone,
            address: formData.address,
            cartDetails: orderData.cartDetails,
            totalAmount: orderData.totalAmount
          })
        });
        const syncResult = await syncResponse.json();
        if (!syncResult.success) {
          console.warn("SQL Order Sync warning:", syncResult.message);
        }
      } catch (syncErr) {
        console.error("SQL Order Sync error:", syncErr);
      }

      setView('success');
      clearCart(); 
    } catch (error) {
      console.error("Lỗi khi gửi đơn hàng:", error);
      alert("Có lỗi xảy ra khi xử lý đơn hàng. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinish = () => {
    onClose();
    navigate('/');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-[70] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <div className="flex items-center space-x-3">
                {view === 'checkout' && (
                  <button onClick={() => setView('cart')} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft size={20} />
                  </button>
                )}
                <h2 className="text-xl font-black uppercase italic tracking-tighter">
                  {view === 'cart' ? 'Giỏ hàng của bạn' : view === 'checkout' ? 'Thông tin thanh toán' : 'Đặt hàng thành công'}
                </h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Content Container */}
            <div className="flex-grow overflow-y-auto">
              <AnimatePresence mode="wait">
                {view === 'cart' && (
                  <motion.div
                    key="cart-view"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="p-6 space-y-6"
                  >
                    {items.length === 0 ? (
                      <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                          <ShoppingBag size={32} className="text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">Giỏ hàng đang trống</p>
                        <button onClick={onClose} className="text-sm font-bold underline uppercase tracking-widest">
                          Tiếp tục mua sắm
                        </button>
                      </div>
                    ) : (
                      items.map((item) => (
                        <div key={item.id} className="flex space-x-4">
                          <div className="w-24 h-24 bg-gray-100 rounded-sm overflow-hidden flex-shrink-0">
                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                          <div className="flex-grow flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start">
                                <h3 className="text-sm font-bold text-gray-900 leading-tight pr-4">{item.name}</h3>
                                <button onClick={() => onRemove(item.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                                  <Trash2 size={16} />
                                </button>
                              </div>
                              <p className="text-[10px] text-gray-500 uppercase font-bold mt-1">{item.brand} Basketball</p>
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center border border-gray-200 rounded-full px-2 py-1">
                                <button onClick={() => onUpdateQuantity(item.id, -1)} className="p-1 hover:text-black text-gray-400"><Minus size={14} /></button>
                                <span className="mx-3 text-xs font-bold">{item.quantity}</span>
                                <button onClick={() => onUpdateQuantity(item.id, 1)} className="p-1 hover:text-black text-gray-400"><Plus size={14} /></button>
                              </div>
                              <p className="text-sm font-black text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </motion.div>
                )}

                {view === 'checkout' && (
                  <motion.div
                    key="checkout-view"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-6 space-y-8"
                  >
                    <form id="checkout-form" onSubmit={processCheckout} className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Thông tin giao hàng</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 ml-1">Họ và tên</label>
                            <input
                              required
                              type="text"
                              value={formData.fullName}
                              onChange={(e) => {
                                setFormData({ ...formData, fullName: e.target.value });
                                if (formErrors.fullName) setFormErrors({ ...formErrors, fullName: '' });
                              }}
                              placeholder="Nhập họ tên của bạn"
                              className={`w-full px-4 py-3 bg-gray-50 border-2 ${formErrors.fullName ? 'border-red-500' : 'border-transparent'} rounded-xl focus:border-black focus:bg-white transition-all outline-none text-sm font-bold`}
                            />
                            {formErrors.fullName && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{formErrors.fullName}</p>}
                          </div>
                          <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 ml-1">Email liên kết</label>
                            <input
                              required
                              type="email"
                              value={formData.email}
                              onChange={(e) => {
                                setFormData({ ...formData, email: e.target.value });
                                if (formErrors.email) setFormErrors({ ...formErrors, email: '' });
                              }}
                              placeholder="Nhập email của bạn"
                              className={`w-full px-4 py-3 bg-gray-100 border-2 ${formErrors.email ? 'border-red-500' : 'border-transparent'} rounded-xl focus:border-black focus:bg-white transition-all outline-none text-sm font-bold`}
                              disabled={isLoggedIn}
                            />
                            {formErrors.email && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{formErrors.email}</p>}
                          </div>
                          <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 ml-1">Số điện thoại</label>
                            <input
                              required
                              type="tel"
                              value={formData.phone}
                              onChange={(e) => {
                                setFormData({ ...formData, phone: e.target.value });
                                if (formErrors.phone) setFormErrors({ ...formErrors, phone: '' });
                              }}
                              placeholder="Nhập số điện thoại"
                              className={`w-full px-4 py-3 bg-gray-50 border-2 ${formErrors.phone ? 'border-red-500' : 'border-transparent'} rounded-xl focus:border-black focus:bg-white transition-all outline-none text-sm font-bold`}
                            />
                            {formErrors.phone && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{formErrors.phone}</p>}
                          </div>
                          <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 ml-1">Địa chỉ nhận hàng</label>
                            <textarea
                              required
                              rows={3}
                              value={formData.address}
                              onChange={(e) => {
                                setFormData({ ...formData, address: e.target.value });
                                if (formErrors.address) setFormErrors({ ...formErrors, address: '' });
                              }}
                              placeholder="Địa chỉ chi tiết (Số nhà, tên đường, phường/xã...)"
                              className={`w-full px-4 py-3 bg-gray-50 border-2 ${formErrors.address ? 'border-red-500' : 'border-transparent'} rounded-xl focus:border-black focus:bg-white transition-all outline-none text-sm font-bold resize-none`}
                            />
                            {formErrors.address && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{formErrors.address}</p>}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Phương thức thanh toán</h3>
                        <div className="p-4 border-2 border-black rounded-xl bg-gray-50 flex items-center space-x-4">
                          <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-white">
                            <QrCode size={24} />
                          </div>
                          <div>
                            <p className="text-sm font-black uppercase italic">Chuyển khoản QR Code</p>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Xác nhận nhanh chóng</p>
                          </div>
                        </div>
                      </div>
                    </form>

                    <div className="bg-gray-50 p-4 rounded-xl space-y-2">
                      <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <span>Tạm tính</span>
                        <span>{formatPrice(total)}</span>
                      </div>
                      <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <span>Phí vận chuyển</span>
                        <span className="text-green-600">Miễn phí</span>
                      </div>
                      <div className="flex justify-between text-xs font-bold text-red-500 uppercase tracking-wider">
                        <span>Tiền đặt cọc (Bắt buộc)</span>
                        <span>{formatPrice(5000)}</span>
                      </div>
                      <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
                        <span className="text-sm font-black uppercase italic text-gray-400">Tổng thanh toán sau khi trừ cọc</span>
                        <span className="text-lg font-black">{formatPrice(total - 5000 > 0 ? total - 5000 : 0)}</span>
                      </div>
                      <p className="text-[10px] text-gray-400 font-medium italic mt-2">
                        * Quý khách vui lòng đặt cọc 5.000đ để xác nhận đơn hàng. Số tiền này sẽ được trừ vào tổng hóa đơn khi nhận hàng.
                      </p>
                    </div>
                  </motion.div>
                )}

                {view === 'success' && (
                  <motion.div
                    key="success-view"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-6 text-center space-y-8"
                  >
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                        <CheckCircle2 size={48} />
                      </div>
                      <h3 className="text-2xl font-black uppercase italic tracking-tighter">Đơn hàng đã được gửi!</h3>
                      <p className="text-sm text-gray-500 font-medium max-w-xs mx-auto">
                        Cảm ơn <span className="text-black font-bold">{formData.fullName}</span>, đơn hàng <span className="text-black font-bold">#{orderId}</span> đang chờ thanh toán.
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-6 space-y-6 border border-gray-100">
                      <div className="space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Quét mã QR để đặt cọc (5.000đ)</p>
                        <div className="w-56 h-56 bg-white mx-auto p-4 rounded-xl shadow-xl border border-gray-100 flex items-center justify-center overflow-hidden">
                          <img 
                            src={`https://qr.sepay.vn/img?acc=0399182294&bank=MBBank&amount=5000&des=ELITEHOOPS%20${orderId}&template=compact`}
                            alt="QR Code Thanh Toán"
                            className="w-full h-full object-contain"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      </div>

                      <div className="space-y-4 text-left">
                        <div className="p-4 bg-white rounded-xl border border-gray-100 space-y-3">
                          <div>
                            <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest mb-1">Ngân hàng</p>
                            <p className="text-sm font-black">MB BANK (Ngân hàng Quân Đội)</p>
                          </div>
                          <div>
                            <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest mb-1">Số tài khoản</p>
                            <div className="flex justify-between items-center">
                              <p className="text-sm font-black tracking-widest">0399182294</p>
                              <button 
                                onClick={() => {
                                  navigator.clipboard.writeText('0399182294');
                                  alert('Đã sao chép số tài khoản!');
                                }}
                                className="text-gray-400 hover:text-black"
                              >
                                <Copy size={14} />
                              </button>
                            </div>
                          </div>
                          <div>
                            <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest mb-1">Số tiền đặt cọc</p>
                            <p className="text-sm font-black text-red-600">5.000đ</p>
                          </div>
                          <div>
                            <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest mb-1">Nội dung chuyển khoản</p>
                            <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg border border-dashed border-gray-200">
                              <p className="text-sm font-black text-black">ELITEHOOPS {orderId}</p>
                              <button 
                                onClick={() => {
                                  navigator.clipboard.writeText(`ELITEHOOPS ${orderId}`);
                                  alert('Đã sao chép nội dung!');
                                }}
                                className="text-gray-400 hover:text-black"
                              >
                                <Copy size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleFinish}
                      className="w-full bg-black text-white py-4 rounded-full font-black uppercase tracking-widest text-sm hover:bg-gray-800 transition-all"
                    >
                      Hoàn tất & Quay lại trang chủ
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sticky Footer for Cart/Checkout Actions */}
            {items.length > 0 && view !== 'success' && (
              <div className="p-6 border-t border-gray-100 bg-white space-y-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                {view === 'cart' ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Tổng cộng</span>
                      <span className="text-xl font-black text-gray-900">{formatPrice(total)}</span>
                    </div>
                    <button
                      onClick={handleCheckout}
                      className="w-full bg-black text-white py-4 rounded-full font-black uppercase tracking-widest text-sm hover:bg-gray-800 transition-all transform active:scale-95 shadow-xl"
                    >
                      Thanh toán ngay
                    </button>
                  </>
                ) : (
                  <button
                    form="checkout-form"
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-black text-white py-4 rounded-full font-black uppercase tracking-widest text-sm hover:bg-gray-800 transition-all transform active:scale-95 shadow-xl disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Đang gửi đơn hàng...</span>
                      </>
                    ) : (
                      <span>Gửi & Thanh toán {formatPrice(total)}</span>
                    )}
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartModal;
