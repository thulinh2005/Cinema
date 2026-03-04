import { useNavigate } from "react-router-dom"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

import { AppSidebar } from "@/components/AppSidebar"

export default function Homepage() {
    const navigate = useNavigate()
    const user = JSON.parse(localStorage.getItem("user"))

    // Đăng xuất
    const handleLogout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        navigate("/login")
    }

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                {/* 1. Thanh Sidebar mẫu nằm bên trái */}
                <AppSidebar />

                {/* 2. SidebarInset là phần nội dung bên phải tự co giãn */}
                <SidebarInset>
                    {/* Header chuẩn Shadcn */}
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-white justify-between">
                        <div className="flex items-center gap-2">
                            <SidebarTrigger className="-ml-1" />
                            <Separator orientation="vertical" className="mr-2 h-4" />
                            <h1 className="text-sm font-semibold text-slate-700">Trang chủ / Bảng điều khiển</h1>
                        </div>

                        {/* Thông tin user và nút Đăng xuất */}
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium">Chào, {user?.ten_dang_nhap}</span>
                            <button
                                onClick={handleLogout}
                                className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1.5 rounded-md transition-colors"
                            >
                                Đăng xuất
                            </button>
                        </div>
                    </header>

                    {/* Nội dung trang web (Phần Grid mẫu của Shadcn) */}
                    <main className="flex flex-1 flex-col gap-4 p-4 bg-slate-50/50">
                        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                            {/* Các ô thống kê mẫu */}
                            <div className="aspect-video rounded-xl bg-white border shadow-sm flex items-center justify-center font-bold text-slate-400"> </div>
                            <div className="aspect-video rounded-xl bg-white border shadow-sm flex items-center justify-center font-bold text-slate-400"> </div>
                            <div className="aspect-video rounded-xl bg-white border shadow-sm flex items-center justify-center font-bold text-slate-400"> </div>
                        </div>

                        {/* Phần nội dung chính */}
                        <div className="min-h-[100vh] flex-1 rounded-xl bg-white border shadow-sm p-8 md:min-h-min">
                            <h2 className="text-2xl font-bold mb-4 text-purple-600"> </h2>
                            <p className="text-slate-600 leading-relaxed">

                            </p>
                        </div>
                    </main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    )
}