import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'login' | 'register';

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const { login } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (mode === 'register' && !formData.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ tên';
    }

    if (!validateEmail(formData.email)) {
      newErrors.email = 'Email không đúng định dạng';
    }

    if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải từ 6 ký tự trở lên';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      
      try {
        const userData = {
          id: Math.random().toString(36).substr(2, 9),
          fullName: mode === 'register' ? formData.fullName : formData.email.split('@')[0],
          email: formData.email
        };

        if (mode === 'register') {
          // Gọi API Google Apps Script để lưu thông tin đăng ký
          const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxmtCXd_mzfQm9KWL6eZMEIgOfZZNaIA3PX0u8YUC0igPDkO5Eduh5aqBn_vnABC0OBfw/exec";
          
          const registerData = {
            action: "register",
            fullName: formData.fullName,
            email: formData.email,
            password: formData.password
          };

          await fetch(WEB_APP_URL, {
            method: "POST",
            mode: "no-cors",
            headers: {
              "Content-Type": "text/plain",
            },
            body: JSON.stringify(registerData),
          });

          console.log("Đã gửi yêu cầu đăng ký tới Google Sheets");
          login(userData);
          alert("Đăng ký thành công! Chào mừng bạn đến với Elite Hoops.");
        } else {
          // Logic đăng nhập (giả lập)
          console.log("Đăng nhập thành công:", formData.email);
          login(userData);
          alert("Đăng nhập thành công!");
        }
        
        onClose();
        // Reset form
        setFormData({ fullName: '', email: '', password: '' });
      } catch (error) {
        console.error("Lỗi khi xử lý:", error);
        alert("Có lỗi xảy ra. Vui lòng thử lại sau.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
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
            className="fixed inset-0 bg-black/60 z-[80] backdrop-blur-md"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-[460px] p-8 md:p-12 rounded-sm shadow-2xl pointer-events-auto relative overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>

              {/* Logo */}
              <div className="flex justify-center mb-10">
                <span className="text-3xl font-black tracking-tighter italic">ELITE HOOPS</span>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-8 text-center">
                {mode === 'login' ? 'ĐĂNG NHẬP' : 'TRỞ THÀNH THÀNH VIÊN'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {mode === 'register' && (
                  <div className="space-y-1">
                    <input
                      type="text"
                      name="fullName"
                      placeholder="Họ và Tên"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-sm text-sm focus:ring-1 focus:ring-black outline-none transition-all ${
                        errors.fullName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.fullName && (
                      <p className="text-[10px] text-red-500 font-bold uppercase flex items-center gap-1">
                        <AlertCircle size={12} /> {errors.fullName}
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-1">
                  <input
                    type="email"
                    name="email"
                    placeholder="Địa chỉ Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-sm text-sm focus:ring-1 focus:ring-black outline-none transition-all ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.email && (
                    <p className="text-[10px] text-red-500 font-bold uppercase flex items-center gap-1">
                      <AlertCircle size={12} /> {errors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-1 relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Mật khẩu"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-sm text-sm focus:ring-1 focus:ring-black outline-none transition-all ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-gray-400 hover:text-black transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  {errors.password && (
                    <p className="text-[10px] text-red-500 font-bold uppercase flex items-center gap-1">
                      <AlertCircle size={12} /> {errors.password}
                    </p>
                  )}
                </div>

                {mode === 'login' && (
                  <div className="flex justify-end">
                    <button type="button" className="text-xs text-gray-500 hover:text-black underline">
                      Quên mật khẩu?
                    </button>
                  </div>
                )}

                <p className="text-[10px] text-gray-500 text-center leading-relaxed">
                  Bằng cách {mode === 'login' ? 'đăng nhập' : 'đăng ký'}, bạn đồng ý với{' '}
                  <span className="underline cursor-pointer">Chính sách bảo mật</span> và{' '}
                  <span className="underline cursor-pointer">Điều khoản sử dụng</span> của Elite Hoops.
                </p>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full bg-black text-white py-4 rounded-sm font-black uppercase tracking-widest text-sm hover:bg-gray-800 transition-all transform active:scale-[0.98] ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? 'Đang xử lý...' : (mode === 'login' ? 'Đăng nhập' : 'Đăng ký')}
                </button>
              </form>

              {/* Toggle Mode */}
              <div className="mt-8 text-center">
                <p className="text-xs text-gray-500">
                  {mode === 'login' ? 'Bạn chưa có tài khoản?' : 'Bạn đã có tài khoản?'}
                  <button
                    onClick={() => {
                      setMode(mode === 'login' ? 'register' : 'login');
                      setErrors({});
                    }}
                    className="ml-2 text-black font-black underline uppercase tracking-tighter"
                  >
                    {mode === 'login' ? 'Đăng ký ngay' : 'Đăng nhập'}
                  </button>
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
