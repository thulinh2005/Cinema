import React from "react";
import { AlertTriangle } from "lucide-react";

const DeleteConfirmModal = ({ customer, isOpen, onClose, onConfirm }) => {
    if (!isOpen || !customer) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-[400px] rounded-xl p-6 shadow-lg text-center relative">

                {/* ICON */}
                <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>

                {/* TITLE */}
                <h2 className="text-xl font-bold mb-2">Xác nhận xóa</h2>

                {/* CONTENT */}
                <p className="text-gray-600 text-sm mb-4">
                    Bạn có chắc muốn xóa khách hàng{" "}
                    <span className="font-semibold text-black">
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
                        className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
                    >
                        Hủy
                    </button>

                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Xóa khách hàng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmModal;