import React from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ConfirmDelete = ({ isOpen, onClose, onConfirm, title, description }) => {
    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent className="rounded-2xl border-none shadow-lg">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-xl font-bold text-slate-900">
                        {title || "Xác nhận xóa?"}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-500">
                        {description || "Hành động này không thể hoàn tác. Dữ liệu sẽ bị xóa vĩnh viễn khỏi hệ thống."}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2">
                    <AlertDialogCancel onClick={onClose} className="rounded-xl border-slate-200">
                        Hủy
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className="rounded-xl bg-red-600 hover:bg-red-700 text-white"
                    >
                        Xác nhận xóa
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default ConfirmDelete;