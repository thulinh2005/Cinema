import React from "react";
import { AlertTriangle, X } from "lucide-react";

const InvoiceDeleteModal = ({ invoice, isOpen, onClose, onConfirm }) => {
  if (!isOpen || !invoice) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl text-center">
        {/* Icon */}
        <div className="mx-auto w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="w-7 h-7 text-red-600" />
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-slate-900 mb-2">Xác nhận xóa</h2>

        {/* Content */}
        <p className="text-slate-600 text-sm mb-1">
          Bạn có chắc muốn xóa{" "}
          <span className="font-semibold text-slate-900">
            Hóa đơn #{invoice.ma_hd}
          </span>
          ?
        </p>
        <p className="text-slate-500 text-xs mb-6">
          Tất cả vé và sản phẩm liên quan cũng sẽ bị xóa. Hành động này không thể hoàn tác.
        </p>

        {/* Buttons */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition"
          >
            Hủy bỏ
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition"
          >
            Xóa hóa đơn
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDeleteModal;
