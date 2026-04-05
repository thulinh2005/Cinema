import React from "react";
import { AlertTriangle } from "lucide-react";

const DeleteConfirmModal = ({ customer, isOpen, onClose, onConfirm }) => {
    if (!isOpen || !customer) return null;

    return (
        <div className="fixed inset-0 bg-black/35 flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-[420px] rounded-2xl p-7 shadow-2xl text-center relative">

                {/* ICON */}
                <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>

                {/* TITLE */}
                <h2 className="text-xl font-bold text-slate-900 mb-2">Xác nhận xóa</h2>

                {/* CONTENT */}
                <p className="text-slate-600 text-sm mb-6">
                    Bạn có chắc muốn xóa khách hàng{" "}
                    <span className="font-semibold text-slate-900">
                        {customer.ten_kh}
                    </span>
                    ?
                    <br />
                    Hành động này không thể hoàn tác.
                </p>

                {/* BUTTON */}
                <div className="flex gap-3 justify-center">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 font-medium text-sm rounded-xl hover:bg-slate-50 transition"
                    >
                        Hủy
                    </button>

                    <button
                        onClick={onConfirm}
                        className="px-5 py-2.5 bg-red-600 text-white font-semibold text-sm rounded-xl hover:bg-red-700 shadow-sm transition"
                    >
                        Xóa khách hàng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmModal;