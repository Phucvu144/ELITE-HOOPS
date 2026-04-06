import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, LogOut, User as UserIcon, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal = ({ isOpen, onClose }: ProfileModalProps) => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    onClose();
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

              {/* Header */}
              <div className="text-center mb-10">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-black">
                  <UserIcon size={40} className="text-black" />
                </div>
                <h2 className="text-2xl font-black uppercase italic tracking-tighter">
                  THÔNG TIN CÁ NHÂN
                </h2>
              </div>

              {/* User Info List */}
              <div className="space-y-6 mb-10">
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-sm">
                  <div className="p-2 bg-white rounded-full shadow-sm">
                    <UserIcon size={18} className="text-gray-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Họ và Tên</p>
                    <p className="text-sm font-bold text-black">{user.fullName}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-sm">
                  <div className="p-2 bg-white rounded-full shadow-sm">
                    <Mail size={18} className="text-gray-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Email</p>
                    <p className="text-sm font-bold text-black">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-sm">
                  <div className="p-2 bg-white rounded-full shadow-sm">
                    <ShieldCheck size={18} className="text-gray-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Hạng thành viên</p>
                    <p className="text-sm font-bold text-black">Member Elite</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 bg-black text-white py-4 rounded-sm font-black uppercase tracking-widest text-xs hover:bg-gray-800 transition-all"
                >
                  <LogOut size={16} />
                  <span>Đăng xuất</span>
                </button>
              </div>

              <p className="mt-8 text-[10px] text-gray-400 text-center uppercase tracking-widest font-bold">
                Elite Hoops © 2026
              </p>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProfileModal;
