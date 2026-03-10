import { useNavigate, Outlet } from "react-router-dom" // Thêm Outlet ở đây
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

    const handleLogout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        navigate("/login")
    }

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                <AppSidebar />

                <SidebarInset>
                    {/* Header cố định */}
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-white justify-between">
                        <div className="flex items-center gap-2">
                            <SidebarTrigger className="-ml-1" />
                            <Separator orientation="vertical" className="mr-2 h-4" />
                        </div>

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

                    {/* Vùng nội dung động - Nơi Rooms.jsx hoặc SeatMap.jsx hiển thị */}
                    <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
                        <div className="min-h-full rounded-xl bg-white border shadow-sm p-4">
                            {/* Outlet là nơi "hứng" nội dung của các Route con */}
                            <Outlet />
                        </div>
                    </main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    )
}